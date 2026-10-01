import { NextResponse } from "next/server";
import { getCoinStakeStats } from "@/lib/coin-stake-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public aggregate Coin Stake stats — no wallet addresses. */
export async function GET() {
  try {
    const stats = await getCoinStakeStats();
    return NextResponse.json({
      ok: true,
      ...stats,
      note: "Soft-lock $BONGA coin staking. Counts wallets with stakedAmount > 0.",
    });
  } catch (e) {
    console.error("[coin-stake/stats]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Stats failed" },
      { status: 500 }
    );
  }
}
