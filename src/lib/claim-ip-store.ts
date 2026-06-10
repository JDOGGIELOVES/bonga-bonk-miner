import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { PET_LOVE_REWARD } from "@/lib/pet-love";
import { DAILY_BONGA_LIMIT } from "@/lib/miner-game";

export interface IpDailyRecord {
  date: string;
  ipKey: string;
  wallets: string[];
  tapCount: number;
  minerClaims: number;
  petClaims: number;
  bongaTotal: number;
  lastClaimAt: number;
  updatedAt: string;
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function maxWalletsPerIpPerDay(): number {
  return envInt("CLAIM_MAX_WALLETS_PER_IP_DAY", 3);
}

export function maxBongaPerIpPerDay(): number {
  return envInt(
    "CLAIM_MAX_BONGA_PER_IP_DAY",
    PET_LOVE_REWARD + DAILY_BONGA_LIMIT * 3
  );
}

export function maxPetClaimsPerIpPerDay(): number {
  return envInt("CLAIM_MAX_PET_CLAIMS_PER_IP_DAY", 1);
}

export function maxMinerClaimsPerIpPerDay(): number {
  return envInt("CLAIM_MAX_MINER_CLAIMS_PER_IP_DAY", 3);
}

export function minMsBetweenIpClaims(): number {
  return envInt("CLAIM_MIN_MS_BETWEEN_IP", 30_000);
}

export function maxTapsPerIpPerDay(): number {
  return envInt("CLAIM_MAX_TAPS_PER_IP_DAY", 3_500);
}

export function isIpClaimLimitsEnabled(): boolean {
  return process.env.CLAIM_IP_LIMITS_ENABLED !== "false";
}

/** Hash IP before persisting — blob records are public. */
export function ipStorageKey(ip: string): string {
  const salt = process.env.CLAIM_IP_HASH_SALT?.trim() || "bonga-claim-ip-v1";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

function blobPath(ipKey: string, date: string): string {
  return `bonga-claims/ip/${ipKey}/${date}.json`;
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
    return path.join(os.tmpdir(), "bonga-claim-ip");
  }
  return path.join(process.cwd(), ".bonga-claim-ip-data");
}

function localRecordPath(ipKey: string, date: string): string {
  return path.join(getLocalDataDir(), ipKey, `${date}.json`);
}

async function readBlobText(pathname: string): Promise<string | null> {
  const { get } = await import("@vercel/blob");
  try {
    const result = await get(pathname, { access: "public", useCache: false });
    if (result?.stream) {
      return new Response(result.stream).text();
    }
  } catch {
    return null;
  }
  return null;
}

async function writeBlobText(pathname: string, text: string): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(pathname, text, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function emptyRecord(ipKey: string, date: string): IpDailyRecord {
  return {
    date,
    ipKey,
    wallets: [],
    tapCount: 0,
    minerClaims: 0,
    petClaims: 0,
    bongaTotal: 0,
    lastClaimAt: 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function getIpDailyRecord(
  ipKey: string,
  date: string
): Promise<IpDailyRecord> {
  if (useBlobStorage()) {
    const raw = await readBlobText(blobPath(ipKey, date));
    if (raw) {
      try {
        return { ...emptyRecord(ipKey, date), ...JSON.parse(raw) };
      } catch {
        return emptyRecord(ipKey, date);
      }
    }
    return emptyRecord(ipKey, date);
  }

  const filePath = localRecordPath(ipKey, date);
  try {
    const raw = await readFile(filePath, "utf8");
    return { ...emptyRecord(ipKey, date), ...JSON.parse(raw) };
  } catch {
    return emptyRecord(ipKey, date);
  }
}

async function saveIpDailyRecord(record: IpDailyRecord): Promise<void> {
  record.updatedAt = new Date().toISOString();
  const text = `${JSON.stringify(record, null, 2)}\n`;

  if (useBlobStorage()) {
    await writeBlobText(blobPath(record.ipKey, record.date), text);
    return;
  }

  const filePath = localRecordPath(record.ipKey, record.date);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, text, "utf8");
}

function walletTracked(record: IpDailyRecord, wallet: string): boolean {
  const key = wallet.toLowerCase();
  return record.wallets.some((w) => w.toLowerCase() === key);
}

function trackWallet(record: IpDailyRecord, wallet: string): void {
  const key = wallet.toLowerCase();
  if (!walletTracked(record, key)) {
    record.wallets.push(key);
  }
}

export async function assertIpCanTap(params: {
  ipKey: string;
  wallet: string;
  date: string;
  boundIpKey?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isIpClaimLimitsEnabled()) return { ok: true };

  if (params.boundIpKey && params.boundIpKey !== params.ipKey) {
    return {
      ok: false,
      reason: "This wallet is linked to a different connection for today.",
    };
  }

  const record = await getIpDailyRecord(params.ipKey, params.date);
  const wallet = params.wallet.toLowerCase();

  if (!walletTracked(record, wallet) && record.wallets.length >= maxWalletsPerIpPerDay()) {
    return {
      ok: false,
      reason: `Daily wallet limit reached for this connection (${maxWalletsPerIpPerDay()} wallets/day).`,
    };
  }

  if (record.tapCount >= maxTapsPerIpPerDay()) {
    return { ok: false, reason: "Daily tap limit reached for this connection." };
  }

  return { ok: true };
}

export async function recordIpTap(params: {
  ipKey: string;
  wallet: string;
  date: string;
}): Promise<void> {
  if (!isIpClaimLimitsEnabled()) return;

  const record = await getIpDailyRecord(params.ipKey, params.date);
  trackWallet(record, params.wallet);
  record.tapCount += 1;
  await saveIpDailyRecord(record);
}

export async function assertIpCanClaim(params: {
  ipKey: string;
  wallet: string;
  amount: number;
  date: string;
  kind: "miner" | "pet";
  boundIpKey?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isIpClaimLimitsEnabled()) return { ok: true };

  if (params.boundIpKey && params.boundIpKey !== params.ipKey) {
    return {
      ok: false,
      reason: "Claims must use the same connection that earned today's rewards.",
    };
  }

  const record = await getIpDailyRecord(params.ipKey, params.date);
  const wallet = params.wallet.toLowerCase();
  const now = Date.now();

  if (
    record.lastClaimAt &&
    now - record.lastClaimAt < minMsBetweenIpClaims()
  ) {
    return { ok: false, reason: "Please wait before claiming again." };
  }

  if (!walletTracked(record, wallet) && record.wallets.length >= maxWalletsPerIpPerDay()) {
    return {
      ok: false,
      reason: `Daily wallet limit reached for this connection (${maxWalletsPerIpPerDay()} wallets/day).`,
    };
  }

  if (params.kind === "pet" && record.petClaims >= maxPetClaimsPerIpPerDay()) {
    return {
      ok: false,
      reason: "Pet Love claim already used from this connection today.",
    };
  }

  if (
    params.kind === "miner" &&
    record.minerClaims >= maxMinerClaimsPerIpPerDay()
  ) {
    return {
      ok: false,
      reason: "Miner claim limit reached for this connection today.",
    };
  }

  if (record.bongaTotal + params.amount > maxBongaPerIpPerDay()) {
    return {
      ok: false,
      reason: `Daily $BONGA limit reached for this connection (${maxBongaPerIpPerDay()} max).`,
    };
  }

  return { ok: true };
}

export async function recordIpClaim(params: {
  ipKey: string;
  wallet: string;
  amount: number;
  date: string;
  kind: "miner" | "pet";
}): Promise<void> {
  if (!isIpClaimLimitsEnabled()) return;

  const record = await getIpDailyRecord(params.ipKey, params.date);
  trackWallet(record, params.wallet);
  record.bongaTotal += params.amount;
  record.lastClaimAt = Date.now();
  if (params.kind === "pet") record.petClaims += 1;
  else record.minerClaims += 1;
  await saveIpDailyRecord(record);
}