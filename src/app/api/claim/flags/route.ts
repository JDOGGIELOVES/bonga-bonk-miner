import { NextResponse } from "next/server";
import { assertAdminAuthorized } from "@/lib/admin-auth";
import { getFlaggedWallets } from "@/lib/claim-tally-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only — was leaking flagged wallet lists publicly. */
export async function GET(request: Request) {
  const auth = assertAdminAuthorized(request);
  if (!auth.ok) return auth.response;

  try {
    const flagged = await getFlaggedWallets();
    return NextResponse.json(flagged);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Flags unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
