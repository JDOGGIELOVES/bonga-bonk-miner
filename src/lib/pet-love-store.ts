import { createHash } from "crypto";
import { mkdir, readFile, writeFile, readdir } from "fs/promises";
import path from "path";
import {
  type PetLoveSubmission,
  todayKey,
  walletDayKey,
} from "@/lib/pet-love";

const DATA_DIR = path.join(process.cwd(), ".pet-love-data");
const INDEX_PATH = path.join(DATA_DIR, "index.json");
const IMAGES_DIR = path.join(DATA_DIR, "images");

interface PetLoveIndex {
  submissions: PetLoveSubmission[];
  imageHashes: string[];
  petClaims: Record<string, string>;
}

function normalizeWallet(wallet: string): string {
  return wallet.trim();
}

function walletsMatch(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function ensureDirs() {
  await mkdir(IMAGES_DIR, { recursive: true });
}

async function readIndex(): Promise<PetLoveIndex> {
  try {
    const raw = await readFile(INDEX_PATH, "utf8");
    const data = JSON.parse(raw) as PetLoveIndex;
    return {
      submissions: data.submissions ?? [],
      imageHashes: data.imageHashes ?? [],
      petClaims: data.petClaims ?? {},
    };
  } catch {
    return { submissions: [], imageHashes: [], petClaims: {} };
  }
}

async function writeIndex(index: PetLoveIndex) {
  await ensureDirs();
  await writeFile(INDEX_PATH, JSON.stringify(index, null, 2), "utf8");
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
  if (!blobEnabled()) return null;

  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(
      `pet-love/${params.id}.${params.ext}`,
      params.imageBuffer,
      {
        access: "public",
        contentType: params.contentType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }
    );
    return blob.url;
  } catch (error) {
    console.error("Pet Love blob upload failed:", error);
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
  const wallet = normalizeWallet(params.wallet);
  const existing = await getSubmissionForWalletToday(wallet, params.date);
  if (existing) {
    throw new Error("This wallet already shared a pet photo today.");
  }

  if (await isImageHashUsed(params.imageHash)) {
    throw new Error("This image was already submitted. One unique photo per day.");
  }

  await ensureDirs();
  const id = newSubmissionId();
  const ext = params.contentType.includes("png") ? "png" : "jpg";
  const blobUrl = await saveImageBlob({
    id,
    ext,
    imageBuffer: params.imageBuffer,
    contentType: params.contentType,
  });

  if (!blobUrl) {
    const filename = `${id}.${ext}`;
    const filePath = path.join(IMAGES_DIR, filename);
    await writeFile(filePath, params.imageBuffer);
  }

  const submission: PetLoveSubmission = {
    id,
    wallet,
    date: params.date,
    petLabel: params.petLabel,
    confidence: params.confidence,
    imageHash: params.imageHash,
    submittedAt: new Date().toISOString(),
    imagePath: blobUrl ?? `/api/pet/image/${id}`,
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

export async function recordPetClaim(wallet: string, date: string, submissionId: string) {
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
    return { buffer: Buffer.alloc(0), contentType: "image/jpeg", redirectUrl: submission.imagePath };
  }

  const files = await readdir(IMAGES_DIR).catch(() => [] as string[]);
  const match = files.find((f) => f.startsWith(id));
  if (!match) return null;

  const buffer = await readFile(path.join(IMAGES_DIR, match));
  const contentType = match.endsWith(".png") ? "image/png" : "image/jpeg";
  return { buffer, contentType };
}