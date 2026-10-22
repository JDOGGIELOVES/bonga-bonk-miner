import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
  claimableFromRecord,
  earnedBongaFromTaps,
  getMinerEarnRecord,
} from "@/lib/miner-earn-store";
import { getBongaBank, getBankMinWithdraw } from "@/lib/bonga-bank";
import { DAILY_BONGA_LIMIT } from "@/lib/miner-game";
import { verifyMinerSessionToken } from "@/lib/miner-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Wallet earn status — requires miner session so strangers can't scrape other wallets.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const wallet = url.searchParams.get("wallet")?.trim();
  const date = url.searchParams.get("date")?.trim() ?? todayKey();
  const sessionToken =
    url.searchParams.get("sessionToken")?.trim() ||
    request.headers.get("x-miner-session")?.trim() ||
    "";

  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  try {
    new PublicKey(wallet);
  } catch {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  }

  const session = verifyMinerSessionToken(wallet, sessionToken);
  if (!session.ok) {
    return NextResponse.json({ error: session.reason, code: "MINER_SESSION" }, { status: 401 });
  }

  const record = await getMinerEarnRecord(wallet, date);
  const bank = await getBongaBank(wallet);
  const earned = earnedBongaFromTaps(record.taps);
  const dailyLimitReached = earned >= DAILY_BONGA_LIMIT;

  const now = new Date();
  const nextReset = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  );

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
    nextDailyReset: nextReset.toISOString(),
    limitMessage: dailyLimitReached
      ? `Daily limit reached of ${DAILY_BONGA_LIMIT} Bonga. Come back tomorrow to mine more $Bonga!`
      : null,
  });
}
