import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getCollectionAddress } from "@/lib/mint-config";
import { getWalletBongaNftsWithRarity } from "@/lib/nft-holder-server";
import type { RarityTier } from "@/lib/nft-collection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const METADATA_PROGRAM = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

function getRpcUrl(): string {
  return (
    process.env.SOLANA_RPC_URL ||
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    "https://api.mainnet-beta.solana.com"
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet")?.trim();
  if (!wallet) {
    return NextResponse.json({ isHolder: false, error: "wallet required" }, { status: 400 });
  }

  try {
    // Use the rich holder function for accurate Bonga + Rarity data
    const holdings = await getWalletBongaNftsWithRarity(wallet);
    const isHolder = holdings.length > 0;

    const heldByRarity: Record<RarityTier, number> = {
      Common: 0,
      Rare: 0,
      Legendary: 0,
      "Cosmic Bonga": 0,
    };
    for (const h of holdings) {
      if (heldByRarity[h.rarity] !== undefined) heldByRarity[h.rarity] += 1;
    }

    // Backward compatible fields (count = total verified Bonga now)
    return NextResponse.json({
      isHolder,
      count: holdings.length,
      collectionMatches: holdings.length,
      heldByRarity,
      // also include detailed list for advanced clients (staking etc)
      holdings: holdings.slice(0, 12), // cap for response size
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "holder check failed";
    return NextResponse.json({ isHolder: false, error: message }, { status: 500 });
  }
}