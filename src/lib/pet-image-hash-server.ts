import {
  computeDHashFromGray9x8,
  computeDHashFromRgba,
} from "@/lib/pet-image-hash";

export async function computePerceptualHashFromBuffer(
  buffer: Buffer
): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    const { data, info } = await sharp(buffer)
      .rotate()
      .resize(9, 8, { fit: "fill" })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (info.width === 9 && info.height === 8 && info.channels === 1) {
      return computeDHashFromGray9x8(data);
    }

    return computeDHashFromRgba(info.width, info.height, data, info.channels);
  } catch (error) {
    console.error("Pet Love perceptual hash failed:", error);
    return null;
  }
}

/**
 * Basic heuristic to help flag obvious stock / old / AI / screen-capture images vs casual phone photos.
 * Relaxed to support real user uploads (many phones strip EXIF on share/edit).
 * Only hard-rejects on explicit pre-2026-04-01 date.
 * Returns score and reasons; submit uses higher threshold now.
 */
export async function analyzeImageForStockishness(buffer: Buffer): Promise<{
  likelyStock: boolean;
  score: number;
  reasons: string[];
}> {
  const reasons: string[] = [];
  let score = 0;
  let exifDate: string | null = null;

  const PET_IMAGE_CUTOFF = new Date('2026-04-01T00:00:00Z');

  try {
    const sharp = (await import("sharp")).default;
    const metadata = await sharp(buffer).metadata();

    // Common stock photo traits
    if (metadata.width && metadata.height) {
      const ratio = metadata.width / metadata.height;
      // Very common stock ratios (4:3, 16:9, 1:1, 3:2)
      if ([1, 1.333, 1.5, 1.777].some((r) => Math.abs(ratio - r) < 0.05)) {
        score += 15;
        reasons.push("Common stock aspect ratio");
      }
      // Very high res for casual phone pet photo
      if (metadata.width * metadata.height > 8_000_000) {
        score += 10;
        reasons.push("Unusually high resolution for a casual pet snap");
      }
    }

    // Try to extract DateTimeOriginal from JPEG EXIF (basic scan, no full parser)
    exifDate = extractExifDateTimeOriginal(buffer);
    if (exifDate) {
      const photoDate = new Date(exifDate);
      if (photoDate < PET_IMAGE_CUTOFF) {
        score += 70; // Very high penalty — must be recent original
        reasons.push(`Photo creation date ${photoDate.toISOString().slice(0,10)} is before required cutoff of 2026-04-01. Only images taken on/after April 1, 2026 are accepted for Pet Love.`);
      } else if (photoDate > new Date()) {
        score += 20;
        reasons.push("Suspicious future date in EXIF");
      }
    } else {
      // Relaxed for real user photos: many phone uploads strip EXIF for privacy or during sharing/editing.
      // Do not auto-reject on missing EXIF alone. Low penalty, rely on other signals (noise, ratios, AI detection).
      score += 15;
      reasons.push("No EXIF DateTimeOriginal found (common on casual phone photos after upload/editing). Additional signals used to assess originality.");
    }

    // Very low noise / high "cleanness" heuristic via sharp stats (if available)
    try {
      const stats = await sharp(buffer).stats();
      // Low std dev in channels can indicate processed/stock
      const avgStd = (stats.channels || []).reduce((s, c: any) => s + (c.stdev || 0), 0) / 3;
      if (avgStd < 20) {
        score += 15;
        reasons.push("Unusually uniform/low-noise image (typical of stock photography)");
      }
    } catch {}

  } catch (e) {
    // ignore analysis errors
  }

  // Hard reject ONLY on confirmed pre-cutoff date.
  // Missing EXIF (very common for real phone uploads) or common ratios alone no longer force stock.
  // Higher bar overall to keep Pet Love usable for casual owner photos.
  const hasInvalidOldDate = reasons.some(r => r.includes('before required cutoff') || r.includes('before 2026-04-01'));
  const likelyStock = hasInvalidOldDate;  // only reject on confirmed old dates; other heuristics too noisy for real photos
  return { likelyStock, score: Math.min(100, score), reasons };
}

function extractExifDateTimeOriginal(buffer: Buffer): string | null {
  // Very lightweight scan for JPEG APP1 EXIF DateTimeOriginal (no full EXIF lib)
  // Looks for the ASCII string "DateTimeOriginal" followed by typical EXIF value format
  try {
    if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null; // not JPEG
    let i = 2;
    while (i < buffer.length - 4) {
      if (buffer[i] === 0xff && buffer[i + 1] === 0xe1) { // APP1
        const len = (buffer[i + 2] << 8) | buffer[i + 3];
        const segment = buffer.slice(i + 4, i + 4 + len);
        const str = segment.toString("ascii");
        const match = str.match(/DateTimeOriginal\0+([0-9]{4}:[0-9]{2}:[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})/);
        if (match) return match[1].replace(/:/g, "-").replace(" ", "T");
      }
      i += 1;
    }
  } catch {}
  return null;
}