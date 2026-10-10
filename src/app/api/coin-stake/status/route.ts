import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getWalletBongaBalance } from "@/lib/bonga-balance";
import {
  aprPercentLabel,
  coinStakeApr,
  monthKeyToLabel,
  monthlyRewardForStake,
  COIN_STAKE_TIER_MAX,
  COIN_STAKE_APR_HIGH,
  COIN_STAKE_APR_LOW,
} from "@/lib/coin-stake";
import {
  currentCycleInfo,
  getCoinStake,
  settlePreviousMonthIfDue,
} from "@/lib/coin-stake-store";
import { depositToBank } from "@/lib/bonga-bank";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = (searchParams.get("wallet") || "").trim();
    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }
    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet" }, { status: 400 });
    }

    const { assertPlaySession } = await import("@/lib/play-session");
    const session = assertPlaySession(request, wallet);
    if (!session.ok) return session.response;

    let walletBalance = 0;
    try {
      walletBalance = await getWalletBongaBalance(wallet);
    } catch (e) {
      console.warn("[coin-stake/status] balance read failed", e);
    }

    const cycle = currentCycleInfo();
    let record = await getCoinStake(wallet);
    let settledReward = 0;
    let settledMonth: string | null = null;
    let settleNote: string | null = null;

    // Lazy monthly settlement: if still holding enough $BONGA, credit prior month to bank
    if (record && record.stakedAmount > 0) {
      if (walletBalance + 1e-9 >= record.stakedAmount) {
        const settlement = await settlePreviousMonthIfDue(wallet);
        if (settlement.paid && settlement.reward > 0) {
          await depositToBank(wallet, settlement.reward, {
            source: "coin-stake",
            date: settlement.month || undefined,
          });
          settledReward = settlement.reward;
          settledMonth = settlement.month;
          settleNote = `Credited ${settlement.reward.toLocaleString()} $BONGA for ${monthKeyToLabel(settlement.month!)} to your Bonga Bank Vault.`;
          record = settlement.record;
        } else if (settlement.reason && settlement.reason !== "already_settled") {
          // keep quiet for already_settled
        }
      } else {
        settleNote =
          "Wallet $BONGA balance is below your staked amount — monthly rewards pause until you hold enough again (or unstake).";
      }
    }

    const stakedAmount = record?.stakedAmount || 0;
    const apr = coinStakeApr(stakedAmount);
    const monthlyPreview = monthlyRewardForStake(stakedAmount);
    const holdingOk =
      stakedAmount <= 0 || walletBalance + 1e-9 >= stakedAmount;

    return NextResponse.json({
      ok: true,
      wallet,
      walletBalance,
      stakedAmount,
      stakedAt: record?.stakedAt || null,
      lastSettledMonth: record?.lastSettledMonth || null,
      lifetimeRewarded: record?.lifetimeRewarded || 0,
      apr,
      aprLabel: aprPercentLabel(apr),
      monthlyPreview,
      holdingOk,
      tierMax: COIN_STAKE_TIER_MAX,
      aprHigh: COIN_STAKE_APR_HIGH,
      aprLow: COIN_STAKE_APR_LOW,
      cycle: {
        month: cycle.month,
        monthLabel: monthKeyToLabel(cycle.month),
        previousMonth: cycle.previousMonth,
        endsAtIso: cycle.endsAtIso,
        msRemaining: cycle.msRemaining,
      },
      settledReward,
      settledMonth,
      settleNote,
      rules: {
        summary:
          "Stake $BONGA (soft-lock). ≤1,000,000 → 25% APR. Over 1,000,000 → 7% APR on the whole stake. Rewards pay once per UTC month into Bonga Bank if you stay staked through month-end. Unstake early = forfeit that month.",
      },
    });
  } catch (e) {
    console.error("[coin-stake/status]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Status failed" },
      { status: 500 }
    );
  }
}
