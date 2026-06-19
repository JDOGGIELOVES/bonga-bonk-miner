import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
  gardenClaimableFromRecord,
  gardenDailyClaimLimit,
  getGardenEarnRecord,
  isGardenClaimsPaused,
  isGardenEarnStorageReady,
  rolloverGardenRecordIfNeeded,
} from "@/lib/garden-earn-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet")?.trim();
    const date = searchParams.get("date")?.trim() ?? todayKey();

    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const storageReady = isGardenEarnStorageReady();
    const claimsPaused = isGardenClaimsPaused();

    if (!storageReady) {
      return NextResponse.json({
        storageReady: false,
        claimsPaused,
        claimable: 0,
        farmedToday: 0,
        claimed: 0,
        dailyLimit: gardenDailyClaimLimit(),
        hint: "Connect Vercel Blob to enable verified garden claims.",
      });
    }

    const record = rolloverGardenRecordIfNeeded(await getGardenEarnRecord(wallet, date));

    return NextResponse.json({
      storageReady: true,
      claimsPaused,
      bootstrapped: record.bootstrapped,
      farmedToday: record.bongaFarmedToday,
      claimable: gardenClaimableFromRecord(record),
      claimed: record.claimed,
      dailyLimit: gardenDailyClaimLimit(),
      earnCap: gardenDailyClaimLimit(),
      note: "No minimum vault amount. On-chain withdrawals up to 20,001 $BONGA daily.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Garden status unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}