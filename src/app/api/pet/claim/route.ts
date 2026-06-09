import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { PET_LOVE_REWARD, todayKey } from "@/lib/pet-love";
import { verifyPetSignature } from "@/lib/pet-love-messages";
import {
  getSubmissionById,
  getSubmissionForWalletToday,
  hasClaimedPetRewardToday,
  recordPetClaim,
} from "@/lib/pet-love-store";
import { getTreasuryConfig } from "@/lib/treasury/config";
import { getTodayClaimedFromTreasury } from "@/lib/treasury/daily-claims";
import { transferBongaFromTreasury } from "@/lib/treasury/transfer";
import { isRpcRateLimitError } from "@/lib/treasury/rpc";
import { buildPetClaimMessage } from "@/lib/pet-love-messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function rpcRateLimitMessage() {
  return "Solana RPC rate limit hit. Add a dedicated RPC URL (Helius/QuickNode) to SOLANA_RPC_URL in Vercel, then redeploy.";
}

export async function POST(request: Request) {
  try {
    const config = getTreasuryConfig();
    if (!config) {
      return NextResponse.json(
        { error: "On-chain pet rewards are not enabled on this deployment." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      wallet?: string;
      amount?: number;
      date?: string;
      submissionId?: string;
      signature?: string;
      signedMessage?: string;
    };

    const wallet = body.wallet?.trim();
    const amount = Number(body.amount);
    const date = body.date?.trim() ?? todayKey();
    const submissionId = body.submissionId?.trim();
    const signatureB58 = body.signature?.trim();

    if (!wallet || !signatureB58 || !submissionId || !Number.isFinite(amount)) {
      return NextResponse.json({ error: "Invalid claim request." }, { status: 400 });
    }

    if (amount !== PET_LOVE_REWARD) {
      return NextResponse.json(
        { error: `Pet Love reward is ${PET_LOVE_REWARD} $BONGA per day.` },
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

    let submission = await getSubmissionForWalletToday(wallet, date);
    if (!submission) {
      submission = await getSubmissionById(submissionId);
    }

    if (
      !submission ||
      submission.id !== submissionId ||
      submission.date !== date ||
      submission.wallet.toLowerCase() !== wallet.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Submit a verified pet photo today before claiming." },
        { status: 400 }
      );
    }

    if (await hasClaimedPetRewardToday(wallet, date)) {
      return NextResponse.json(
        { error: "Pet Love reward already claimed today for this wallet." },
        { status: 429 }
      );
    }

    let signedMessage: Uint8Array | undefined;
    if (body.signedMessage?.trim()) {
      try {
        signedMessage = bs58.decode(body.signedMessage.trim());
      } catch {
        return NextResponse.json({ error: "Invalid signed message payload." }, { status: 400 });
      }
    }

    const message = buildPetClaimMessage({
      wallet,
      amount,
      date,
      submissionId,
    });

    const valid = verifyPetSignature({
      wallet,
      message,
      signature: bs58.decode(signatureB58),
      signedMessage,
    });

    if (!valid) {
      return NextResponse.json({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    const alreadyClaimed = await getTodayClaimedFromTreasury({
      treasury: config.treasuryPublicKey,
      recipientWallet: recipient,
      mint: config.mint,
      date,
    });

    if (alreadyClaimed + amount > config.dailyLimit) {
      return NextResponse.json(
        {
          error: `Daily on-chain limit reached (${config.dailyLimit} $BONGA/day across miner + pet).`,
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

    await recordPetClaim(wallet, date, submissionId);

    return NextResponse.json({
      ok: true,
      signature: txSignature,
      amount,
      explorerUrl: `https://solscan.io/tx/${txSignature}`,
    });
  } catch (error) {
    console.error("Pet claim failed:", error);
    if (isRpcRateLimitError(error)) {
      return NextResponse.json({ error: rpcRateLimitMessage() }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Claim failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}