/** Bonga Pet Love — hand + pet photos, one upload per wallet per day. */

export const PET_LOVE_REWARD = 100;

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

/** Passed to COCO-SSD detect() — default SDK min is 0.5 which rejects most phone photos. */
export const PET_DETECT_MIN_SCORE = 0.08;

/** Minimum model score to count as a pet (kept lenient for close-up phone photos). */
export const PET_VERIFY_MIN_CONFIDENCE = 0.12;

/** Strong pet detection — skin check optional above this score. */
export const PET_VERIFY_HIGH_CONFIDENCE = 0.38;

/** Minimum skin pixels near the pet bbox. */
export const PET_SKIN_PIXEL_MIN = 24;

/** Fallback: skin pixels anywhere in the frame. */
export const PET_SKIN_FULL_IMAGE_MIN = 36;

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