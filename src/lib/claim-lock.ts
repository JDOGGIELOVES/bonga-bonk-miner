import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { readBlobText, writeBlobText } from "@/lib/blob-json-store";

const LOCK_TTL_MS = 45_000;
const MAX_WAIT_MS = 50_000;

export type ClaimLockKind = "miner" | "garden" | "pet" | "tally" | "stake" | "bank" | "bank-deposit" | "bank-withdraw";

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
    return path.join(os.tmpdir(), "bonga-claim-locks");
  }
  return path.join(process.cwd(), ".bonga-claim-locks");
}

function safeKey(wallet: string, date: string, kind: ClaimLockKind): string {
  const safe = wallet.replace(/[^a-zA-Z0-9]/g, "_");
  return `${kind}_${safe}_${date}`;
}

function blobPath(wallet: string, date: string, kind: ClaimLockKind): string {
  return `bonga-claims/locks/${safeKey(wallet, date, kind)}.json`;
}

function localPath(wallet: string, date: string, kind: ClaimLockKind): string {
  return path.join(getLocalDataDir(), `${safeKey(wallet, date, kind)}.json`);
}

interface ClaimLockRecord {
  id: string;
  wallet: string;
  date: string;
  kind: ClaimLockKind;
  expiresAt: number;
}

async function readLock(
  wallet: string,
  date: string,
  kind: ClaimLockKind
): Promise<ClaimLockRecord | null> {
  const raw = useBlobStorage()
    ? await readBlobText(blobPath(wallet, date, kind))
    : await readFile(localPath(wallet, date, kind), "utf8").catch(() => null);

  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClaimLockRecord;
  } catch {
    return null;
  }
}

async function writeLock(record: ClaimLockRecord): Promise<void> {
  const text = `${JSON.stringify(record)}\n`;
  if (useBlobStorage()) {
    await writeBlobText(blobPath(record.wallet, record.date, record.kind), text);
    return;
  }
  const filePath = localPath(record.wallet, record.date, record.kind);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, text, "utf8");
}

async function releaseLock(record: ClaimLockRecord): Promise<void> {
  try {
    await writeLock({ ...record, expiresAt: Date.now() - 1 });
  } catch {
    /* best effort */
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function lockIsActive(record: ClaimLockRecord | null): record is ClaimLockRecord {
  return Boolean(record && record.expiresAt > Date.now());
}

/** Serialize claim payouts per wallet/day/kind across serverless instances. */
export async function withWalletClaimLock<T>(
  wallet: string,
  date: string,
  fn: () => Promise<T>,
  kind: ClaimLockKind = "miner"
): Promise<T> {
  const lockId = crypto.randomUUID();
  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    const existing = await readLock(wallet, date, kind);

    if (lockIsActive(existing)) {
      const waitMs = Math.min(existing.expiresAt - Date.now() + 50, 2_500);
      await sleep(waitMs);
      continue;
    }

    const next: ClaimLockRecord = {
      id: lockId,
      wallet,
      date,
      kind,
      expiresAt: Date.now() + LOCK_TTL_MS,
    };

    try {
      await writeLock(next);
    } catch {
      await sleep(200);
      continue;
    }

    let acquired = false;
    for (let readAttempt = 0; readAttempt < 8; readAttempt++) {
      await sleep(40 + readAttempt * 30);
      const verify = await readLock(wallet, date, kind);
      if (verify?.id === lockId) {
        acquired = true;
        break;
      }
      // Blob read-back can lag on private stores — trust our write after several tries.
      if (!verify && readAttempt >= 5) {
        acquired = true;
        break;
      }
    }

    if (!acquired) {
      await releaseLock(next);
      await sleep(120);
      continue;
    }

    try {
      return await fn();
    } finally {
      await releaseLock(next);
    }
  }

  throw new Error("Another claim is in progress for this wallet. Try again in a moment.");
}