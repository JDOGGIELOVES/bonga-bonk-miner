import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { readBlobText, writeBlobText } from "@/lib/blob-json-store";
import { withWalletClaimLock } from "./claim-lock";

const STAKES_BLOB_PATH = "bonga-stakes/active-stakes.json";

export const DAILY_STAKE_REWARD_PER_NFT = 75; // generous "a lot of bonga" for locking up NFTs
export const MIN_STAKE_CLAIM = 10; // smallest claimable chunk to keep txs reasonable

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
  stakedCount: number;
  stakedAt: string; // ISO
  lastClaimedAt?: string; // ISO
}

export interface StakeStatus {
  record: StakeRecord | null;
  heldCount: number; // current on-chain verified (best effort)
  pendingBonga: number;
  dailyRate: number;
  canClaim: boolean;
}

function emptyStake(): StakeRecord {
  return { stakedCount: 0, stakedAt: new Date().toISOString() };
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
  if (!rec || !rec.stakedCount || rec.stakedCount <= 0) return null;
  return rec;
}

export async function saveStakeRecord(wallet: string, record: StakeRecord | null): Promise<void> {
  const all = await getAllStakes();
  if (record && record.stakedCount > 0) {
    all[wallet] = {
      stakedCount: Math.max(0, Math.floor(record.stakedCount)),
      stakedAt: record.stakedAt,
      lastClaimedAt: record.lastClaimedAt,
    };
  } else {
    delete all[wallet];
  }
  await writeStakesRecord(JSON.stringify(all));
}

/** Compute prorated pending rewards since last claim (or stake time). */
export function computePendingStakeRewards(record: StakeRecord | null | undefined): number {
  if (!record || !record.stakedCount || record.stakedCount <= 0) return 0;
  const now = Date.now();
  const start = record.lastClaimedAt ? Date.parse(record.lastClaimedAt) : Date.parse(record.stakedAt);
  if (!Number.isFinite(start)) return 0;
  const elapsedMs = Math.max(0, now - start);
  const days = elapsedMs / (24 * 60 * 60 * 1000);
  const raw = days * DAILY_STAKE_REWARD_PER_NFT * record.stakedCount;
  return Math.floor(raw);
}

export async function getStakeStatusForWallet(
  wallet: string,
  currentHeldCount: number
): Promise<StakeStatus> {
  const record = await getStakeRecord(wallet);
  // Safety clamp: never stake more than they currently hold
  let effectiveRecord = record;
  if (record && currentHeldCount >= 0 && record.stakedCount > currentHeldCount) {
    effectiveRecord = { ...record, stakedCount: currentHeldCount };
    // persist the correction
    await saveStakeRecord(wallet, effectiveRecord);
  }
  const pending = computePendingStakeRewards(effectiveRecord);
  const dailyRate = (effectiveRecord?.stakedCount || 0) * DAILY_STAKE_REWARD_PER_NFT;
  const canClaim = pending >= MIN_STAKE_CLAIM;
  return {
    record: effectiveRecord,
    heldCount: Math.max(0, currentHeldCount),
    pendingBonga: pending,
    dailyRate,
    canClaim,
  };
}

/** Set or update stake under lock to avoid races. */
export async function setStakedCount(
  wallet: string,
  newCount: number,
  currentHeld: number
): Promise<StakeRecord | null> {
  const safeCount = Math.max(0, Math.min(Math.floor(newCount), Math.max(0, currentHeld)));
  const nowIso = new Date().toISOString();

  return withWalletClaimLock(
    wallet,
    "stake-lifetime",
    async () => {
      const existing = await getStakeRecord(wallet);
      const next: StakeRecord = existing
        ? {
            stakedCount: safeCount,
            stakedAt: existing.stakedAt,
            lastClaimedAt: existing.lastClaimedAt,
          }
        : {
            stakedCount: safeCount,
            stakedAt: nowIso,
          };

      if (safeCount <= 0) {
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
      if (!existing || existing.stakedCount <= 0) return existing;

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
