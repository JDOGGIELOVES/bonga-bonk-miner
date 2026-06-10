import { createHash } from "crypto";
import { mkdir, readFile, writeFile, readdir } from "fs/promises";
import os from "os";
import path from "path";
import {
  findClosestPhash,
  getPetPhashMaxDistance,
  isPetDuplicateCheckEnabled,
} from "@/lib/pet-image-hash";
import {
  getPetMaxDailyClaimsTotal,
  type PetLoveSubmission,
  todayKey,
  walletDayKey,
} from "@/lib/pet-love";

const INDEX_BLOB_PATH = "pet-love/index.json";

interface PetLoveIndex {
  submissions: PetLoveSubmission[];
  imageHashes: string[];
  imagePhashes: string[];
  petClaims: Record<string, string>;
}

function emptyIndex(): PetLoveIndex {
  return { submissions: [], imageHashes: [], imagePhashes: [], petClaims: {} };
}

function normalizeWallet(wallet: string): string {
  return wallet.trim();
}

function walletsMatch(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function envFlag(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

export function getPetLoveStorageStatus() {
  const blobToken = envFlag("BLOB_READ_WRITE_TOKEN");
  const blobStoreId = envFlag("BLOB_STORE_ID");
  const oidcEnv = envFlag("VERCEL_OIDC_TOKEN");
  const vercel = isVercelRuntime();
  // On Vercel, @vercel/blob also reads x-vercel-oidc-token per request.
  const oidcReady = blobStoreId && (oidcEnv || vercel);
  return {
    vercel,
    blobToken,
    blobStoreId,
    oidcEnv,
    oidcHeaderFallback: vercel && blobStoreId && !oidcEnv,
    oidcReady,
    storageReady: vercel ? blobToken || oidcReady : true,
    mode: useBlobStorage() ? "blob" : "local",
  };
}

function hasBlobCredentials(): boolean {
  if (envFlag("BLOB_READ_WRITE_TOKEN")) return true;
  if (!envFlag("BLOB_STORE_ID")) return false;
  // Vercel injects OIDC via x-vercel-oidc-token at request time.
  if (isVercelRuntime()) return true;
  return envFlag("VERCEL_OIDC_TOKEN");
}

function useBlobStorage(): boolean {
  if (isVercelRuntime()) {
    return hasBlobCredentials();
  }
  return envFlag("BLOB_READ_WRITE_TOKEN");
}

function getLocalDataDir(): string {
  if (isVercelRuntime()) {
    return path.join(os.tmpdir(), "pet-love-data");
  }
  return path.join(process.cwd(), ".pet-love-data");
}

function getLocalIndexPath(): string {
  return path.join(getLocalDataDir(), "index.json");
}

function getLocalImagesDir(): string {
  return path.join(getLocalDataDir(), "images");
}

type BlobAccess = "public" | "private";

function blobAccess(): BlobAccess {
  const configured = process.env.BLOB_DEFAULT_ACCESS?.trim().toLowerCase();
  if (configured === "private" || configured === "public") {
    return configured;
  }
  return "public";
}

function storageConfigMessage(): string {
  return (
    "Pet Love storage is not configured on Vercel. In Dashboard → Storage → Blob, connect your store to this project (OIDC), or set BLOB_READ_WRITE_TOKEN, then redeploy Production."
  );
}

function assertStorageReady() {
  if (isVercelRuntime() && !hasBlobCredentials()) {
    throw new Error(storageConfigMessage());
  }
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

function parseIndex(raw: string): PetLoveIndex {
  const data = JSON.parse(raw) as PetLoveIndex;
  const submissions = data.submissions ?? [];
  const imageHashes = data.imageHashes ?? [];
  const imagePhashes =
    data.imagePhashes ??
    submissions
      .map((submission) => submission.perceptualHash)
      .filter((hash): hash is string => Boolean(hash));
  return {
    submissions,
    imageHashes,
    imagePhashes,
    petClaims: data.petClaims ?? {},
  };
}

async function readBlobText(pathname: string): Promise<string | null> {
  const { get, head } = await import("@vercel/blob");
  const primary = blobAccess();
  const fallback: BlobAccess = primary === "public" ? "private" : "public";

  for (const access of [primary, fallback]) {
    try {
      const result = await get(pathname, {
        access,
        useCache: false,
      });
      if (result?.stream) {
        return streamToText(result.stream);
      }
    } catch (error) {
      console.error(`Pet Love blob get failed (${pathname}, ${access}):`, error);
    }

    try {
      const meta = await head(pathname);
      const response = await fetch(meta.url, { cache: "no-store" });
      if (response.ok) {
        return response.text();
      }
    } catch (error) {
      console.error(`Pet Love blob head failed (${pathname}, ${access}):`, error);
    }
  }

  return null;
}

async function readIndexFromBlob(): Promise<PetLoveIndex> {
  const raw = await readBlobText(INDEX_BLOB_PATH);
  if (!raw) return emptyIndex();
  try {
    return parseIndex(raw);
  } catch (error) {
    console.error("Pet Love index blob parse failed:", error);
    return emptyIndex();
  }
}

async function writeIndexToBlob(index: PetLoveIndex): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(INDEX_BLOB_PATH, JSON.stringify(index), {
    access: blobAccess(),
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function ensureLocalDirs() {
  await mkdir(getLocalImagesDir(), { recursive: true });
}

async function readIndexFromDisk(): Promise<PetLoveIndex> {
  try {
    const raw = await readFile(getLocalIndexPath(), "utf8");
    return parseIndex(raw);
  } catch {
    return emptyIndex();
  }
}

async function writeIndexToDisk(index: PetLoveIndex) {
  await ensureLocalDirs();
  await writeFile(getLocalIndexPath(), JSON.stringify(index, null, 2), "utf8");
}

async function readIndex(): Promise<PetLoveIndex> {
  if (useBlobStorage()) {
    return readIndexFromBlob();
  }
  return readIndexFromDisk();
}

async function writeIndex(index: PetLoveIndex) {
  assertStorageReady();
  if (useBlobStorage()) {
    try {
      await writeIndexToBlob(index);
      return;
    } catch (error) {
      console.error("Pet Love index blob write failed:", error);
      throw new Error(storageConfigMessage());
    }
  }
  await writeIndexToDisk(index);
}

function submissionRecordPath(id: string): string {
  return `pet-love/submissions/${id}.json`;
}

function walletDayRecordPath(wallet: string, date: string): string {
  return `pet-love/by-wallet/${wallet.toLowerCase()}/${date}.json`;
}

function claimRecordPath(wallet: string, date: string): string {
  return `pet-love/claims/${wallet.toLowerCase()}/${date}.json`;
}

function localRecordPath(relative: string): string {
  return path.join(getLocalDataDir(), relative);
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

async function persistSubmissionRecord(submission: PetLoveSubmission): Promise<void> {
  await writeRecord(submissionRecordPath(submission.id), JSON.stringify(submission));
  await writeRecord(
    walletDayRecordPath(submission.wallet, submission.date),
    JSON.stringify({ submissionId: submission.id })
  );
}

async function readSubmissionRecord(id: string): Promise<PetLoveSubmission | null> {
  const raw = await readRecord(submissionRecordPath(id));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PetLoveSubmission;
  } catch {
    return null;
  }
}

async function readWalletDaySubmissionId(
  wallet: string,
  date: string
): Promise<string | null> {
  const raw = await readRecord(walletDayRecordPath(wallet, date));
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as { submissionId?: string };
    return data.submissionId ?? null;
  } catch {
    return null;
  }
}

function newSubmissionId(): string {
  return `pet_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function hashImageBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export function toPublicGalleryItem(
  submission: PetLoveSubmission
): Omit<PetLoveSubmission, "wallet" | "confidence" | "imageHash"> {
  return {
    id: submission.id,
    date: submission.date,
    petLabel: submission.petLabel,
    submittedAt: submission.submittedAt,
    imagePath: submission.imagePath,
  };
}

export async function getSubmissionForWalletToday(
  wallet: string,
  date = todayKey()
): Promise<PetLoveSubmission | null> {
  const sidecarId = await readWalletDaySubmissionId(wallet, date);
  if (sidecarId) {
    const record = await readSubmissionRecord(sidecarId);
    if (
      record &&
      walletsMatch(record.wallet, wallet) &&
      record.date === date
    ) {
      return record;
    }
  }

  const index = await readIndex();
  return (
    index.submissions.find(
      (s) => walletsMatch(s.wallet, wallet) && s.date === date
    ) ?? null
  );
}

export async function hasClaimedPetRewardToday(
  wallet: string,
  date = todayKey()
): Promise<boolean> {
  if (await readRecord(claimRecordPath(wallet, date))) {
    return true;
  }

  const index = await readIndex();
  return index.petClaims[walletDayKey(wallet, date)] != null;
}

export async function isImageHashUsed(hash: string): Promise<boolean> {
  const index = await readIndex();
  return index.imageHashes.includes(hash);
}

export interface PetImageDuplicateResult {
  duplicate: boolean;
  exact: boolean;
  similar: boolean;
  distance?: number;
  reason?: string;
}

export async function checkImageDuplicate(params: {
  imageHash?: string;
  perceptualHash?: string;
}): Promise<PetImageDuplicateResult> {
  const index = await readIndex();

  if (params.imageHash && index.imageHashes.includes(params.imageHash)) {
    return {
      duplicate: true,
      exact: true,
      similar: false,
      reason:
        "This exact photo was already submitted. Please share a new hand-and-pet moment.",
    };
  }

  if (
    !isPetDuplicateCheckEnabled() ||
    !params.perceptualHash ||
    index.imagePhashes.length === 0
  ) {
    return { duplicate: false, exact: false, similar: false };
  }

  const closest = findClosestPhash(
    params.perceptualHash,
    index.imagePhashes,
    getPetPhashMaxDistance()
  );

  if (!closest) {
    return { duplicate: false, exact: false, similar: false };
  }

  return {
    duplicate: true,
    exact: false,
    similar: true,
    distance: closest.distance,
    reason:
      "This photo looks too similar to one already shared (stock or duplicate image). Please upload your own original hand-and-pet photo.",
  };
}

async function saveImageBlob(params: {
  id: string;
  ext: string;
  imageBuffer: Buffer;
  contentType: string;
}): Promise<string | null> {
  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(
      `pet-love/images/${params.id}.${params.ext}`,
      params.imageBuffer,
      {
        access: blobAccess(),
        contentType: params.contentType,
        addRandomSuffix: false,
      }
    );
    return blob.url;
  } catch (error) {
    console.error("Pet Love image blob upload failed:", error);
    return null;
  }
}

export async function savePetSubmission(params: {
  wallet: string;
  date: string;
  petLabel: string;
  confidence: number;
  imageHash: string;
  perceptualHash?: string;
  ipKey?: string;
  imageBuffer: Buffer;
  contentType: string;
}): Promise<PetLoveSubmission> {
  assertStorageReady();

  const wallet = normalizeWallet(params.wallet);
  const existing = await getSubmissionForWalletToday(wallet, params.date);
  if (existing) {
    throw new Error("This wallet already shared a pet photo today.");
  }

  const duplicateCheck = await checkImageDuplicate({
    imageHash: params.imageHash,
    perceptualHash: params.perceptualHash,
  });
  if (duplicateCheck.duplicate) {
    throw new Error(
      duplicateCheck.reason ??
        "This image was already submitted. One unique photo per day."
    );
  }

  const id = newSubmissionId();
  const ext = params.contentType.includes("png") ? "png" : "jpg";
  let imagePath: string | null = null;

  if (useBlobStorage()) {
    imagePath = await saveImageBlob({
      id,
      ext,
      imageBuffer: params.imageBuffer,
      contentType: params.contentType,
    });
    if (!imagePath) {
      throw new Error(storageConfigMessage());
    }
  } else {
    await ensureLocalDirs();
    const filename = `${id}.${ext}`;
    await writeFile(path.join(getLocalImagesDir(), filename), params.imageBuffer);
    imagePath = `/api/pet/image/${id}`;
  }

  const submission: PetLoveSubmission = {
    id,
    wallet,
    date: params.date,
    petLabel: params.petLabel,
    confidence: params.confidence,
    imageHash: params.imageHash,
    perceptualHash: params.perceptualHash,
    ipKey: params.ipKey,
    submittedAt: new Date().toISOString(),
    imagePath,
  };

  const index = await readIndex();
  index.submissions.unshift(submission);
  index.imageHashes.push(params.imageHash);
  if (params.perceptualHash) {
    index.imagePhashes.push(params.perceptualHash);
  }
  if (index.submissions.length > 2000) {
    index.submissions = index.submissions.slice(0, 2000);
  }
  if (index.imageHashes.length > 1000) {
    index.imageHashes = index.imageHashes.slice(-1000);
  }
  if (index.imagePhashes.length > 1000) {
    index.imagePhashes = index.imagePhashes.slice(-1000);
  }

  await persistSubmissionRecord(submission);
  await writeIndex(index);

  return submission;
}

export async function recordPetClaim(
  wallet: string,
  date: string,
  submissionId: string
) {
  await writeRecord(
    claimRecordPath(wallet, date),
    JSON.stringify({
      submissionId,
      claimedAt: new Date().toISOString(),
    })
  );

  try {
    const index = await readIndex();
    index.petClaims[walletDayKey(wallet, date)] = submissionId;
    await writeIndex(index);
  } catch (error) {
    console.error("Pet Love claim index update failed:", error);
  }
}

export async function getSubmissionById(id: string): Promise<PetLoveSubmission | null> {
  const record = await readSubmissionRecord(id);
  if (record) return record;

  const index = await readIndex();
  return index.submissions.find((s) => s.id === id) ?? null;
}

function mergeSubmissionRecords(
  target: Map<string, PetLoveSubmission>,
  records: PetLoveSubmission[]
): void {
  for (const record of records) {
    target.set(record.id, record);
  }
}

async function listSubmissionsFromBlobPrefix(
  prefix: string,
  maxRecords: number
): Promise<PetLoveSubmission[]> {
  if (!useBlobStorage()) return [];

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix, limit: maxRecords });
    const submissions: PetLoveSubmission[] = [];

    for (const blob of blobs) {
      const id = blob.pathname
        .replace(prefix, "")
        .replace(/\.json$/, "");
      const record = await readSubmissionRecord(id);
      if (record) submissions.push(record);
    }

    return submissions;
  } catch (error) {
    console.error(`Pet Love blob list failed (${prefix}):`, error);
    return [];
  }
}

async function listWalletSubmissionIds(wallet: string): Promise<string[]> {
  const walletKey = wallet.toLowerCase();
  const prefix = `pet-love/by-wallet/${walletKey}/`;
  const ids: string[] = [];

  if (useBlobStorage()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix, limit: 500 });
      for (const blob of blobs) {
        const raw = await readRecord(blob.pathname);
        if (!raw) continue;
        try {
          const data = JSON.parse(raw) as { submissionId?: string };
          if (data.submissionId) ids.push(data.submissionId);
        } catch {
          // skip malformed sidecar
        }
      }
    } catch (error) {
      console.error("Pet Love wallet history list failed:", error);
    }
    return ids;
  }

  const dir = localRecordPath(`pet-love/by-wallet/${walletKey}`);
  const files = await readdir(dir).catch(() => [] as string[]);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await readFile(path.join(dir, file), "utf8");
      const data = JSON.parse(raw) as { submissionId?: string };
      if (data.submissionId) ids.push(data.submissionId);
    } catch {
      // skip
    }
  }

  return ids;
}

export async function listGallery(limit = 96): Promise<PetLoveSubmission[]> {
  const byId = new Map<string, PetLoveSubmission>();
  mergeSubmissionRecords(byId, (await readIndex()).submissions);

  if (byId.size < limit) {
    const fromBlob = await listSubmissionsFromBlobPrefix(
      "pet-love/submissions/",
      Math.max(limit * 3, 120)
    );
    mergeSubmissionRecords(byId, fromBlob);
  }

  return Array.from(byId.values())
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, limit);
}

/** All photos shared by a wallet (one per UTC day), newest first. */
export async function listWalletPastUploads(
  wallet: string,
  limit = 90
): Promise<PetLoveSubmission[]> {
  const normalized = normalizeWallet(wallet);
  const byId = new Map<string, PetLoveSubmission>();

  for (const submission of (await readIndex()).submissions) {
    if (walletsMatch(submission.wallet, normalized)) {
      byId.set(submission.id, submission);
    }
  }

  const sidecarIds = await listWalletSubmissionIds(normalized);
  for (const id of sidecarIds) {
    if (byId.has(id)) continue;
    const record = await readSubmissionRecord(id);
    if (record && walletsMatch(record.wallet, normalized)) {
      byId.set(record.id, record);
    }
  }

  return Array.from(byId.values())
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.submittedAt.localeCompare(a.submittedAt)
    )
    .slice(0, limit);
}

function dailyClaimCountPath(date: string): string {
  return `pet-love/daily-claim-count/${date}.json`;
}

export async function getPetDailyClaimCount(date: string): Promise<number> {
  const raw = await readRecord(dailyClaimCountPath(date));
  if (!raw) return 0;

  try {
    const data = JSON.parse(raw) as { count?: number };
    return Math.max(0, Number(data.count) || 0);
  } catch {
    return 0;
  }
}

export async function assertPetDailyClaimCapacity(
  date: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const max = getPetMaxDailyClaimsTotal();
  if (max == null) return { ok: true };

  const count = await getPetDailyClaimCount(date);
  if (count >= max) {
    return {
      ok: false,
      reason: `Pet Love daily payout cap reached (${max} claims/day site-wide). Try again tomorrow (UTC).`,
    };
  }

  return { ok: true };
}

export async function recordPetDailyGlobalClaim(date: string): Promise<number> {
  const count = await getPetDailyClaimCount(date);
  const next = count + 1;
  await writeRecord(
    dailyClaimCountPath(date),
    JSON.stringify({
      date,
      count: next,
      updatedAt: new Date().toISOString(),
    })
  );
  return next;
}

export async function getPetDailyClaimCapStatus(date: string): Promise<{
  enabled: boolean;
  claimsToday: number;
  maxClaims: number | null;
  capReached: boolean;
}> {
  const maxClaims = getPetMaxDailyClaimsTotal();
  const claimsToday = await getPetDailyClaimCount(date);
  return {
    enabled: maxClaims != null,
    claimsToday,
    maxClaims,
    capReached: maxClaims != null && claimsToday >= maxClaims,
  };
}

export async function readSubmissionImage(id: string): Promise<{
  buffer: Buffer;
  contentType: string;
  redirectUrl?: string;
} | null> {
  const submission = await getSubmissionById(id);
  if (!submission) return null;

  if (submission.imagePath.startsWith("http")) {
    return {
      buffer: Buffer.alloc(0),
      contentType: "image/jpeg",
      redirectUrl: submission.imagePath,
    };
  }

  const files = await readdir(getLocalImagesDir()).catch(() => [] as string[]);
  const match = files.find((f) => f.startsWith(id));
  if (!match) return null;

  const buffer = await readFile(path.join(getLocalImagesDir(), match));
  const contentType = match.endsWith(".png") ? "image/png" : "image/jpeg";
  return { buffer, contentType };
}