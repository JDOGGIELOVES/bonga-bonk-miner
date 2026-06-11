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
    return NextResponse.json(
      {
        error: message,
        totalBonga: 0,
        claimCount: 0,
        miner: { bonga: 0, claims: 0 },
        garden: { bonga: 0, claims: 0 },
        pet: { bonga: 0, claims: 0 },
      },
      { status: 500 }
    );
  }
}