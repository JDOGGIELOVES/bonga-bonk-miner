import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getTreasuryConfig } from "@/lib/treasury/config";
import { treasuryPayoutsBlockedReason } from "@/lib/treasury/payout-guard";
import { withWalletClaimLock } from "@/lib/claim-lock";
import { verifyClaimSignature } from "@/lib/treasury/messages";
import { getTodayClaimedFromTreasury } from "@/lib/treasury/daily-claims";
import { recordGlobalClaim } from "@/lib/claim-tally-store";
import { getTreasuryBalances, transferBongaFromTreasury } from "@/lib/treasury/transfer";
import { isRpcRateLimitError } from "@/lib/treasury/rpc";
import {
  claimableFromRecord,
  getMinerEarnRecord,
  isMinerEarnStorageReady,
  recordMinerClaim,
  rollbackMinerClaim,
} from "@/lib/miner-earn-store";
import { BONGA_CLAIM_BATCH } from "@/lib/miner-game";
import {
  assertIpCanClaim,
  ipStorageKey,
  recordIpClaim,
} from "@/lib/claim-ip-store";
import { getClientIp } from "@/lib/request-ip";
import { walletMaxOnChainBongaPerDay } from "@/lib/wallet-daily-cap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_CACHE_MS = 60_000;
let statusCache: {
  at: number;
  payload: Record<string, unknown>;
} | null = null;

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

    if (process.env.CLAIMS_PAUSED === "true") {
      return NextResponse.json(
        { error: "Claims are temporarily paused. Try again shortly." },
        { status: 503 }
      );
    }

    if (!isMinerEarnStorageReady()) {
      return NextResponse.json(
        {
          error:
            "Miner earn tracking is not configured. Connect Vercel Blob before enabling on-chain claims.",
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
      return NextResponse.json({ error: "Invalid claim request." }, { status: 400 });
    }

    if (
      amount < BONGA_CLAIM_BATCH ||
      amount % BONGA_CLAIM_BATCH !== 0 ||
      amount > config.dailyLimit ||
      !Number.isInteger(amount)
    ) {
      return NextResponse.json(
        { error: `Amount must be a multiple of ${BONGA_CLAIM_BATCH} (10, 20, or 30) up to your daily limit of ${config.dailyLimit}.` },
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
    let signedMessage: Uint8Array | undefined;
    if (body.signedMessage?.trim()) {
      try {
        signedMessage = bs58.decode(body.signedMessage.trim());
      } catch {
        return NextResponse.json({ error: "Invalid signed message payload." }, { status: 400 });
      }
    }

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

    const clientIp = getClientIp(request);
    const ipKey = clientIp ? ipStorageKey(clientIp) : undefined;

    try {
      const result = await withWalletClaimLock(wallet, date, async () => {
        const earnRecord = await getMinerEarnRecord(wallet, date);
        const serverClaimable = claimableFromRecord(earnRecord);

        if (ipKey) {
          const ipCheck = await assertIpCanClaim({
            ipKey,
            wallet,
            amount,
            date,
            kind: "miner",
            boundIpKey: earnRecord.ipKey,
          });
          if (!ipCheck.ok) {
            throw new Error(ipCheck.reason);
          }
        }

        if (amount > serverClaimable) {
          throw new Error(
            `You can only claim ${serverClaimable} $BONGA based on verified taps today.`
          );
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

        await recordMinerClaim(wallet, date, amount);

        try {
          const { signature: txSignature } = await transferBongaFromTreasury({
            config,
            recipientWallet: recipient,
            amount,
          });

          await recordGlobalClaim(amount);
          if (ipKey) {
            await recordIpClaim({ ipKey, wallet, amount, date, kind: "miner" });
          }

          return {
            ok: true as const,
            signature: txSignature,
            amount,
            explorerUrl: `https://solscan.io/tx/${txSignature}`,
          };
        } catch (transferError) {
          await rollbackMinerClaim(wallet, date, amount);
          throw transferError;
        }
      }, "miner");

      return NextResponse.json(result);
    } catch (lockError) {
      const message =
        lockError instanceof Error ? lockError.message : "Claim failed.";
      const status = message.includes("in progress") ? 429 : 400;
      return NextResponse.json({ error: message }, { status });
    }
  } catch (error) {
    console.error("Claim failed:", error);
    if (isRpcRateLimitError(error)) {
      return NextResponse.json({ error: rpcRateLimitMessage() }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Claim failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("mint") === "status") {
    try {
      const { getMintStatusPayload } = await import("@/lib/mint-status-server");
      return NextResponse.json(await getMintStatusPayload());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Mint status unavailable.";
      return NextResponse.json(
        { simulated: true, live: false, error: message },
        { status: 502 }
      );
    }
  }

  try {
    const config = getTreasuryConfig();
    if (!config) {
      return NextResponse.json({
        enabled: false,
        hint: "Set ON_CHAIN_CLAIMS_ENABLED=true and treasury env vars in Vercel.",
      });
    }

    const now = Date.now();
    if (statusCache && now - statusCache.at < STATUS_CACHE_MS) {
      return NextResponse.json(statusCache.payload);
    }

    let balances;
    try {
      balances = await getTreasuryBalances(config);
    } catch (error) {
      if (isRpcRateLimitError(error)) {
        return NextResponse.json({
          enabled: true,
          treasury: config.treasuryPublicKey.toBase58(),
          mint: config.mint.toBase58(),
          dailyLimit: config.dailyLimit,
          balancesUnavailable: true,
          hint: rpcRateLimitMessage(),
        });
      }
      throw error;
    }

    const payload = {
      enabled: true,
      treasury: config.treasuryPublicKey.toBase58(),
      mint: config.mint.toBase58(),
      dailyLimit: config.dailyLimit,
      balances,
    };
    statusCache = { at: now, payload };

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Treasury status unavailable.";
    return NextResponse.json({ enabled: false, error: message }, { status: 500 });
  }
}