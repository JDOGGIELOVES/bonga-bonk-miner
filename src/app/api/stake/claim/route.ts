import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getTreasuryConfig } from "@/lib/treasury/config";
import { treasuryPayoutsBlockedReason } from "@/lib/treasury/payout-guard";
import { withWalletClaimLock } from "@/lib/claim-lock";
import { verifyClaimSignature } from "@/lib/treasury/messages";
import { recordGlobalClaim, isWalletBlocked } from "@/lib/claim-tally-store";
import { getTreasuryBalances, transferBongaFromTreasury } from "@/lib/treasury/transfer";
import { getStakeRecord, recordStakeClaim, computePendingStakeRewards, DAILY_STAKE_REWARD_PER_NFT, MIN_STAKE_CLAIM } from "@/lib/stake-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const config = getTreasuryConfig();
    if (!config) {
      return NextResponse.json({ error: treasuryPayoutsBlockedReason() }, { status: 503 });
    }

    if (process.env.CLAIMS_PAUSED === "true") {
      return NextResponse.json({ error: "Claims are temporarily paused." }, { status: 503 });
    }

    const body = (await request.json()) as {
      wallet?: string;
      amount?: number;
      date?: string;
      signature?: string;
      signedMessage?: string;
    };

    const wallet = body.wallet?.trim();
    const amount = Number(body.amount);
    const date = body.date?.trim() ?? todayKey();
    const signatureB58 = body.signature?.trim();

    if (!wallet || !signatureB58 || !Number.isFinite(amount)) {
      return NextResponse.json({ error: "Invalid stake claim request." }, { status: 400 });
    }

    if (amount < MIN_STAKE_CLAIM || amount > 10000 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: `Stake reward claims must be at least ${MIN_STAKE_CLAIM} and reasonable.` },
        { status: 400 }
      );
    }

    const blockCheck = await isWalletBlocked(wallet);
    if (blockCheck.blocked) {
      const until = blockCheck.until ? new Date(blockCheck.until).toLocaleString() : "soon";
      return NextResponse.json(
        { error: `This wallet is temporarily blocked due to suspicious activity. Blocked until ${until}.` },
        { status: 403 }
      );
    }

    let recipient: PublicKey;
    try {
      recipient = new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const signature = bs58.decode(signatureB58);
    let signedMessage: Uint8Array | undefined;
    if (body.signedMessage?.trim()) {
      try {
        signedMessage = bs58.decode(body.signedMessage.trim());
      } catch {
        return NextResponse.json({ error: "Invalid signed message payload." }, { status: 400 });
      }
    }

    // Verify using the standard claim message (wallet + amount + date). This is intentional reuse.
    const valid = verifyClaimSignature({
      wallet,
      amount,
      date,
      signature,
      signedMessage,
    });
    if (!valid) {
      return NextResponse.json({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    // Under lock, validate the pending amount matches the record, do transfer, advance timer, tally.
    const result = await withWalletClaimLock(
      wallet,
      `stake-${date}`,
      async () => {
        const record = await getStakeRecord(wallet);
        if (!record || record.stakedCount <= 0) {
          throw new Error("No active stake found for this wallet.");
        }

        const pending = computePendingStakeRewards(record);
        if (amount > pending + 1) {
          // allow 1 for rounding
          throw new Error(`Requested amount ${amount} exceeds current pending ${pending}.`);
        }
        if (amount < MIN_STAKE_CLAIM) {
          throw new Error(`Minimum stake claim is ${MIN_STAKE_CLAIM}.`);
        }

        // Perform the on-chain transfer
        const { signature: txSig } = await transferBongaFromTreasury({
          config,
          recipientWallet: recipient,
          amount,
        });

        // Advance the stake timer
        await recordStakeClaim(wallet, amount);

        // Record to lifetime community tally under "stake" category
        await recordGlobalClaim(amount, "stake", wallet);

        return {
          signature: txSig,
          amount,
          explorerUrl: `https://solscan.io/tx/${txSig}`,
        };
      },
      "stake"
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stake claim failed.";
    const status = /blocked|paused|treasury/i.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
