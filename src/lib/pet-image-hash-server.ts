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