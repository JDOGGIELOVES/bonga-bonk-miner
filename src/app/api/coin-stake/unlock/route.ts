import { NextResponse } from "next/server";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import {
  clearCoinStake,
  getCoinStake,
  settlePreviousMonthIfDue,
} from "@/lib/coin-stake-store";
import { verifyCoinStakeUnlockSignature } from "@/lib/treasury/messages";
import { isWalletBlocked } from "@/lib/claim-tally-store";
import { utcMonthKey, monthKeyToLabel } from "@/lib/coin-stake";
import { depositToBank } from "@/lib/bonga-bank";
import { getWalletBongaBalance } from "@/lib/bonga-balance";

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

    // Settle any prior UTC month before wiping the position (current month still forfeited).
    let settledReward = 0;
    let settledMonth: string | null = null;
    if (prev && prev.stakedAmount > 0) {
      try {
        const bal = await getWalletBongaBalance(wallet);
        if (bal + 1e-9 >= prev.stakedAmount) {
          const settlement = await settlePreviousMonthIfDue(wallet);
          if (settlement.paid && settlement.reward > 0) {
            await depositToBank(wallet, settlement.reward, {
              source: "coin-stake",
              date: settlement.month || undefined,
            });
            settledReward = settlement.reward;
            settledMonth = settlement.month;
          }
        }
      } catch (e) {
        console.warn("[coin-stake/unlock] prior-month settle failed", e);
      }
    }

    await clearCoinStake(wallet);

    const settleBit =
      settledReward > 0 && settledMonth
        ? ` Credited ${settledReward.toLocaleString()} $BONGA for ${monthKeyToLabel(settledMonth)} to Bonga Bank before unstake.`
        : "";

    return NextResponse.json({
      ok: true,
      unstakedAmount: prev?.stakedAmount || 0,
      forfeitedMonth: utcMonthKey(),
      settledReward,
      settledMonth,
      note: `Unstaked. You forfeit rewards for ${utcMonthKey()} (current UTC month). Prior settled months stay in your Bonga Bank.${settleBit}`,
    });
  } catch (e) {
    console.error("[coin-stake/unlock]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unlock failed" },
      { status: 500 }
    );
  }
}
