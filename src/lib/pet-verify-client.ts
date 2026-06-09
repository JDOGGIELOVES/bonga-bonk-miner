import {
  PET_ANIMAL_LABELS,
  PET_DETECT_MIN_SCORE,
  PET_MAX_IMAGE_BYTES,
  PET_SKIN_FULL_IMAGE_MIN,
  PET_SKIN_PIXEL_MIN,
  PET_VERIFY_HIGH_CONFIDENCE,
  PET_VERIFY_MIN_CONFIDENCE,
} from "@/lib/pet-love";

const DETECT_MAX_BOXES = 30;

export interface PetVerifyResult {
  ok: true;
  petLabel: string;
  confidence: number;
}

export interface PetVerifyFailure {
  ok: false;
  reason: string;
}

export type PetVerifyOutcome = PetVerifyResult | PetVerifyFailure;

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

async function runDetect(
  model: Detector,
  input: HTMLImageElement | HTMLCanvasElement
): Promise<CocoDetection[]> {
  return model.detect(input, DETECT_MAX_BOXES, PET_DETECT_MIN_SCORE);
}

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

function isSkinRgb(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;

  if (spread < 8 || max < 40) return false;

  return (
    (r > 55 && g > 25 && b > 12 && r >= g - 8 && spread > 10) ||
    (r > 95 && g > 40 && b > 20 && spread > 15 && r > g && r > b)
  );
}

function isSkinYCbCr(r: number, g: number, b: number): boolean {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return y > 70 && cb >= 72 && cb <= 135 && cr >= 125 && cr <= 185;
}

function isSkinPixel(r: number, g: number, b: number): boolean {
  return isSkinRgb(r, g, b) || isSkinYCbCr(r, g, b);
}

function getImagePixels(image: HTMLImageElement) {
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

function countSkinInRegion(
  frame: { width: number; height: number; pixels: Uint8ClampedArray },
  region: { x0: number; y0: number; x1: number; y1: number },
  step = 2
): number {
  const { width, height, pixels } = frame;
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

function countSkinNearPet(
  frame: { width: number; height: number; pixels: Uint8ClampedArray },
  bbox: [number, number, number, number]
): number {
  const { width, height } = frame;
  const boxX = bbox[0] * width;
  const boxY = bbox[1] * height;
  const boxW = bbox[2] * width;
  const boxH = bbox[3] * height;
  const pad = Math.max(boxW, boxH) * 0.85;

  return countSkinInRegion(frame, {
    x0: Math.max(0, Math.floor(boxX - pad)),
    y0: Math.max(0, Math.floor(boxY - pad)),
    x1: Math.min(width, Math.ceil(boxX + boxW + pad)),
    y1: Math.min(height, Math.ceil(boxY + boxH + pad)),
  });
}

function countSkinInFullImage(
  frame: { width: number; height: number; pixels: Uint8ClampedArray }
): number {
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

function filterPetHits(detections: CocoDetection[]): CocoDetection[] {
  return detections.filter(
    (d) => PET_ANIMAL_LABELS.has(d.class) && d.score >= PET_VERIFY_MIN_CONFIDENCE
  );
}

async function detectWithFallback(
  model: Detector,
  image: HTMLImageElement
): Promise<CocoDetection[]> {
  const primary = await runDetect(model, image);
  if (filterPetHits(primary).length > 0) return primary;

  const longEdge = Math.max(image.naturalWidth, image.naturalHeight);
  if (longEdge <= 1280) return primary;

  const scale = 1280 / longEdge;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return primary;

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const resized = await runDetect(model, canvas);
  return resized.length > 0 ? resized : primary;
}

function hasPersonNearby(detections: CocoDetection[]): boolean {
  return detections.some((d) => d.class === "person" && d.score >= 0.15);
}

export async function hashImageFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

  if (image.naturalWidth < 160 || image.naturalHeight < 160) {
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
    return {
      ok: false,
      reason: "On-device check failed to load. Refresh and try again.",
    };
  }

  const sortedPets = filterPetHits(detections).sort((a, b) => b.score - a.score);

  if (sortedPets.length === 0) {
    return {
      ok: false,
      reason:
        "We couldn't spot the pet — try a bit more of your dog in frame (fur, head, or body) with your hand visible.",
    };
  }

  const best = sortedPets[0];
  const personPresent = hasPersonNearby(detections);

  if (best.score >= PET_VERIFY_HIGH_CONFIDENCE) {
    return { ok: true, petLabel: best.class, confidence: best.score };
  }

  if (personPresent && best.score >= PET_VERIFY_MIN_CONFIDENCE) {
    return { ok: true, petLabel: best.class, confidence: best.score };
  }

  const frame = getImagePixels(image);
  if (!frame) {
    return { ok: false, reason: "Could not read photo pixels. Try another image." };
  }

  const skinNearPet = countSkinNearPet(frame, best.bbox);
  const skinAnywhere = countSkinInFullImage(frame);

  if (skinNearPet >= PET_SKIN_PIXEL_MIN || skinAnywhere >= PET_SKIN_FULL_IMAGE_MIN) {
    return { ok: true, petLabel: best.class, confidence: best.score };
  }

  return {
    ok: false,
    reason:
      "Almost there — include your hand touching or near your pet. Natural light helps, but you don't need your face.",
  };
}