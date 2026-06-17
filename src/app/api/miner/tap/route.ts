import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
  earnedBongaFromTaps,
  getMinerEarnRecord,
  isMinerEarnStorageReady,
  registerServerTap,
} from "@/lib/miner-earn-store";
import { DAILY_BONGA_LIMIT } from "@/lib/miner-game";
import {
  assertIpCanTap,
  ipStorageKey,
  recordIpTap,
} from "@/lib/claim-ip-store";
import { getClientIp } from "@/lib/request-ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    // Server tap recording is always available to track verified progress (even for local/sim claims).
    // On-chain payout config is only required at claim time.
    if (process.env.CLAIMS_PAUSED === "true") {
      return NextResponse.json({ error: "Claims are temporarily paused." }, { status: 503 });
    }

    if (!isMinerEarnStorageReady()) {
      return NextResponse.json(
        { error: "Miner earn storage is not configured. Connect Vercel Blob." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      wallet?: string;
      date?: string;
      tapIndex?: number;
    };

    const wallet = body.wallet?.trim();
    const date = body.date?.trim() ?? todayKey();
    const tapIndex = Number(body.tapIndex);

    if (!wallet || !Number.isFinite(tapIndex) || tapIndex < 1) {
      return NextResponse.json({ error: "Invalid tap request." }, { status: 400 });
    }

    if (date !== todayKey()) {
      return NextResponse.json({ error: "Taps are only valid for today (UTC)." }, { status: 400 });
    }

    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const clientIp = getClientIp(request);
    const ipKey = clientIp ? ipStorageKey(clientIp) : undefined;
    const earnRecord = await getMinerEarnRecord(wallet, date);

    if (ipKey) {
      const ipCheck = await assertIpCanTap({
        ipKey,
        wallet,
        date,
        boundIpKey: earnRecord.ipKey,
      });
      if (!ipCheck.ok) {
        return NextResponse.json({ error: ipCheck.reason }, { status: 429 });
      }
    }

    const result = await registerServerTap({ wallet, date, tapIndex, ipKey });
    const earned = earnedBongaFromTaps(result.record.taps);
    const dailyLimitReached = earned >= DAILY_BONGA_LIMIT;

    // Compute next UTC midnight reset
    const now = new Date();
    const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.reason,
          taps: result.record.taps,
          earned,
          dailyLimitReached,
          nextDailyReset: nextReset.toISOString(),
          limitMessage: dailyLimitReached 
            ? `Daily limit reached of ${DAILY_BONGA_LIMIT} Bonga. Come back tomorrow to mine more $Bonga!` 
            : null,
        },
        { status: 400 }
      );
    }

    if (ipKey) {
      await recordIpTap({ ipKey, wallet, date });
    }

    return NextResponse.json({
      ok: true,
      taps: result.record.taps,
      earned,
      dailyLimitReached,
      nextDailyReset: nextReset.toISOString(),
      limitMessage: dailyLimitReached 
        ? `Daily limit reached of ${DAILY_BONGA_LIMIT} Bonga. Come back tomorrow to mine more $Bonga!` 
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tap registration failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}