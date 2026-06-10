import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { applyGardenSyncActions, type GardenSyncAction } from "@/lib/garden-sync-server";
import {
  getGardenEarnRecord,
  isGardenEarnStorageReady,
  rolloverGardenRecordIfNeeded,
  saveGardenEarnRecord,
  gardenClaimableFromRecord,
} from "@/lib/garden-earn-store";
import { ipStorageKey } from "@/lib/claim-ip-store";
import { getClientIp } from "@/lib/request-ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
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
      date?: string;
      actions?: GardenSyncAction[];
    };

    const wallet = body.wallet?.trim();
    const date = body.date?.trim() ?? todayKey();
    const actions = Array.isArray(body.actions) ? body.actions : [];

    if (!wallet || actions.length === 0) {
      return NextResponse.json({ error: "Invalid garden sync request." }, { status: 400 });
    }

    if (date !== todayKey()) {
      return NextResponse.json({ error: "Garden sync is only valid for today (UTC)." }, { status: 400 });
    }

    if (actions.length > 40) {
      return NextResponse.json({ error: "Too many actions in one sync." }, { status: 400 });
    }

    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const clientIp = getClientIp(request);
    const ipKey = clientIp ? ipStorageKey(clientIp) : undefined;

    let record = rolloverGardenRecordIfNeeded(await getGardenEarnRecord(wallet, date));
    const result = await applyGardenSyncActions({ record, actions, ipKey });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason ?? "Garden sync failed." },
        { status: 400 }
      );
    }

    await saveGardenEarnRecord(result.record);

    return NextResponse.json({
      ok: true,
      farmedToday: result.record.bongaFarmedToday,
      claimable: gardenClaimableFromRecord(result.record),
      claimed: result.record.claimed,
      gardenBonga: result.record.gardenBonga,
      bootstrapped: result.record.bootstrapped,
      rejectedActions: result.rejectedActions,
    });
  } catch (error) {
    console.error("Garden sync failed:", error);
    const message = error instanceof Error ? error.message : "Garden sync failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}