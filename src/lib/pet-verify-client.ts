import {
  PET_ANIMAL_LABELS,
  PET_MAX_IMAGE_BYTES,
  PET_SKIN_PIXEL_MIN,
  PET_VERIFY_MIN_CONFIDENCE,
} from "@/lib/pet-love";

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

let modelPromise: Promise<{
  detect: (input: HTMLImageElement | HTMLCanvasElement) => Promise<CocoDetection[]>;
}> | null = null;

async function loadPetDetector() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      await import("@tensorflow/tfjs-backend-webgl");
      await tf.setBackend("webgl");
      await tf.ready();
      const coco = await import("@tensorflow-models/coco-ssd");
      return coco.load({ base: "lite_mobilenet_v2" });
    })();
  }
  return modelPromise;
}

function isSkinTone(r: number, g: number, b: number): boolean {
  return (
    r > 95 &&
    g > 40 &&
    b > 20 &&
    Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
    Math.abs(r - g) > 15 &&
    r > g &&
    r > b
  );
}

function countSkinNearPet(
  image: HTMLImageElement,
  bbox: [number, number, number, number]
): number {
  const canvas = document.createElement("canvas");
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, width, height).data;

  const boxX = bbox[0] * width;
  const boxY = bbox[1] * height;
  const boxW = bbox[2] * width;
  const boxH = bbox[3] * height;
  const pad = Math.max(boxW, boxH) * 0.4;

  const x0 = Math.max(0, Math.floor(boxX - pad));
  const y0 = Math.max(0, Math.floor(boxY - pad));
  const x1 = Math.min(width, Math.ceil(boxX + boxW + pad));
  const y1 = Math.min(height, Math.ceil(boxY + boxH + pad));

  let skinCount = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const index = (y * width + x) * 4;
      if (isSkinTone(pixels[index], pixels[index + 1], pixels[index + 2])) {
        skinCount++;
      }
    }
  }

  return skinCount;
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

  if (image.naturalWidth < 200 || image.naturalHeight < 200) {
    return {
      ok: false,
      reason: "Photo is too small — crop in closer on your hand and pet.",
    };
  }

  let detections: CocoDetection[];
  try {
    const model = await loadPetDetector();
    detections = await model.detect(image);
  } catch {
    return {
      ok: false,
      reason: "On-device check failed to load. Refresh and try again.",
    };
  }

  const petHits = detections
    .filter(
      (d) =>
        PET_ANIMAL_LABELS.has(d.class) && d.score >= PET_VERIFY_MIN_CONFIDENCE
    )
    .sort((a, b) => b.score - a.score);

  if (petHits.length === 0) {
    return {
      ok: false,
      reason:
        "No pet detected. Frame your hand petting a cat, dog, bird, or any animal friend.",
    };
  }

  const best = petHits[0];
  const skinPixels = countSkinNearPet(image, best.bbox);

  if (skinPixels < PET_SKIN_PIXEL_MIN) {
    return {
      ok: false,
      reason:
        "Show your hand near the pet — a gentle petting pose helps. Faces are optional; hands are not.",
    };
  }

  return {
    ok: true,
    petLabel: best.class,
    confidence: best.score,
  };
}