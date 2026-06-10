import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getTreasuryConfig } from "@/lib/treasury/config";
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
} from "@/lib/miner-earn-store";
import {
  assertIpCanClaim,
  ipStorageKey,
  recordIpClaim,
} from "@/lib/claim-ip-store";
import { getClientIp } from "@/lib/request-ip";

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
        { error: "On-chain claims are not enabled on this deployment." },
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

    const earnRecord = await getMinerEarnRecord(wallet, date);
    const serverClaimable = claimableFromRecord(earnRecord);
    const clientIp = getClientIp(request);
    const ipKey = clientIp ? ipStorageKey(clientIp) : undefined;

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
        return NextResponse.json({ error: ipCheck.reason }, { status: 429 });
      }
    }

    if (amount > serverClaimable) {
      return NextResponse.json(
        {
          error: `You can only claim ${serverClaimable} $BONGA based on verified taps today.`,
          claimable: serverClaimable,
          taps: earnRecord.taps,
        },
        { status: 400 }
      );
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

    await recordGlobalClaim(amount);
    await recordMinerClaim(wallet, date, amount);
    if (ipKey) {
      await recordIpClaim({ ipKey, wallet, amount, date, kind: "miner" });
    }

    return NextResponse.json({
      ok: true,
      signature: txSignature,
      amount,
      explorerUrl: `https://solscan.io/tx/${txSignature}`,
    });
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