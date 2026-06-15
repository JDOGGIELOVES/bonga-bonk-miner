import { NextResponse } from "next/server";
import {
  getMinerEarnRecord,
  claimableFromRecord,
  recordMinerClaim,
} from "@/lib/miner-earn-store";
import {
  getGardenEarnRecord,
  gardenClaimableFromRecord,
  recordGardenClaim,
  rolloverGardenRecordIfNeeded,
} from "@/lib/garden-earn-store";
import {
  getStakeRecord,
  computePendingStakeRewards,
  recordStakeClaim,
} from "@/lib/stake-store";
import {
  hasClaimedPetRewardToday,
  getSubmissionForWalletToday,
  recordPetClaim,
} from "@/lib/pet-love-store";
import { PET_LOVE_REWARD } from "@/lib/pet-love";
import { depositToBank, getBongaBank } from "@/lib/bonga-bank";
import { withWalletClaimLock } from "@/lib/claim-lock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      wallet?: string;
      source?: "miner" | "garden" | "stake" | "pet" | "all";
      date?: string;
    };

    const wallet = (body.wallet || "").trim();
    const source = body.source || "all";
    const date = (body.date || todayKey()).trim();

    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    const result: Record<string, number> = {};
    let totalDeposited = 0;

    await withWalletClaimLock(wallet, `bank-deposit-${source}`, async () => {
      if (source === "miner" || source === "all") {
        const rec = await getMinerEarnRecord(wallet, date);
        const claimable = claimableFromRecord(rec);
        if (claimable > 0) {
          await recordMinerClaim(wallet, date, claimable); // zero it out of the daily pending
          await depositToBank(wallet, claimable, { source: "miner", date });
          result.miner = claimable;
          totalDeposited += claimable;
        }
      }

      if (source === "garden" || source === "all") {
        const rec = rolloverGardenRecordIfNeeded(await getGardenEarnRecord(wallet, date));
        const claimable = gardenClaimableFromRecord(rec);
        if (claimable > 0.0001) {
          await recordGardenClaim(wallet, date, claimable);
          await depositToBank(wallet, claimable, { source: "garden", date });
          result.garden = claimable;
          totalDeposited += claimable;
        }
      }

      if (source === "stake" || source === "all") {
        const rec = await getStakeRecord(wallet);
        const pending = computePendingStakeRewards(rec);
        if (pending > 0) {
          // recordStakeClaim advances the timer / marks claimed
          await recordStakeClaim(wallet, pending);
          await depositToBank(wallet, pending, { source: "stake" });
          result.stake = pending;
          totalDeposited += pending;
        }
      }

      if (source === "pet" || source === "all") {
        const already = await hasClaimedPetRewardToday(wallet, date);
        if (!already) {
          const sub = await getSubmissionForWalletToday(wallet, date);
          if (sub) {
            await recordPetClaim(wallet, date, sub.id);
            await depositToBank(wallet, PET_LOVE_REWARD, { source: "pet", date });
            result.pet = PET_LOVE_REWARD;
            totalDeposited += PET_LOVE_REWARD;
          }
        }
      }
    }, "bank-deposit");

    const updatedBank = await getBongaBank(wallet); // re-read after deposits

    return NextResponse.json({
      ok: true,
      deposited: result,
      totalDeposited,
      newBankBalance: updatedBank.bankedBonga,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bank deposit failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
