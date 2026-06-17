import { NextResponse } from "next/server";
import { getWalletBongaNftsWithRarity } from "@/lib/nft-holder-server";
import { getStakeStatusForWallet } from "@/lib/stake-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet")?.trim();

  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  try {
    // Get rich holdings with rarity (centralized)
    const holdings = await getWalletBongaNftsWithRarity(wallet);
    const heldCount = holdings.length;
    const isHolder = heldCount > 0;

    const heldByRarity: Record<string, number> = { Common: 0, Rare: 0, Legendary: 0, "Cosmic Bonga": 0 };
    for (const h of holdings) {
      if (heldByRarity[h.rarity] !== undefined) heldByRarity[h.rarity] += 1;
    }

    const status = await getStakeStatusForWallet(wallet, heldCount, heldByRarity);

    const stakedCount = Object.values(status.stakedByRarity || {}).reduce((s, c) => s + (c || 0), 0);

    return NextResponse.json({
      ok: true,
      heldCount,
      isHolder,
      stakedCount,
      stakedAt: status.record?.stakedAt ?? null,
      lastClaimedAt: status.record?.lastClaimedAt ?? null,
      pendingBonga: status.pendingBonga,
      dailyRate: status.dailyRate,
      canClaim: status.canClaim,
      heldByRarity: status.heldByRarity,
      stakedByRarity: status.stakedByRarity,
      totalClaimed: status.totalClaimed || 0,
      minClaim: 10,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "stake status failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
