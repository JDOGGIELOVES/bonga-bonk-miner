import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
  claimableFromRecord,
  earnedBongaFromTaps,
  getMinerEarnRecord,
} from "@/lib/miner-earn-store";
import { getBongaBank, getBankMinWithdraw } from "@/lib/bonga-bank";
import { DAILY_BONGA_LIMIT } from "@/lib/miner-game";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet")?.trim();
  const date = url.searchParams.get("date")?.trim() ?? todayKey();

  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  try {
    new PublicKey(wallet);
  } catch {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  }

  const record = await getMinerEarnRecord(wallet, date);
  const bank = await getBongaBank(wallet);
  const earned = earnedBongaFromTaps(record.taps);
  const dailyLimitReached = earned >= DAILY_BONGA_LIMIT;

  // Calculate next UTC midnight reset time
  const now = new Date();
  const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const nextDailyReset = nextReset.toISOString();

  return NextResponse.json({
    wallet,
    date,
    taps: record.taps,
    earned,
    claimed: record.claimed,
    claimable: claimableFromRecord(record),
    bankedBonga: bank.bankedBonga,
    bankMinWithdraw: getBankMinWithdraw(),
    dailyLimitReached,
    nextDailyReset,
    limitMessage: dailyLimitReached 
      ? `Daily limit reached of ${DAILY_BONGA_LIMIT} Bonga. Come back tomorrow to mine more $Bonga!` 
      : null,
  });
}