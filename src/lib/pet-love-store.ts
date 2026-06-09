import { createHash } from "crypto";
import { mkdir, readFile, writeFile, readdir } from "fs/promises";
import os from "os";
import path from "path";
import {
  type PetLoveSubmission,
  todayKey,
  walletDayKey,
} from "@/lib/pet-love";

const INDEX_BLOB_PATH = "pet-love/index.json";

interface PetLoveIndex {
  submissions: PetLoveSubmission[];
  imageHashes: string[];
  petClaims: Record<string, string>;
}

function emptyIndex(): PetLoveIndex {
  return { submissions: [], imageHashes: [], petClaims: {} };
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
  return {
    submissions: data.submissions ?? [],
    imageHashes: data.imageHashes ?? [],
    petClaims: data.petClaims ?? {},
  };
}

async function readIndexFromBlob(): Promise<PetLoveIndex> {
  const { get } = await import("@vercel/blob");
  const primary = blobAccess();
  const fallback: BlobAccess = primary === "public" ? "private" : "public";

  for (const access of [primary, fallback]) {
    try {
      const result = await get(INDEX_BLOB_PATH, {
        access,
        useCache: false,
      });
      if (!result?.stream) continue;
      return parseIndex(await streamToText(result.stream));
    } catch (error) {
      console.error(`Pet Love index blob read failed (${access}):`, error);
    }
  }

  return emptyIndex();
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
  const index = await readIndex();
  return index.petClaims[walletDayKey(wallet, date)] != null;
}

export async function isImageHashUsed(hash: string): Promise<boolean> {
  const index = await readIndex();
  return index.imageHashes.includes(hash);
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
  imageBuffer: Buffer;
  contentType: string;
}): Promise<PetLoveSubmission> {
  assertStorageReady();

  const wallet = normalizeWallet(params.wallet);
  const existing = await getSubmissionForWalletToday(wallet, params.date);
  if (existing) {
    throw new Error("This wallet already shared a pet photo today.");
  }

  if (await isImageHashUsed(params.imageHash)) {
    throw new Error("This image was already submitted. One unique photo per day.");
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
    submittedAt: new Date().toISOString(),
    imagePath,
  };

  const index = await readIndex();
  index.submissions.unshift(submission);
  index.imageHashes.push(params.imageHash);
  if (index.submissions.length > 500) {
    index.submissions = index.submissions.slice(0, 500);
  }
  if (index.imageHashes.length > 1000) {
    index.imageHashes = index.imageHashes.slice(-1000);
  }
  await writeIndex(index);

  return submission;
}

export async function recordPetClaim(
  wallet: string,
  date: string,
  submissionId: string
) {
  const index = await readIndex();
  index.petClaims[walletDayKey(wallet, date)] = submissionId;
  await writeIndex(index);
}

export async function getSubmissionById(id: string): Promise<PetLoveSubmission | null> {
  const index = await readIndex();
  return index.submissions.find((s) => s.id === id) ?? null;
}

export async function listGallery(limit = 48): Promise<PetLoveSubmission[]> {
  const index = await readIndex();
  return index.submissions.slice(0, limit);
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