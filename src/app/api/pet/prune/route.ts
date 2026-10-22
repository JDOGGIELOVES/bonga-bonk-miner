import { NextResponse } from "next/server";
import { assertAdminAuthorized } from "@/lib/admin-auth";
import { pruneOldPetBlobs } from "@/lib/pet-love-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only Blob prune. Was a public GET that deleted files — now requires secret.
 * Authorization: Bearer <ADMIN_API_SECRET>
 */
export async function POST(request: Request) {
  const auth = assertAdminAuthorized(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json().catch(() => ({}))) as { daysToKeep?: number };
    const days = Math.min(365, Math.max(7, Math.floor(Number(body.daysToKeep) || 60)));
    const result = await pruneOldPetBlobs(days);
    return NextResponse.json({
      ok: true,
      ...result,
      note: "Old images/submissions deleted from Blob.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prune failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const auth = assertAdminAuthorized(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({
    ok: true,
    note: "Prune requires POST with ADMIN_API_SECRET. Public GET prune is disabled.",
  });
}
