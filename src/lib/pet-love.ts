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

export const PET_TYPE_OPTIONS = [
  "dog",
  "cat",
  "bird",
  "horse",
  "sheep",
  "cow",
  "bear",
  "elephant",
  "zebra",
  "giraffe",
] as const;

/** Passed to COCO-SSD detect() — default SDK min is 0.5 which rejects most phone photos. */
export const PET_DETECT_MIN_SCORE = 0.05;

/** Minimum model score to count as a confident pet. */
export const PET_VERIFY_MIN_CONFIDENCE = 0.1;

/** Weak hint from the model — used with hand/fur fallbacks. */
export const PET_WEAK_DETECTION_MIN = 0.04;

/** Confidence stored when the user confirms a close-up the model missed. */
export const PET_ASSISTED_CONFIDENCE = 0.12;

/** Strong pet detection — skin check optional above this score. */
export const PET_VERIFY_HIGH_CONFIDENCE = 0.32;

/** Minimum skin pixels near the pet bbox. */
export const PET_SKIN_PIXEL_MIN = 16;

/** Fallback: skin pixels anywhere in the frame. */
export const PET_SKIN_FULL_IMAGE_MIN = 20;

export const PET_MAX_IMAGE_BYTES = 6 * 1024 * 1024;

export interface PetLoveSubmission {
  id: string;
  wallet: string;
  date: string;
  petLabel: string;
  confidence: number;
  imageHash: string;
  /** 64-bit dHash hex — catches near-duplicate / stock photo reuse */
  perceptualHash?: string;
  /** Hashed client IP — one submit + one claim per connection per day */
  ipKey?: string;
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

/** Pet Love payouts paused unless PET_LOVE_CLAIMS_PAUSED=false in Vercel. */
export function isPetLoveClaimsPaused(): boolean {
  if (process.env.CLAIMS_PAUSED === "true") return true;
  return process.env.PET_LOVE_CLAIMS_PAUSED !== "false";
}

/** Site-wide Pet Love claim count cap per UTC day (unset or 0 = no cap). */
export function getPetMaxDailyClaimsTotal(): number | null {
  const raw = process.env.PET_MAX_DAILY_CLAIMS_TOTAL?.trim();
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.floor(value);
}