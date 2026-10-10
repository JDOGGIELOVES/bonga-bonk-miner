import { NextResponse } from "next/server";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { getWalletBongaBalance } from "@/lib/bonga-balance";
import {
  COIN_STAKE_MIN_AMOUNT,
  coinStakeApr,
  monthlyRewardForStake,
  aprPercentLabel,
} from "@/lib/coin-stake";
import { setCoinStake } from "@/lib/coin-stake-store";
import { verifyCoinStakeLockSignature } from "@/lib/treasury/messages";
import { isWalletBlocked } from "@/lib/claim-tally-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      wallet?: string;
      amount?: number;
      at?: string;
      nonce?: string;
      expiresAt?: string;
      signature?: string;
      signedMessage?: string;
    };

    const wallet = body.wallet?.trim();
    const amount = Number(body.amount);
    const at = body.at?.trim();
    const nonce = (body.nonce || "").trim();
    const expiresAt = (body.expiresAt || "").trim();
    const signatureB58 = body.signature?.trim();

    if (!wallet || !signatureB58 || !at || !Number.isFinite(amount)) {
      return NextResponse.json(
        { error: "Invalid coin stake lock request." },
        { status: 400 }
      );
    }

    if (amount < COIN_STAKE_MIN_AMOUNT) {
      return NextResponse.json(
        { error: `Minimum stake is ${COIN_STAKE_MIN_AMOUNT} $BONGA.` },
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

    const valid = verifyCoinStakeLockSignature({
      wallet,
      amount,
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

    const balance = await getWalletBongaBalance(wallet);
    if (balance + 1e-9 < amount) {
      return NextResponse.json(
        {
          error: `Not enough $BONGA in wallet. Balance ${balance.toLocaleString()}, requested ${amount.toLocaleString()}.`,
        },
        { status: 400 }
      );
    }

    const rec = await setCoinStake(wallet, amount);
    const apr = coinStakeApr(rec.stakedAmount);

    return NextResponse.json({
      ok: true,
      stakedAmount: rec.stakedAmount,
      stakedAt: rec.stakedAt,
      apr,
      aprLabel: aprPercentLabel(apr),
      monthlyPreview: monthlyRewardForStake(rec.stakedAmount),
      walletBalance: balance,
      note: "Soft-lock set. Keep this $BONGA in your wallet through month-end to earn. Unstaking early forfeits the current month.",
    });
  } catch (e) {
    console.error("[coin-stake/lock]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lock failed" },
      { status: 500 }
    );
  }
}
