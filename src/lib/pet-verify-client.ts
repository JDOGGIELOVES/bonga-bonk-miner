import { computeDHashFromRgba } from "@/lib/pet-image-hash";
import {
  PET_ANIMAL_LABELS,
  PET_ASSISTED_CONFIDENCE,
  PET_DETECT_MIN_SCORE,
  PET_MAX_IMAGE_BYTES,
  PET_SKIN_FULL_IMAGE_MIN,
  PET_SKIN_PIXEL_MIN,
  PET_VERIFY_HIGH_CONFIDENCE,
  PET_VERIFY_MIN_CONFIDENCE,
  PET_WEAK_DETECTION_MIN,
} from "@/lib/pet-love";

const DETECT_MAX_BOXES = 40;

export interface PetVerifyResult {
  ok: true;
  petLabel: string;
  confidence: number;
}

export interface PetVerifyAssist {
  ok: false;
  assist: true;
  reason: string;
  defaultPet: string;
  assistedConfidence: number;
}

export interface PetVerifyFailure {
  ok: false;
  assist?: false;
  reason: string;
}

export type PetVerifyOutcome =
  | PetVerifyResult
  | PetVerifyAssist
  | PetVerifyFailure;

type CocoDetection = {
  class: string;
  score: number;
  bbox: [number, number, number, number];
};

type Detector = {
  detect: (
    input: HTMLImageElement | HTMLCanvasElement,
    maxNumBoxes?: number,
    minScore?: number
  ) => Promise<CocoDetection[]>;
};

type ImageFrame = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
};

let modelPromise: Promise<Detector> | null = null;

async function loadPetDetector() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      await import("@tensorflow/tfjs-backend-webgl");
      await tf.setBackend("webgl");
      await tf.ready();
      const coco = await import("@tensorflow-models/coco-ssd");
      return coco.load({ base: "mobilenet_v2" });
    })();
  }
  return modelPromise;
}

async function runDetect(
  model: Detector,
  input: HTMLImageElement | HTMLCanvasElement
): Promise<CocoDetection[]> {
  return model.detect(input, DETECT_MAX_BOXES, PET_DETECT_MIN_SCORE);
}

function isSkinRgb(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;
  if (spread < 6 || max < 35) return false;
  return (
    (r > 50 && g > 22 && b > 10 && r >= g - 12 && spread > 8) ||
    (r > 95 && g > 40 && b > 20 && spread > 15 && r > g && r > b)
  );
}

function isSkinYCbCr(r: number, g: number, b: number): boolean {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return y > 65 && cb >= 68 && cb <= 140 && cr >= 120 && cr <= 190;
}

function isSkinPixel(r: number, g: number, b: number): boolean {
  return isSkinRgb(r, g, b) || isSkinYCbCr(r, g, b);
}

function isFurLike(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  if (avg < 30 || avg > 220 || max - min > 90) return false;

  const grayFur = Math.abs(r - g) < 22 && Math.abs(g - b) < 22 && avg > 45;
  const brownFur = r >= g - 18 && r >= b - 12 && g >= b - 25 && avg > 40 && avg < 190;
  const goldenFur = r > g && g > b && r - b > 12 && avg > 55 && avg < 210;

  return grayFur || brownFur || goldenFur;
}

function getImagePixels(image: HTMLImageElement): ImageFrame | null {
  const canvas = document.createElement("canvas");
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0);
  return { width, height, pixels: ctx.getImageData(0, 0, width, height).data };
}

function countSkinInRegion(frame: ImageFrame, region: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}, step = 2): number {
  const { width, pixels } = frame;
  let skinCount = 0;

  for (let y = region.y0; y < region.y1; y += step) {
    for (let x = region.x0; x < region.x1; x += step) {
      const index = (y * width + x) * 4;
      if (isSkinPixel(pixels[index], pixels[index + 1], pixels[index + 2])) {
        skinCount++;
      }
    }
  }

  return skinCount;
}

function countFurInFullImage(frame: ImageFrame): number {
  const { width, height, pixels } = frame;
  let furCount = 0;

  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const index = (y * width + x) * 4;
      if (isFurLike(pixels[index], pixels[index + 1], pixels[index + 2])) {
        furCount++;
      }
    }
  }

  return furCount;
}

function countSkinNearPet(
  frame: ImageFrame,
  bbox: [number, number, number, number]
): number {
  const { width, height } = frame;
  const boxX = bbox[0] * width;
  const boxY = bbox[1] * height;
  const boxW = bbox[2] * width;
  const boxH = bbox[3] * height;
  const pad = Math.max(boxW, boxH) * 1.1;

  return countSkinInRegion(frame, {
    x0: Math.max(0, Math.floor(boxX - pad)),
    y0: Math.max(0, Math.floor(boxY - pad)),
    x1: Math.min(width, Math.ceil(boxX + boxW + pad)),
    y1: Math.min(height, Math.ceil(boxY + boxH + pad)),
  });
}

function countSkinInFullImage(frame: ImageFrame): number {
  return countSkinInRegion(
    frame,
    { x0: 0, y0: 0, x1: frame.width, y1: frame.height },
    3
  );
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    image.src = url;
  });
}

function petDetections(
  detections: CocoDetection[],
  minScore = PET_VERIFY_MIN_CONFIDENCE
): CocoDetection[] {
  return detections.filter(
    (d) => PET_ANIMAL_LABELS.has(d.class) && d.score >= minScore
  );
}

