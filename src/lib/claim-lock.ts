import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";

const LOCK_TTL_MS = 90_000;

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

function safeKey(wallet: string, date: string): string {
  const safe = wallet.replace(/[^a-zA-Z0-9]/g, "_");
  return `${safe}_${date}`;
}

function blobPath(wallet: string, date: string): string {
  return `bonga-claims/locks/${safeKey(wallet, date)}.json`;
}

function localPath(wallet: string, date: string): string {
  return path.join(getLocalDataDir(), `${safeKey(wallet, date)}.json`);
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

interface ClaimLockRecord {
  id: string;
  wallet: string;
  date: string;
  expiresAt: number;
}

async function readLock(wallet: string, date: string): Promise<ClaimLockRecord | null> {
  const raw = useBlobStorage()
    ? await readBlobText(blobPath(wallet, date))
    : await readFile(localPath(wallet, date), "utf8").catch(() => null);

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
    await writeBlobText(blobPath(record.wallet, record.date), text);
    return;
  }
  const filePath = localPath(record.wallet, record.date);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, text, "utf8");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Serialize claim payouts per wallet/day across serverless instances. */
export async function withWalletClaimLock<T>(
  wallet: string,
  date: string,
  fn: () => Promise<T>
): Promise<T> {
  const lockId = crypto.randomUUID();

  for (let attempt = 0; attempt < 12; attempt++) {
    const existing = await readLock(wallet, date);
    if (existing && existing.expiresAt > Date.now()) {
      await sleep(80 + attempt * 40);
      continue;
    }

    const next: ClaimLockRecord = {
      id: lockId,
      wallet,
      date,
      expiresAt: Date.now() + LOCK_TTL_MS,
    };
    await writeLock(next);
    await sleep(40);

    const verify = await readLock(wallet, date);
    if (verify?.id === lockId) {
      try {
        return await fn();
      } finally {
        const current = await readLock(wallet, date);
        if (current?.id === lockId) {
          await writeLock({ ...next, expiresAt: Date.now() - 1 });
        }
      }
    }

    await sleep(60 + attempt * 30);
  }

  throw new Error("Another claim is in progress for this wallet. Try again in a moment.");
}