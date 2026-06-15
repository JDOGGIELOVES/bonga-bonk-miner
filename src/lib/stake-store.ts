import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { readBlobText, writeBlobText } from "@/lib/blob-json-store";
import { withWalletClaimLock } from "./claim-lock";
import { STAKE_RATES, type RarityTier } from "@/lib/nft-collection";

const STAKES_BLOB_PATH = "bonga-stakes/active-stakes.json";

export const MIN_STAKE_CLAIM = 10; // smallest amount for auto-deposit to Bonga Bank Vault. $BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches 10,000 $BONGA.

function envFlag(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

function hasBlobCredentials(): boolean {
  if (envFlag("BLOB_READ_WRITE_TOKEN")) return true;
  if (!envFlag("BLOB_STORE_ID")) return false;
  if (isVercelRuntime()) return true;
  return envFlag("VERCEL_OIDC_TOKEN");
}

function useBlobStorage(): boolean {
  if (isVercelRuntime()) return hasBlobCredentials();
  return envFlag("BLOB_READ_WRITE_TOKEN");
}

function getLocalDataDir(): string {
  if (isVercelRuntime()) {
    return path.join(os.tmpdir(), "bonga-stakes");
  }
  return path.join(process.cwd(), ".bonga-stakes");
}

function localStakesPath(): string {
  return path.join(getLocalDataDir(), "active-stakes.json");
}

async function readStakesRecord(): Promise<string | null> {
  if (useBlobStorage()) {
    return readBlobText(STAKES_BLOB_PATH);
  }
  try {
    return await readFile(localStakesPath(), "utf8");
  } catch {
    return null;
  }
}

async function writeStakesRecord(body: string): Promise<void> {
  if (useBlobStorage()) {
    const { put } = await import("@vercel/blob");
    await put(STAKES_BLOB_PATH, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }
  const filePath = localStakesPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body, "utf8");
}

export interface StakeRecord {
  // Tiered staking: number of each rarity locked. Keys are RarityTier.
  staked: Record<string, number>;
  stakedAt: string; // ISO
  lastClaimedAt?: string; // ISO
}

export interface StakeStatus {
  record: StakeRecord | null;
  heldCount: number; // total current on-chain verified
  heldByRarity: Record<string, number>;
  stakedByRarity: Record<string, number>;
  pendingBonga: number;
  dailyRate: number;
  canClaim: boolean;
}

function emptyStake(): StakeRecord {
  return { staked: {}, stakedAt: new Date().toISOString() };
}

export function getDailyStakeRate(staked: Record<string, number>): number {
  let total = 0;
  for (const [tier, count] of Object.entries(staked || {})) {
    const rate = (STAKE_RATES as Record<RarityTier, number>)[tier as RarityTier] || 0;
    total += Math.max(0, Math.floor(count || 0)) * rate;
  }
  return total;
}

function parseStakes(raw: string): Record<string, StakeRecord> {
  try {
    const data = JSON.parse(raw);
    if (data && typeof data === "object") return data as Record<string, StakeRecord>;
  } catch {
    /* ignore */
  }
  return {};
}

export async function getAllStakes(): Promise<Record<string, StakeRecord>> {
  const raw = await readStakesRecord();
  if (!raw) return {};
  return parseStakes(raw);
}

export async function getStakeRecord(wallet: string): Promise<StakeRecord | null> {
  const all = await getAllStakes();
  const rec = all[wallet];
  if (!rec || !rec.staked || Object.values(rec.staked).every((c) => (c || 0) <= 0)) return null;
  return rec;
}

export async function saveStakeRecord(wallet: string, record: StakeRecord | null): Promise<void> {
  const all = await getAllStakes();
  const hasStake = record && record.staked && Object.values(record.staked).some((c) => (c || 0) > 0);
  if (hasStake) {
    const clean: Record<string, number> = {};
    for (const [tier, c] of Object.entries(record!.staked || {})) {
      const num = Math.max(0, Math.floor(c || 0));
      if (num > 0) clean[tier] = num;
    }
    all[wallet] = {
      staked: clean,
      stakedAt: record!.stakedAt,
      lastClaimedAt: record!.lastClaimedAt,
    };
  } else {
    delete all[wallet];
  }
  await writeStakesRecord(JSON.stringify(all));
}

/** Compute prorated pending rewards since last claim (or stake time). */
export function computePendingStakeRewards(record: StakeRecord | null | undefined): number {
  if (!record || !record.staked) return 0;
  const dailyRate = getDailyStakeRate(record.staked);
  if (dailyRate <= 0) return 0;
  const now = Date.now();
  const start = record.lastClaimedAt ? Date.parse(record.lastClaimedAt) : Date.parse(record.stakedAt);
  if (!Number.isFinite(start)) return 0;
  const elapsedMs = Math.max(0, now - start);
  const days = elapsedMs / (24 * 60 * 60 * 1000);
  const raw = days * dailyRate;
  return Math.floor(raw);
}

export async function getStakeStatusForWallet(
  wallet: string,
  currentHeldCount: number,
  heldByRarity: Record<string, number> = {}
): Promise<StakeStatus> {
  const record = await getStakeRecord(wallet);
  // Safety clamp per tier — only clamp if we actually detected holdings (prevents transient detection failures from wiping stakes)
  let effectiveRecord = record;
  if (record) {
    const totalDetectedHeld = Object.values(heldByRarity || {}).reduce((sum, c) => sum + (c || 0), 0);

    if (totalDetectedHeld > 0) {
      const clamped: Record<string, number> = {};
      let needsSave = false;
      for (const [tier, count] of Object.entries(record.staked || {})) {
        const held = heldByRarity[tier] || 0;
        const safe = Math.min(count || 0, held);
        clamped[tier] = safe;
        if (safe !== count) needsSave = true;
      }
      if (needsSave || Object.keys(clamped).length !== Object.keys(record.staked || {}).length) {
        effectiveRecord = { ...record, staked: clamped };
        await saveStakeRecord(wallet, effectiveRecord);
      }
    } else {
      // Detection returned 0 held (possible transient RPC/metadata fetch issue) — preserve the existing staked record
      effectiveRecord = record;
    }
  }

  const stakedByRarity = effectiveRecord?.staked || {};
  const pending = computePendingStakeRewards(effectiveRecord);
  const dailyRate = getDailyStakeRate(stakedByRarity);
  const canClaim = pending >= MIN_STAKE_CLAIM;

  const totalStaked = Object.values(stakedByRarity).reduce((s, c) => s + (c || 0), 0);

  return {
    record: effectiveRecord,
    heldCount: Math.max(0, currentHeldCount),
    heldByRarity,
    stakedByRarity,
    pendingBonga: pending,
    dailyRate,
    canClaim,
  };
}

/** Set or update stake tiers under lock. desiredTiers is { "Common": 2, "Rare": 1, ... } */
export async function setStakedTiers(
  wallet: string,
  desiredTiers: Record<string, number>,
  currentHeldByRarity: Record<string, number>
): Promise<StakeRecord | null> {
  const nowIso = new Date().toISOString();

  return withWalletClaimLock(
    wallet,
    "stake-lifetime",
    async () => {
      const existing = await getStakeRecord(wallet);

      const nextStaked: Record<string, number> = {};
      for (const tier of ["Common", "Rare", "Legendary", "Cosmic Bonga"] as const) {
        const desired = Math.max(0, Math.floor(desiredTiers[tier] || 0));
        const held = currentHeldByRarity[tier] || 0;
        const safe = Math.min(desired, held);
        if (safe > 0) nextStaked[tier] = safe;
      }

      const next: StakeRecord = existing
        ? {
            staked: nextStaked,
            stakedAt: existing.stakedAt,
            lastClaimedAt: existing.lastClaimedAt,
          }
        : {
            staked: nextStaked,
            stakedAt: nowIso,
          };

      const hasAny = Object.keys(nextStaked).length > 0;
      if (!hasAny) {
        await saveStakeRecord(wallet, null);
        return null;
      }

      await saveStakeRecord(wallet, next);
      return next;
    },
    "stake"
  );
}

/** Record a successful stake rewards claim and advance the timer. Returns new pending (should be near 0). */
export async function recordStakeClaim(wallet: string, claimedAmount: number): Promise<StakeRecord | null> {
  const safe = Math.max(0, Math.floor(claimedAmount));
  if (safe <= 0) return getStakeRecord(wallet);

  return withWalletClaimLock(
    wallet,
    "stake-lifetime",
    async () => {
      const existing = await getStakeRecord(wallet);
      const hasStake = existing && existing.staked && Object.values(existing.staked).some((c) => (c || 0) > 0);
      if (!hasStake) return existing;

      const nowIso = new Date().toISOString();
      const updated: StakeRecord = {
        ...existing,
        lastClaimedAt: nowIso,
      };
      await saveStakeRecord(wallet, updated);
      return updated;
    },
    "stake"
  );
}
