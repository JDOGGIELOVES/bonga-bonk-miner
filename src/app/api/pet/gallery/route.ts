import { NextResponse } from "next/server";
import { listGallery, toPublicGalleryItem } from "@/lib/pet-love-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const limitParam = new URL(request.url).searchParams.get("limit");
    const limit = limitParam ? Math.min(120, Math.max(1, Number(limitParam))) : 96;
    const submissions = await listGallery(limit);
    return NextResponse.json({
      items: submissions.map(toPublicGalleryItem),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gallery unavailable.";
    return NextResponse.json({ error: message, items: [] }, { status: 500 });
  }
}