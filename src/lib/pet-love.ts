/** Bonga Pet Love — hand + pet photos, one upload per wallet per day. */

export const PET_LOVE_REWARD = 10;

export const PET_LOVE_DOMAIN = "Bonga Pet Love";

/** COCO-SSD labels we treat as pets (all types welcome). */
export const PET_ANIMAL_LABELS = new Set([
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
]);

export const PET_VERIFY_MIN_CONFIDENCE = 0.35;

export const PET_SKIN_PIXEL_MIN = 120;

export const PET_MAX_IMAGE_BYTES = 6 * 1024 * 1024;

export interface PetLoveSubmission {
  id: string;
  wallet: string;
  date: string;
  petLabel: string;
  confidence: number;
  imageHash: string;
  submittedAt: string;
  /** Relative API path or blob URL for gallery */
  imagePath: string;
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function walletDayKey(wallet: string, date = todayKey()): string {
  return `${wallet.toLowerCase()}:${date}`;
}