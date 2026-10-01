import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { readBlobText, writeBlobText } from "@/lib/blob-json-store";
import { withWalletClaimLock } from "@/lib/claim-lock";
import {
  monthlyRewardForStake,
  previousUtcMonthKey,
  utcMonthKey,
} from "@/lib/coin-stake";

const BLOB_PATH = "bonga-coin-stake/positions.json";

export type CoinStakeRecord = {
  wallet: string;
  /** Soft-locked $BONGA amount (must still be held in wallet to settle). */
  stakedAmount: number;
  stakedAt: string; // ISO
  /** Last YYYY-MM for which a monthly reward was paid. */
  lastSettledMonth: string | null;
  lifetimeRewarded: number;
  updatedAt: string;
};

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
    return path.join(os.tmpdir(), "bonga-coin-stake");
  }
  return path.join(process.cwd(), ".bonga-coin-stake");
}

function localPath(): string {
  return path.join(getLocalDataDir(), "positions.json");
}

async function readAll(): Promise<Record<string, CoinStakeRecord>> {
  if (useBlobStorage()) {
    const raw = await readBlobText(BLOB_PATH);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, CoinStakeRecord>;
    } catch {
      return {};
    }
  }
  try {
    const raw = await readFile(localPath(), "utf8");
    return JSON.parse(raw) as Record<string, CoinStakeRecord>;
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, CoinStakeRecord>): Promise<void> {
  const payload = JSON.stringify(all);
  if (useBlobStorage()) {
    await writeBlobText(BLOB_PATH, payload);
    return;
  }
  await mkdir(getLocalDataDir(), { recursive: true });
  await writeFile(localPath(), payload, "utf8");
}

export async function getCoinStake(wallet: string): Promise<CoinStakeRecord | null> {
  const all = await readAll();
  const rec = all[wallet.trim()];
  if (!rec || !(rec.stakedAmount > 0)) return null;
  return rec;
}

/** Aggregate-only stats (no wallet addresses). */
export async function getCoinStakeStats(): Promise<{
  walletsInFile: number;
  activeStakers: number;
  totalStakedBonga: number;
  apr25pctWallets: number;
  apr7pctWallets: number;
}> {
  const all = await readAll();
  const entries = Object.values(all || {});
  const active = entries.filter((r) => r && Number(r.stakedAmount) > 0);
  const totalStakedBonga = active.reduce(
    (s, r) => s + Number(r.stakedAmount || 0),
    0
  );
  return {
    walletsInFile: entries.length,
    activeStakers: active.length,
    totalStakedBonga: Math.floor(totalStakedBonga * 1e6) / 1e6,
    apr25pctWallets: active.filter((r) => Number(r.stakedAmount) <= 1_000_000)
      .length,
    apr7pctWallets: active.filter((r) => Number(r.stakedAmount) > 1_000_000)
      .length,
  };
}

export async function setCoinStake(
  wallet: string,
  amount: number
): Promise<CoinStakeRecord> {
  const normalized = wallet.trim();
  return withWalletClaimLock(normalized, "coin-stake-set", async () => {
    const all = await readAll();
    const prev = all[normalized];
    const now = new Date().toISOString();
    const safe = Math.max(0, Math.floor(amount * 1e6) / 1e6);
    if (safe <= 0) {
      delete all[normalized];
      await writeAll(all);
      return {
        wallet: normalized,
        stakedAmount: 0,
        stakedAt: now,
        lastSettledMonth: prev?.lastSettledMonth ?? null,
        lifetimeRewarded: prev?.lifetimeRewarded ?? 0,
        updatedAt: now,
      };
    }
    const rec: CoinStakeRecord = {
      wallet: normalized,
      stakedAmount: safe,
      // New/increased stake: keep original stakedAt if increasing; reset if fresh
      stakedAt: prev && prev.stakedAmount > 0 ? prev.stakedAt : now,
      lastSettledMonth: prev?.lastSettledMonth ?? null,
      lifetimeRewarded: prev?.lifetimeRewarded ?? 0,
      updatedAt: now,
    };
    // If reducing stake mid-cycle, keep lastSettledMonth; forfeits current month by leaving early on unlock
    all[normalized] = rec;
    await writeAll(all);
    return rec;
  });
}

export async function clearCoinStake(wallet: string): Promise<void> {
  const normalized = wallet.trim();
  await withWalletClaimLock(normalized, "coin-stake-clear", async () => {
    const all = await readAll();
    delete all[normalized];
    await writeAll(all);
  });
}

export type CoinStakeSettlement = {
  paid: boolean;
  month: string | null;
  reward: number;
  record: CoinStakeRecord | null;
  reason?: string;
};

/**
 * Pay the previous UTC month's reward if still staked and not yet settled.
 * Caller must verify on-chain balance >= stakedAmount before calling.
 */
export async function settlePreviousMonthIfDue(
  wallet: string,
  opts?: { now?: Date }
): Promise<CoinStakeSettlement> {
  const normalized = wallet.trim();
  const now = opts?.now ?? new Date();
  const prev = previousUtcMonthKey(now);

  return withWalletClaimLock(normalized, "coin-stake-settle", async () => {
    const all = await readAll();
    const rec = all[normalized];
    if (!rec || !(rec.stakedAmount > 0)) {
      return { paid: false, month: null, reward: 0, record: null, reason: "not_staked" };
    }

    // Must have been staked before previous month ended (i.e. before current month start)
    const stakedAtMs = Date.parse(rec.stakedAt);
    const currentStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
    if (!Number.isFinite(stakedAtMs) || stakedAtMs >= currentStart) {
      return {
        paid: false,
        month: prev,
        reward: 0,
        record: rec,
        reason: "staked_after_month",
      };
    }

    if (rec.lastSettledMonth && rec.lastSettledMonth >= prev) {
      return {
        paid: false,
        month: prev,
        reward: 0,
        record: rec,
        reason: "already_settled",
      };
    }

    const reward = monthlyRewardForStake(rec.stakedAmount);
    if (reward <= 0) {
      return { paid: false, month: prev, reward: 0, record: rec, reason: "zero_reward" };
    }

    rec.lastSettledMonth = prev;
    rec.lifetimeRewarded = (rec.lifetimeRewarded || 0) + reward;
    rec.updatedAt = now.toISOString();
    all[normalized] = rec;
    await writeAll(all);

    return { paid: true, month: prev, reward, record: rec };
  });
}

export function previewCurrentMonthReward(stakedAmount: number): number {
  return monthlyRewardForStake(stakedAmount);
}

export function currentCycleInfo(now = new Date()) {
  const month = utcMonthKey(now);
  const nextMonthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return {
    month,
    previousMonth: previousUtcMonthKey(now),
    endsAtIso: new Date(nextMonthStart).toISOString(),
    msRemaining: Math.max(0, nextMonthStart - now.getTime()),
  };
}
