import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import {
  claimableFromRecord,
  earnedBongaFromTaps,
  getMinerEarnRecord,
} from "@/lib/miner-earn-store";

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
  return NextResponse.json({
    wallet,
    date,
    taps: record.taps,
    earned: earnedBongaFromTaps(record.taps),
    claimed: record.claimed,
    claimable: claimableFromRecord(record),
  });
}