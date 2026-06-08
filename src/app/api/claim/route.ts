import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getTreasuryConfig } from "@/lib/treasury/config";
import { verifyClaimSignature } from "@/lib/treasury/messages";
import { getTodayClaimedFromTreasury } from "@/lib/treasury/daily-claims";
import { getTreasuryBalances, transferBongaFromTreasury } from "@/lib/treasury/transfer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const config = getTreasuryConfig();
    if (!config) {
      return NextResponse.json(
        { error: "On-chain claims are not enabled on this deployment." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      wallet?: string;
      amount?: number;
      date?: string;
      signature?: string;
    };

    const wallet = body.wallet?.trim();
    const amount = Number(body.amount);
    const date = body.date?.trim() ?? todayKey();
    const signatureB58 = body.signature?.trim();

    if (!wallet || !signatureB58 || !Number.isFinite(amount)) {
      return NextResponse.json({ error: "Invalid claim request." }, { status: 400 });
    }

    if (amount <= 0 || amount > config.dailyLimit || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: `Amount must be a whole number between 1 and ${config.dailyLimit}.` },
        { status: 400 }
      );
    }

    if (date !== todayKey()) {
      return NextResponse.json({ error: "Claims are only valid for today (UTC)." }, { status: 400 });
    }

    let recipient: PublicKey;
    try {
      recipient = new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const signature = bs58.decode(signatureB58);
    const valid = verifyClaimSignature({ wallet, amount, date, signature });
    if (!valid) {
      return NextResponse.json({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    const connection = new Connection(config.rpcUrl, "confirmed");
    const alreadyClaimed = await getTodayClaimedFromTreasury({
      connection,
      treasury: config.treasuryPublicKey,
      recipientWallet: recipient,
      mint: config.mint,
      date,
    });

    if (alreadyClaimed + amount > config.dailyLimit) {
      return NextResponse.json(
        {
          error: `Daily on-chain claim limit reached (${config.dailyLimit} $BONGA/day).`,
          alreadyClaimed,
        },
        { status: 429 }
      );
    }

    const { signature: txSignature } = await transferBongaFromTreasury({
      config,
      recipientWallet: recipient,
      amount,
    });

    return NextResponse.json({
      ok: true,
      signature: txSignature,
      amount,
      explorerUrl: `https://solscan.io/tx/${txSignature}`,
    });
  } catch (error) {
    console.error("Claim failed:", error);
    const message = error instanceof Error ? error.message : "Claim failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const config = getTreasuryConfig();
  if (!config) {
    return NextResponse.json({ enabled: false });
  }

  const balances = await getTreasuryBalances(config);

  return NextResponse.json({
    enabled: true,
    treasury: config.treasuryPublicKey.toBase58(),
    mint: config.mint.toBase58(),
    dailyLimit: config.dailyLimit,
    balances,
  });
}