function bestPetLabel(detections: CocoDetection[]): string {
  const pets = petDetections(detections, PET_WEAK_DETECTION_MIN).sort(
    (a, b) => b.score - a.score
  );
  return pets[0]?.class ?? "dog";
}

function drawToCanvas(image: HTMLImageElement, scale: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function detectWithFallback(
  model: Detector,
  image: HTMLImageElement
): Promise<CocoDetection[]> {
  const merged = new Map<string, CocoDetection>();
  const addAll = (items: CocoDetection[]) => {
    for (const item of items) {
      const key = `${item.class}:${item.bbox.map((v) => v.toFixed(2)).join(",")}`;
      const existing = merged.get(key);
      if (!existing || item.score > existing.score) merged.set(key, item);
    }
  };

  addAll(await runDetect(model, image));

  const longEdge = Math.max(image.naturalWidth, image.naturalHeight);

  if (longEdge > 1280) {
    const downscaled = drawToCanvas(image, 1280 / longEdge);
    if (downscaled) addAll(await runDetect(model, downscaled));
  }

  if (longEdge < 960) {
    const upscale = drawToCanvas(image, Math.min(2, 960 / longEdge));
    if (upscale) addAll(await runDetect(model, upscale));
  }

  return Array.from(merged.values());
}

function hasPerson(detections: CocoDetection[]): boolean {
  return detections.some((d) => d.class === "person" && d.score >= 0.08);
}

function assistOutcome(reason: string, defaultPet: string): PetVerifyAssist {
  return {
    ok: false,
    assist: true,
    reason,
    defaultPet,
    assistedConfidence: PET_ASSISTED_CONFIDENCE,
  };
}

function pass(label: string, confidence: number): PetVerifyResult {
  return {
    ok: true,
    petLabel: label,
    confidence: Math.max(confidence, PET_ASSISTED_CONFIDENCE),
  };
}

export async function hashImageFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function computePerceptualHashFromFile(
  file: File
): Promise<string | null> {
  let image: HTMLImageElement;
  try {
    image = await fileToImage(file);
  } catch {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 9;
  canvas.height = 8;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0, 9, 8);
  const { data } = ctx.getImageData(0, 0, 9, 8);
  return computeDHashFromRgba(9, 8, data, 4);
}

export async function verifyPetPhotoOnDevice(file: File): Promise<PetVerifyOutcome> {
  if (!file.type.startsWith("image/")) {
    return { ok: false, reason: "Please choose a photo (JPG or PNG)." };
  }

  if (file.size > PET_MAX_IMAGE_BYTES) {
    return { ok: false, reason: "Photo must be under 6 MB." };
  }

  let image: HTMLImageElement;
  try {
    image = await fileToImage(file);
  } catch {
    return { ok: false, reason: "Could not load that photo." };
  }

  if (image.naturalWidth < 120 || image.naturalHeight < 120) {
    return {
      ok: false,
      reason: "Photo is a bit too small — try a closer shot of your hand and pet.",
    };
  }

  let detections: CocoDetection[];
  try {
    const model = await loadPetDetector();
    detections = await detectWithFallback(model, image);
  } catch {
    return assistOutcome(
      "Auto-check could not load. You can still confirm your pet type below if this is a hand-petting photo.",
      "dog"
    );
  }

  const frame = getImagePixels(image);
  const skinAnywhere = frame ? countSkinInFullImage(frame) : 0;
  const furAnywhere = frame ? countFurInFullImage(frame) : 0;
  const personPresent = hasPerson(detections);
  const sortedPets = petDetections(detections).sort((a, b) => b.score - a.score);
  const weakPets = petDetections(detections, PET_WEAK_DETECTION_MIN).sort(
    (a, b) => b.score - a.score
  );
  const suggestedPet = bestPetLabel(detections);

  if (sortedPets.length > 0) {
    const best = sortedPets[0];
    if (best.score >= PET_VERIFY_HIGH_CONFIDENCE) {
      return pass(best.class, best.score);
    }
    if (personPresent || skinAnywhere >= PET_SKIN_FULL_IMAGE_MIN) {
      return pass(best.class, best.score);
    }
    if (frame && countSkinNearPet(frame, best.bbox) >= PET_SKIN_PIXEL_MIN) {
      return pass(best.class, best.score);
    }
  }

  if (weakPets.length > 0 && (personPresent || skinAnywhere >= 12 || furAnywhere >= 18)) {
    return pass(weakPets[0].class, weakPets[0].score);
  }

  if (personPresent && skinAnywhere >= 12) {
    return pass(suggestedPet, PET_ASSISTED_CONFIDENCE);
  }

  if (skinAnywhere >= PET_SKIN_FULL_IMAGE_MIN && furAnywhere >= 18) {
    return pass(suggestedPet, PET_ASSISTED_CONFIDENCE);
  }

  if (skinAnywhere >= 14 || furAnywhere >= 28 || personPresent) {
    return assistOutcome(
      "Close-up pet photos are tricky for auto-detect. If this shows your hand petting your pet, pick the pet type below and share.",
      suggestedPet
    );
  }

  return assistOutcome(
    "We couldn't auto-verify this one. If it's your hand petting a pet, choose the pet type below to continue.",
    "dog"
  );
}