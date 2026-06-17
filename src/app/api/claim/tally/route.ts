import { NextResponse } from "next/server";
import { getGlobalClaimTally } from "@/lib/claim-tally-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tally = await getGlobalClaimTally();
    return NextResponse.json(tally);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tally unavailable.";
    // Still attempt to return whatever the (cached) getGlobalClaimTally would give
    // instead of hard zeroing everything on transient errors.
    try {
      const fallback = await getGlobalClaimTally();
      return NextResponse.json({ ...fallback, error: message }, { status: 500 });
    } catch {
      return NextResponse.json(
        {
          error: message,
          totalBonga: 0,
          claimCount: 0,
          miner: { bonga: 0, claims: 0 },
          garden: { bonga: 0, claims: 0 },
          pet: { bonga: 0, claims: 0 },
          stake: { bonga: 0, claims: 0 },
        },
        { status: 500 }
      );
    }
  }
}