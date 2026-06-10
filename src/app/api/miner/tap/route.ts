import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getTreasuryConfig } from "@/lib/treasury/config";
import {
  earnedBongaFromTaps,
  isMinerEarnStorageReady,
  registerServerTap,
} from "@/lib/miner-earn-store";

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
        { error: "Server taps only required when on-chain claims are enabled." },
        { status: 503 }
      );
    }

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

    const result = await registerServerTap({ wallet, date, tapIndex });
    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.reason,
          taps: result.record.taps,
          earned: earnedBongaFromTaps(result.record.taps),
        },
        { status: result.reason === "Tap too fast." ? 429 : 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      taps: result.record.taps,
      earned: earnedBongaFromTaps(result.record.taps),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tap registration failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}