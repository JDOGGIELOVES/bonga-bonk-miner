import { NextResponse } from "next/server";
import { assertAdminAuthorized } from "@/lib/admin-auth";
import { getBlockedWallets } from "@/lib/claim-tally-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only — was leaking the full blocked-wallet map publicly. */
export async function GET(request: Request) {
  const auth = assertAdminAuthorized(request);
  if (!auth.ok) return auth.response;

  try {
    const allBlocked = await getBlockedWallets();
    const now = Date.now();
    const active: Record<string, { blockedUntil: string; reason: string }> = {};
    for (const [wallet, info] of Object.entries(allBlocked)) {
      if (new Date(info.blockedUntil).getTime() > now) {
        active[wallet] = info;
      }
    }
    return NextResponse.json(active);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Blocked list unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
