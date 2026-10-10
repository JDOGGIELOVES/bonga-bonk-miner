import { NextResponse } from "next/server";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { clearCoinStake, getCoinStake } from "@/lib/coin-stake-store";
import { verifyCoinStakeUnlockSignature } from "@/lib/treasury/messages";
import { isWalletBlocked } from "@/lib/claim-tally-store";
import { utcMonthKey } from "@/lib/coin-stake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      wallet?: string;
      at?: string;
      nonce?: string;
      expiresAt?: string;
      signature?: string;
      signedMessage?: string;
    };

    const wallet = body.wallet?.trim();
    const at = body.at?.trim();
    const nonce = (body.nonce || "").trim();
    const expiresAt = (body.expiresAt || "").trim();
    const signatureB58 = body.signature?.trim();

    if (!wallet || !signatureB58 || !at) {
      return NextResponse.json(
        { error: "Invalid coin stake unlock request." },
        { status: 400 }
      );
    }

    const blockCheck = await isWalletBlocked(wallet);
    if (blockCheck.blocked) {
      return NextResponse.json(
        { error: `Wallet temporarily blocked. ${blockCheck.reason || ""}` },
        { status: 403 }
      );
    }

    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet." }, { status: 400 });
    }

    const signature = bs58.decode(signatureB58);
    let signedMessage: Uint8Array | undefined;
    if (body.signedMessage?.trim()) {
      try {
        signedMessage = bs58.decode(body.signedMessage.trim());
      } catch {
        return NextResponse.json({ error: "Bad signedMessage." }, { status: 400 });
      }
    }

    const valid = verifyCoinStakeUnlockSignature({
      wallet,
      at,
      nonce: nonce || undefined,
      expiresAt: expiresAt || undefined,
      signature,
      signedMessage,
    });
    if (!valid) {
      return NextResponse.json(
        { error: "Wallet signature verification failed." },
        { status: 401 }
      );
    }

    const prev = await getCoinStake(wallet);
    await clearCoinStake(wallet);

    return NextResponse.json({
      ok: true,
      unstakedAmount: prev?.stakedAmount || 0,
      forfeitedMonth: utcMonthKey(),
      note: `Unstaked. You forfeit rewards for ${utcMonthKey()} (current UTC month). Prior settled months stay in your Bonga Bank.`,
    });
  } catch (e) {
    console.error("[coin-stake/unlock]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unlock failed" },
      { status: 500 }
    );
  }
}
