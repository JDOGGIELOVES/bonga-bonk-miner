import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { readBlobText, writeBlobText } from "@/lib/blob-json-store";
import {
  DAILY_BONGA_LIMIT,
  TAPS_PER_BONGA,
} from "@/lib/miner-game";

const MIN_TAP_INTERVAL_MS = 45;
const MAX_TAPS_PER_DAY = TAPS_PER_BONGA * DAILY_BONGA_LIMIT;

export interface MinerEarnRecord {
  wallet: string;
  date: string;
  taps: number;
  claimed: number;
  lastTapAt: number;
  /** Hashed client IP — wallet locked to first connection of the day. */
  ipKey?: string;
  updatedAt: string;
}

function blobPath(wallet: string, date: string): string {
  const safe = wallet.replace(/[^a-zA-Z0-9]/g, "_");
  return `bonga-miner/earned/${safe}/${date}.json`;
}

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
    return path.join(os.tmpdir(), "bonga-miner-earn");
  }
  return path.join(process.cwd(), ".bonga-miner-data");
}

function localRecordPath(wallet: string, date: string): string {
  const safe = wallet.replace(/[^a-zA-Z0-9]/g, "_");
  return path.join(getLocalDataDir(), safe, `${date}.json`);
}

function emptyRecord(wallet: string, date: string): MinerEarnRecord {
  return {
    wallet,
    date,
    taps: 0,
    claimed: 0,
    lastTapAt: 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function getMinerEarnRecord(
  wallet: string,
  date: string
): Promise<MinerEarnRecord> {
  const normalized = wallet.trim();

  if (useBlobStorage()) {
    const raw = await readBlobText(blobPath(normalized, date));
    if (raw) {
      try {
        return { ...emptyRecord(normalized, date), ...JSON.parse(raw) };
      } catch {
        return emptyRecord(normalized, date);
      }
    }
    return emptyRecord(normalized, date);
  }

  const filePath = localRecordPath(normalized, date);
  try {
    const raw = await readFile(filePath, "utf8");
    return { ...emptyRecord(normalized, date), ...JSON.parse(raw) };
  } catch {
    return emptyRecord(normalized, date);
  }
}

async function saveMinerEarnRecord(record: MinerEarnRecord): Promise<void> {
  record.updatedAt = new Date().toISOString();
  const text = `${JSON.stringify(record, null, 2)}\n`;

  if (useBlobStorage()) {
    await writeBlobText(blobPath(record.wallet, record.date), text);
    return;
  }

  const filePath = localRecordPath(record.wallet, record.date);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, text, "utf8");
}

export function earnedBongaFromTaps(taps: number): number {
  return Math.min(DAILY_BONGA_LIMIT, Math.floor(taps / TAPS_PER_BONGA));
}

export function claimableFromRecord(record: MinerEarnRecord): number {
  const earned = earnedBongaFromTaps(record.taps);
  return Math.max(0, earned - record.claimed);
}

export async function registerServerTap(params: {
  wallet: string;
  date: string;
  tapIndex: number;
  ipKey?: string;
  now?: number;
}): Promise<
  | { ok: true; record: MinerEarnRecord }
  | { ok: false; reason: string; record: MinerEarnRecord }
> {
  const { wallet, date, tapIndex, ipKey } = params;
  const now = params.now ?? Date.now();
  const record = await getMinerEarnRecord(wallet, date);

  if (ipKey) {
    if (record.ipKey && record.ipKey !== ipKey) {
      return {
        ok: false,
        reason: "This wallet is linked to a different connection for today.",
        record,
      };
    }
    if (!record.ipKey) {
      record.ipKey = ipKey;
    }
  }

  if (tapIndex !== record.taps + 1) {
    return {
      ok: false,
      reason: `Invalid tap sequence. Expected ${record.taps + 1}, got ${tapIndex}.`,
      record,
    };
  }

  if (record.taps >= MAX_TAPS_PER_DAY) {
    return { ok: false, reason: "Daily tap limit reached.", record };
  }

  if (record.lastTapAt && now - record.lastTapAt < MIN_TAP_INTERVAL_MS) {
    return { ok: false, reason: "Tap too fast.", record };
  }

  record.taps += 1;
  record.lastTapAt = now;
  await saveMinerEarnRecord(record);

  return { ok: true, record };
}

export async function recordMinerClaim(
  wallet: string,
  date: string,
  amount: number
): Promise<MinerEarnRecord> {
  const record = await getMinerEarnRecord(wallet, date);
  record.claimed += amount;
  await saveMinerEarnRecord(record);
  return record;
}

export async function rollbackMinerClaim(
  wallet: string,
  date: string,
  amount: number
): Promise<MinerEarnRecord> {
  const record = await getMinerEarnRecord(wallet, date);
  record.claimed = Math.max(0, record.claimed - amount);
  await saveMinerEarnRecord(record);
  return record;
}

export function isMinerEarnStorageReady(): boolean {
  if (isVercelRuntime()) return hasBlobCredentials();
  return true;
}