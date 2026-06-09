import { NextResponse } from "next/server";
import { readSubmissionImage } from "@/lib/pet-love-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Image id required." }, { status: 400 });
  }

  try {
    const image = await readSubmissionImage(id.trim());
    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    if (image.redirectUrl) {
      return NextResponse.redirect(image.redirectUrl, 302);
    }

    return new NextResponse(new Uint8Array(image.buffer), {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}