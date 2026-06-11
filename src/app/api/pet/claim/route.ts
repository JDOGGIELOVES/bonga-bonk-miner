import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { isPetLoveClaimsPaused, PET_LOVE_REWARD, todayKey } from "@/lib/pet-love";
import { verifyPetSignature } from "@/lib/pet-love-messages";
import {
  assertPetDailyClaimCapacity,
  getSubmissionById,
  getSubmissionForWalletToday,
  hasClaimedPetRewardToday,
  recordPetClaim,
  recordPetDailyGlobalClaim,
} from "@/lib/pet-love-store";
import { recordGlobalClaim, isWalletBlocked } from "@/lib/claim-tally-store";
import { getTreasuryConfig } from "@/lib/treasury/config";
import { treasuryPayoutsBlockedReason } from "@/lib/treasury/payout-guard";
import { withWalletClaimLock } from "@/lib/claim-lock";
import { getTodayClaimedFromTreasury } from "@/lib/treasury/daily-claims";
import { transferBongaFromTreasury } from "@/lib/treasury/transfer";
import { isRpcRateLimitError } from "@/lib/treasury/rpc";
import { buildPetClaimMessage } from "@/lib/pet-love-messages";
import { assertIpCanClaim, recordIpClaim } from "@/lib/claim-ip-store";
import { requirePetClientIpKey } from "@/lib/request-ip";
import { walletMaxOnChainBongaPerDay } from "@/lib/wallet-daily-cap";

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
        { error: treasuryPayoutsBlockedReason() },
        { status: 503 }
      );
    }

    if (isPetLoveClaimsPaused()) {
      return NextResponse.json(
        { error: "Pet Love claims are temporarily paused. Photo uploads still work." },
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

    // Auto-block check for flagged wallets (3 days)
    const blockCheck = await isWalletBlocked(wallet);
    if (blockCheck.blocked) {
      const until = blockCheck.until ? new Date(blockCheck.until).toLocaleString() : "soon";
      return NextResponse.json(
        { error: `This wallet is temporarily blocked due to suspicious claiming activity. Blocked until ${until}. Reason: ${blockCheck.reason || "high velocity claims"}` },
        { status: 403 }
      );
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

    const ipResult = requirePetClientIpKey(request);
    if (!ipResult.ok) {
      return NextResponse.json({ error: ipResult.reason }, { status: 403 });
    }
    const ipKey = ipResult.ipKey;

    if (submission.ipKey && submission.ipKey !== ipKey) {
      return NextResponse.json(
        {
          error:
            "This reward must be claimed from the same connection used to share the photo.",
        },
        { status: 403 }
      );
    }

    try {
      const result = await withWalletClaimLock(wallet, date, async () => {
        const ipCheck = await assertIpCanClaim({
          ipKey,
          wallet,
          amount,
          date,
          kind: "pet",
        });
        if (!ipCheck.ok) {
          throw new Error(ipCheck.reason);
        }

        const globalCap = await assertPetDailyClaimCapacity(date);
        if (!globalCap.ok) {
          throw new Error(globalCap.reason);
        }

        const alreadyClaimed = await getTodayClaimedFromTreasury({
          treasury: config.treasuryPublicKey,
          recipientWallet: recipient,
          mint: config.mint,
          date,
        });

        const walletCap = walletMaxOnChainBongaPerDay();
        if (alreadyClaimed + amount > walletCap) {
          throw new Error(
            `Daily on-chain wallet limit reached (${walletCap} $BONGA/day across miner, garden, and pet).`
          );
        }

        const { signature: txSignature } = await transferBongaFromTreasury({
          config,
          recipientWallet: recipient,
          amount,
        });

        // Record to lifetime community tally
        // Wrapped to not fail the payout if tally update fails
        try {
          await recordGlobalClaim(amount, 'pet', wallet);
        } catch (e) {
          console.error("Failed to record global pet claim to tally (payout already succeeded):", e);
        }
        await recordPetClaim(wallet, date, submissionId);
        await recordPetDailyGlobalClaim(date);
        await recordIpClaim({ ipKey, wallet, amount, date, kind: "pet" });

        return {
          ok: true as const,
          signature: txSignature,
          amount,
          explorerUrl: `https://solscan.io/tx/${txSignature}`,
        };
      }, "pet");

      return NextResponse.json(result);
    } catch (lockError) {
      const message =
        lockError instanceof Error ? lockError.message : "Claim failed.";
      const status = message.includes("in progress") ? 429 : 400;
      return NextResponse.json({ error: message }, { status });
    }
  } catch (error) {
    console.error("Pet claim failed:", error);
    if (isRpcRateLimitError(error)) {
      return NextResponse.json({ error: rpcRateLimitMessage() }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Claim failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}