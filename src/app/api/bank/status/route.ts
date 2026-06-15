import { NextResponse } from "next/server";
import { getBongaBank, getBankMinWithdraw, getGlobalBankStats } from "@/lib/bonga-bank";
import { getMinerEarnRecord, claimableFromRecord } from "@/lib/miner-earn-store";
import { gardenClaimableFromRecord, getGardenEarnRecord, rolloverGardenRecordIfNeeded } from "@/lib/garden-earn-store";
import { getStakeRecord, computePendingStakeRewards } from "@/lib/stake-store";
import { hasClaimedPetRewardToday, getSubmissionForWalletToday } from "@/lib/pet-love-store";
import { PET_LOVE_REWARD } from "@/lib/pet-love";
import { walletMaxOnChainBongaPerDay } from "@/lib/wallet-daily-cap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const wallet = (url.searchParams.get("wallet") || "").trim();

  const community = await getGlobalBankStats().catch(() => ({
    totalLifetimeBanked: 0,
    totalUniquePlayers: 0,
    lastUpdated: new Date().toISOString(),
  }));

  if (!wallet) {
    // Allow public community stats without a wallet (useful for dashboards)
    return NextResponse.json({
      community: {
        totalLifetimeBanked: community.totalLifetimeBanked,
        totalUniquePlayers: community.totalUniquePlayers,
        lastUpdated: community.lastUpdated,
      },
    });
  }

  const [bank, min] = await Promise.all([
    getBongaBank(wallet),
    Promise.resolve(getBankMinWithdraw()),
  ]);

  const date = todayKey();

  // Compute current pending that could be deposited (best-effort; not a guarantee)
  let pendingMiner = 0;
  let pendingGarden = 0;
  let pendingStake = 0;
  let pendingPet = 0;

  try {
    const minerRec = await getMinerEarnRecord(wallet, date);
    pendingMiner = claimableFromRecord(minerRec);
  } catch {}

  try {
    const g = rolloverGardenRecordIfNeeded(await getGardenEarnRecord(wallet, date));
    pendingGarden = gardenClaimableFromRecord(g);
  } catch {}

  try {
    const stakeRec = await getStakeRecord(wallet);
    pendingStake = computePendingStakeRewards(stakeRec);
  } catch {}

  try {
    const alreadyPet = await hasClaimedPetRewardToday(wallet, date);
    if (!alreadyPet) {
      // If they have a verified submission today they can still deposit the reward
      const sub = await getSubmissionForWalletToday(wallet, date);
      if (sub) pendingPet = PET_LOVE_REWARD;
    }
  } catch {}

  const totalPending = pendingMiner + pendingGarden + pendingStake + pendingPet;

  return NextResponse.json({
    bankedBonga: bank.bankedBonga,
    lifetimeBanked: bank.lifetimeBanked,
    lifetimeWithdrawn: bank.lifetimeWithdrawn,
    minWithdraw: min,
    canWithdraw: bank.bankedBonga >= min,
    dailyOnChainWalletCap: walletMaxOnChainBongaPerDay(),
    pending: {
      miner: pendingMiner,
      garden: pendingGarden,
      stake: pendingStake,
      pet: pendingPet,
      total: totalPending,
    },
    lastActivity: bank.lastWithdrawAt || bank.lastDepositAt || bank.updatedAt,
    recentDeposits: (bank.depositHistory || []).slice(-20),
    community: {
      totalLifetimeBanked: community.totalLifetimeBanked,
      totalUniquePlayers: community.totalUniquePlayers,
      lastUpdated: community.lastUpdated,
    },
    note: "$BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches the minWithdraw (10,000 by default). All smaller earnings auto-deposit to the vault.",
  });
}
