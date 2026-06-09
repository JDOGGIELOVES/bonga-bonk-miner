import { NextResponse } from "next/server";
import { listGallery, toPublicGalleryItem } from "@/lib/pet-love-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const submissions = await listGallery(48);
    return NextResponse.json({
      items: submissions.map(toPublicGalleryItem),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gallery unavailable.";
    return NextResponse.json({ error: message, items: [] }, { status: 500 });
  }
}