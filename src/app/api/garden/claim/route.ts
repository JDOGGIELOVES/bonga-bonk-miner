import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getTreasuryConfig } from "@/lib/treasury/config";
import { treasuryPayoutsBlockedReason } from "@/lib/treasury/payout-guard";
import { withWalletClaimLock } from "@/lib/claim-lock";
import { getTodayClaimedFromTreasury } from "@/lib/treasury/daily-claims";
import { recordGlobalClaim, isWalletBlocked } from "@/lib/claim-tally-store";
import { transferBongaFromTreasury } from "@/lib/treasury/transfer";
import { isRpcRateLimitError } from "@/lib/treasury/rpc";
import {
  assertIpCanClaim,
  ipStorageKey,
  recordIpClaim,
  maxGardenClaimsPerIpPerDay,
} from "@/lib/claim-ip-store";
import { getClientIp } from "@/lib/request-ip";
import { verifyGardenClaimSignature } from "@/lib/garden-claim-messages";
import {
  gardenClaimableFromRecord,
  gardenDailyClaimLimit,
  getGardenEarnRecord,
  isGardenClaimsPaused,
  isGardenEarnStorageReady,
  recordGardenClaim,
  rollbackGardenClaim,
  rolloverGardenRecordIfNeeded,
} from "@/lib/garden-earn-store";
import { walletMaxOnChainBongaPerDay } from "@/lib/wallet-daily-cap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function rpcRateLimitMessage() {
  return "Solana RPC rate limit hit. Add a dedicated RPC URL (Helius/QuickNode) to SOLANA_RPC_URL in Vercel, then redeploy.";
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
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

    if (isGardenClaimsPaused()) {
      return NextResponse.json(
        { error: "Garden claims are temporarily paused. Keep growing — sync still works." },
        { status: 503 }
      );
    }

    if (!isGardenEarnStorageReady()) {
      return NextResponse.json(
        {
          error:
            "Garden earn tracking is not configured. Connect Vercel Blob before enabling garden claims.",
        },
        { status: 503 }
      );
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
      return NextResponse.json({ error: "Invalid garden claim request." }, { status: 400 });
    }

    const dailyLimit = gardenDailyClaimLimit();
    if (amount <= 0 || amount > dailyLimit) {
      return NextResponse.json(
        { error: `Amount must be between 0.01 and ${dailyLimit} garden $BONGA.` },
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

    let signedMessage: Uint8Array | undefined;
    if (body.signedMessage?.trim()) {
      try {
        signedMessage = bs58.decode(body.signedMessage.trim());
      } catch {
        return NextResponse.json({ error: "Invalid signed message payload." }, { status: 400 });
      }
    }

    const valid = verifyGardenClaimSignature({
      wallet,
      amount,
      date,
      signature: bs58.decode(signatureB58),
      signedMessage,
    });

    if (!valid) {
      return NextResponse.json({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    const clientIp = getClientIp(request);
    const ipKey = clientIp ? ipStorageKey(clientIp) : undefined;

    try {
      const result = await withWalletClaimLock(wallet, date, async () => {
        const record = rolloverGardenRecordIfNeeded(await getGardenEarnRecord(wallet, date));

        if (!record.bootstrapped) {
          throw new Error(
            "Connect wallet and play the garden once to link today's progress before claiming."
          );
        }

        const serverClaimable = gardenClaimableFromRecord(record);

        if (ipKey) {
          const ipCheck = await assertIpCanClaim({
            ipKey,
            wallet,
            amount,
            date,
            kind: "garden",
            boundIpKey: record.ipKey,
          });
          if (!ipCheck.ok) {
            throw new Error(ipCheck.reason);
          }
        }

        if (Math.abs(amount - serverClaimable) > 0.009) {
          throw new Error(
            `You can only claim ${serverClaimable} $BONGA based on verified garden progress today.`
          );
        }

        if (record.claimed + amount > record.bongaFarmedToday + 0.001) {
          throw new Error("Claim exceeds verified garden earnings for today.");
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

        await recordGardenClaim(wallet, date, amount);

        try {
          const { signature: txSignature } = await transferBongaFromTreasury({
            config,
            recipientWallet: recipient,
            amount,
          });

          // Record to lifetime community tally
          // Wrapped to not fail the payout if tally update fails
          try {
            await recordGlobalClaim(amount, 'garden', wallet);
          } catch (e) {
            console.error("Failed to record global garden claim to tally (payout already succeeded):", e);
          }
          if (ipKey) {
            await recordIpClaim({ ipKey, wallet, amount, date, kind: "garden" });
          }

          return {
            ok: true as const,
            signature: txSignature,
            amount,
            explorerUrl: `https://solscan.io/tx/${txSignature}`,
          };
        } catch (transferError) {
          await rollbackGardenClaim(wallet, date, amount);
          throw transferError;
        }
      }, "garden");

      return NextResponse.json(result);
    } catch (lockError) {
      const message =
        lockError instanceof Error ? lockError.message : "Garden claim failed.";
      const status = message.includes("in progress") ? 429 : 400;
      return NextResponse.json({ error: message }, { status });
    }
  } catch (error) {
    console.error("Garden claim failed:", error);
    if (isRpcRateLimitError(error)) {
      return NextResponse.json({ error: rpcRateLimitMessage() }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Garden claim failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    paused: isGardenClaimsPaused(),
    dailyLimit: gardenDailyClaimLimit(),
    maxClaimsPerIp: maxGardenClaimsPerIpPerDay(),
    walletOnChainCap: walletMaxOnChainBongaPerDay(),
  });
}