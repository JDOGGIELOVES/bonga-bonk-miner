import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";

const TALLY_BLOB_PATH = "bonga-claims/global-tally.json";

export interface GlobalClaimTally {
  totalBonga: number;
  claimCount: number;
  updatedAt: string;
}

function emptyTally(): GlobalClaimTally {
  return { totalBonga: 0, claimCount: 0, updatedAt: new Date().toISOString() };
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

type BlobAccess = "public" | "private";

function blobAccess(): BlobAccess {
  const configured = process.env.BLOB_DEFAULT_ACCESS?.trim().toLowerCase();
  if (configured === "private" || configured === "public") return configured;
  return "public";
}

function getLocalDataDir(): string {
  if (isVercelRuntime()) {
    return path.join(os.tmpdir(), "bonga-claim-tally");
  }
  return path.join(process.cwd(), ".bonga-claim-data");
}

function localRecordPath(relative: string): string {
  return path.join(getLocalDataDir(), relative);
}

async function streamToText(
  stream: ReadableStream<Uint8Array> | NodeJS.ReadableStream
): Promise<string> {
  if ("getReader" in stream) {
    return new Response(stream).text();
  }

  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer | Uint8Array | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readBlobText(pathname: string): Promise<string | null> {
  const { get, head } = await import("@vercel/blob");
  const primary = blobAccess();
  const fallback: BlobAccess = primary === "public" ? "private" : "public";

  for (const access of [primary, fallback]) {
    try {
      const result = await get(pathname, { access, useCache: false });
      if (result?.stream) {
        return streamToText(result.stream);
      }
    } catch (error) {
      // 400/404 are common when the tally blob hasn't been written yet (first claim creates it)
      // or due to transient store config during deploys. Only log real problems.
      const msg = error instanceof Error ? error.message : String(error);
      if (!/400 Bad Request|404|not found|does not exist/i.test(msg)) {
        console.error(`Claim tally blob get failed (${pathname}, ${access}):`, error);
      }
    }

    try {
      const meta = await head(pathname);
      const response = await fetch(meta.url, { cache: "no-store" });
      if (response.ok) {
        return response.text();
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (!/400|404|not found/i.test(msg)) {
        console.error(`Claim tally blob head failed (${pathname}):`, error);
      }
    }
  }

  return null;
}

async function readRecord(pathname: string): Promise<string | null> {
  if (useBlobStorage()) {
    return readBlobText(pathname);
  }

  try {
    return await readFile(localRecordPath(pathname), "utf8");
  } catch {
    return null;
  }
}

async function writeRecord(pathname: string, body: string): Promise<void> {
  if (useBlobStorage()) {
    const { put } = await import("@vercel/blob");
    await put(pathname, body, {
      access: blobAccess(),
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }

  const filePath = localRecordPath(pathname);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body, "utf8");
}

function parseTally(raw: string): GlobalClaimTally {
  const data = JSON.parse(raw) as Partial<GlobalClaimTally>;
  return {
    totalBonga: Math.max(0, Number(data.totalBonga) || 0),
    claimCount: Math.max(0, Number(data.claimCount) || 0),
    updatedAt:
      typeof data.updatedAt === "string"
        ? data.updatedAt
        : new Date().toISOString(),
  };
}

export async function getGlobalClaimTally(): Promise<GlobalClaimTally> {
  const raw = await readRecord(TALLY_BLOB_PATH);
  if (!raw) {
    // Bootstrap the tally blob on first read (e.g. before any claims have been made).
    // This prevents repeated 400 "blob not found" errors from Vercel Blob on every poll.
    const empty = emptyTally();
    try {
      await writeRecord(TALLY_BLOB_PATH, JSON.stringify(empty));
    } catch (e) {
      // If write fails (e.g. no blob creds yet), just return empty for now.
      console.error("Failed to bootstrap claim tally blob:", e);
    }
    return empty;
  }

  try {
    return parseTally(raw);
  } catch (error) {
    console.error("Claim tally parse failed:", error);
    return emptyTally();
  }
}

export async function recordGlobalClaim(amount: number): Promise<GlobalClaimTally> {
  const safeAmount = Math.max(0, Math.floor(amount));
  if (safeAmount <= 0) {
    return getGlobalClaimTally();
  }

  const current = await getGlobalClaimTally();
  const next: GlobalClaimTally = {
    totalBonga: current.totalBonga + safeAmount,
    claimCount: current.claimCount + 1,
    updatedAt: new Date().toISOString(),
  };

  await writeRecord(TALLY_BLOB_PATH, JSON.stringify(next));
  return next;
}