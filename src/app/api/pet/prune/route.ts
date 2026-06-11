import { NextResponse } from "next/server";
import { pruneOldPetBlobs } from "@/lib/pet-love-store";

/**
 * One-off admin helper to free Blob storage when hitting limits.
 * Hit this URL once (e.g. after deploying) to delete old pet-love blobs older than 60 days.
 * Returns summary. Re-hit if needed.
 *
 * Usage: https://bongabonks.com/api/pet/prune
 * (or your domain)
 */
export async function GET() {
  try {
    const result = await pruneOldPetBlobs(60);
    return NextResponse.json({
      ok: true,
      ...result,
      note: "Old images/submissions deleted from Blob. Gallery may show fewer historical photos. Check Vercel Storage → Blob usage.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prune failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
