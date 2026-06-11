import { NextResponse } from "next/server";
import { PET_MAX_IMAGE_BYTES } from "@/lib/pet-love";
import { computePerceptualHashFromBuffer, analyzeImageForStockishness } from "@/lib/pet-image-hash-server";
import {
  checkImageDuplicate,
  hashImageBuffer,
} from "@/lib/pet-love-store";
import { isPetDuplicateCheckEnabled } from "@/lib/pet-image-hash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const imageHash = String(form.get("imageHash") ?? "").trim();
    const perceptualHash = String(form.get("perceptualHash") ?? "").trim();
    const image = form.get("image");

    let resolvedHash = imageHash;
    let resolvedPhash = perceptualHash;

    if (image instanceof File) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json({ error: "Image must be JPG or PNG." }, { status: 400 });
      }

      if (image.size > PET_MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: "Image must be under 6 MB." }, { status: 400 });
      }

      const imageBuffer = Buffer.from(await image.arrayBuffer());
      resolvedHash = hashImageBuffer(imageBuffer);
      if (isPetDuplicateCheckEnabled()) {
        resolvedPhash = (await computePerceptualHashFromBuffer(imageBuffer)) ?? "";
      }
    }

    if (!resolvedHash) {
      return NextResponse.json({ error: "imageHash or image file required." }, { status: 400 });
    }

    if (imageHash && resolvedHash !== imageHash) {
      return NextResponse.json({ error: "Image hash mismatch." }, { status: 400 });
    }

    if (
      perceptualHash &&
      resolvedPhash &&
      perceptualHash.toLowerCase() !== resolvedPhash.toLowerCase()
    ) {
      return NextResponse.json({ error: "Perceptual hash mismatch." }, { status: 400 });
    }

    const result = await checkImageDuplicate({
      imageHash: resolvedHash,
      perceptualHash: resolvedPhash || undefined,
    });

    let stockAnalysis: any = null;
    if (image instanceof File) {
      const imageBuffer = Buffer.from(await image.arrayBuffer());
      try {
        stockAnalysis = await analyzeImageForStockishness(imageBuffer);
      } catch {}
    }

    return NextResponse.json({
      ok: !result.duplicate,
      duplicate: result.duplicate,
      exact: result.exact,
      similar: result.similar,
      distance: result.distance,
      reason: result.reason,
      duplicateCheckEnabled: isPetDuplicateCheckEnabled(),
      imageHash: resolvedHash,
      perceptualHash: resolvedPhash || undefined,
      stockAnalysis: stockAnalysis
        ? {
            likelyStock: stockAnalysis.likelyStock,
            score: stockAnalysis.score,
            reasons: stockAnalysis.reasons,
          }
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image check failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}