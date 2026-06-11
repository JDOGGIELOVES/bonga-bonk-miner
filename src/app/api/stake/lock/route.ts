import { NextResponse } from "next/server";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { getWalletBongaNftsWithRarity } from "@/lib/nft-holder-server";
import { verifyStakeLockSignature } from "@/lib/treasury/messages";
import { isWalletBlocked } from "@/lib/claim-tally-store";
import { setStakedTiers } from "@/lib/stake-store";
import type { RarityTier } from "@/lib/nft-collection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      wallet?: string;
      tiers?: Record<string, number>; // { Common: 2, Rare: 0, ... }
      at?: string;
      signature?: string;
      signedMessage?: string;
    };

    const wallet = body.wallet?.trim();
    const tiers = body.tiers || {};
    const at = body.at?.trim();
    const signatureB58 = body.signature?.trim();

    // Basic validation: at least one positive tier requested
    const requestedTotal = Object.values(tiers).reduce((s, v) => s + Math.max(0, Math.floor(v || 0)), 0);
    if (!wallet || !signatureB58 || !at || requestedTotal <= 0) {
      return NextResponse.json({ error: "Invalid stake lock request. Provide tiers with positive counts." }, { status: 400 });
    }

    // Block check
    const blockCheck = await isWalletBlocked(wallet);
    if (blockCheck.blocked) {
      const until = blockCheck.until ? new Date(blockCheck.until).toLocaleString() : "soon";
      return NextResponse.json(
        { error: `This wallet is temporarily blocked. Blocked until ${until}.` },
        { status: 403 }
      );
    }

    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const signature = bs58.decode(signatureB58);
    let signedMessage: Uint8Array | undefined;
    if (body.signedMessage?.trim()) {
      try {
        signedMessage = bs58.decode(body.signedMessage.trim());
      } catch {
        return NextResponse.json({ error: "Invalid signed message." }, { status: 400 });
      }
    }

    const valid = verifyStakeLockSignature({
      wallet,
      tiers,
      at,
      signature,
      signedMessage,
    });
    if (!valid) {
      return NextResponse.json({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    // Re-verify current holdings + rarity breakdown
    const holdings = await getWalletBongaNftsWithRarity(wallet);
    const heldByRarity: Record<RarityTier, number> = { Common: 0, Rare: 0, Legendary: 0, "Cosmic Bonga": 0 };
    for (const h of holdings) {
      if (heldByRarity[h.rarity] !== undefined) heldByRarity[h.rarity] += 1;
    }

    // Validate against requested tiers
    for (const [tier, req] of Object.entries(tiers)) {
      const requested = Math.max(0, Math.floor(req || 0));
      if (requested === 0) continue;
      const held = (heldByRarity as any)[tier] || 0;
      if (requested > held) {
        return NextResponse.json(
          { error: `Not enough ${tier} Bonga NFTs. You hold ${held}, requested ${requested}.` },
          { status: 400 }
        );
      }
    }

    const updated = await setStakedTiers(wallet, tiers, heldByRarity);

    const finalStakedCount = updated ? Object.values(updated.staked).reduce((s, c) => s + c, 0) : 0;

    return NextResponse.json({
      ok: true,
      stakedCount: finalStakedCount,
      stakedByRarity: updated?.staked ?? {},
      stakedAt: updated?.stakedAt,
      heldVerified: holdings.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stake lock failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
