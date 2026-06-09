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

function blobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim();
}

function useBlobStorage(): boolean {
  return Boolean(blobToken());
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
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

function assertStorageReady() {
  if (isVercelRuntime() && !useBlobStorage()) {
    throw new Error(
      "Pet Love storage is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel project settings, then redeploy."
    );
  }
}

async function readIndexFromBlob(): Promise<PetLoveIndex> {
  const token = blobToken();
  if (!token) return emptyIndex();

  try {
    const { list } = await import("@vercel/blob");
    const result = await list({ prefix: INDEX_BLOB_PATH, token });
    const blob = result.blobs.find((item) => item.pathname === INDEX_BLOB_PATH);
    if (!blob) return emptyIndex();

    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) return emptyIndex();

    const data = JSON.parse(await response.text()) as PetLoveIndex;
    return {
      submissions: data.submissions ?? [],
      imageHashes: data.imageHashes ?? [],
      petClaims: data.petClaims ?? {},
    };
  } catch (error) {
    console.error("Pet Love index blob read failed:", error);
    return emptyIndex();
  }
}

async function writeIndexToBlob(index: PetLoveIndex): Promise<void> {
  const token = blobToken();
  if (!token) {
    throw new Error(
      "Pet Love storage is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel."
    );
  }

  const { del, list, put } = await import("@vercel/blob");
  const existing = await list({ prefix: INDEX_BLOB_PATH, token });
  for (const blob of existing.blobs) {
    if (blob.pathname === INDEX_BLOB_PATH) {
      await del(blob.url, { token });
    }
  }

  await put(INDEX_BLOB_PATH, JSON.stringify(index), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    token,
  });
}

async function ensureLocalDirs() {
  await mkdir(getLocalImagesDir(), { recursive: true });
}

async function readIndexFromDisk(): Promise<PetLoveIndex> {
  try {
    const raw = await readFile(getLocalIndexPath(), "utf8");
    const data = JSON.parse(raw) as PetLoveIndex;
    return {
      submissions: data.submissions ?? [],
      imageHashes: data.imageHashes ?? [],
      petClaims: data.petClaims ?? {},
    };
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
    await writeIndexToBlob(index);
    return;
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
  const token = blobToken();
  if (!token) return null;

  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(
      `pet-love/images/${params.id}.${params.ext}`,
      params.imageBuffer,
      {
        access: "public",
        contentType: params.contentType,
        addRandomSuffix: false,
        token,
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
  const blobUrl = await saveImageBlob({
    id,
    ext,
    imageBuffer: params.imageBuffer,
    contentType: params.contentType,
  });

  let imagePath = blobUrl;
  if (!imagePath) {
    if (isVercelRuntime()) {
      throw new Error(
        "Pet Love image storage failed. Ensure BLOB_READ_WRITE_TOKEN is set in Vercel."
      );
    }
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