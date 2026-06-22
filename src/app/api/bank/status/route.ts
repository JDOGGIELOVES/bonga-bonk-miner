import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getBongaBank, getBankMinWithdraw, getGlobalBankStats } from "@/lib/bonga-bank";
import { getTreasuryConfig } from "@/lib/treasury/config";
import { getTodayClaimedFromTreasury } from "@/lib/treasury/daily-claims";
import { computeBankWithdrawableAmount } from "@/lib/wallet-daily-cap";
import { getMinerEarnRecord, claimableFromRecord } from "@/lib/miner-earn-store";
import { gardenClaimableFromRecord, getGardenEarnRecord, rolloverGardenRecordIfNeeded } from "@/lib/garden-earn-store";
import { getStakeRecord, computePendingStakeRewards } from "@/lib/stake-store";
import { hasClaimedPetRewardToday, getSubmissionForWalletToday } from "@/lib/pet-love-store";
import { PET_LOVE_REWARD } from "@/lib/pet-love";

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

  let alreadyOnChainToday = 0;
  const treasuryConfig = getTreasuryConfig();
  if (treasuryConfig) {
    try {
      alreadyOnChainToday = await getTodayClaimedFromTreasury({
        treasury: treasuryConfig.treasuryPublicKey,
        recipientWallet: new PublicKey(wallet),
        mint: treasuryConfig.mint,
        date,
      });
    } catch {
      alreadyOnChainToday = 0;
    }
  }

  const withdrawable = computeBankWithdrawableAmount({
    bankedBonga: bank.bankedBonga,
    alreadyOnChainToday,
    minWithdraw: min,
  });

  return NextResponse.json({
    bankedBonga: bank.bankedBonga,
    lifetimeBanked: bank.lifetimeBanked,
    lifetimeWithdrawn: bank.lifetimeWithdrawn,
    minWithdraw: min, // 0 = no minimum, allows withdrawing 10k+ up to daily 20,001 cap
    dailyOnChainCap: withdrawable.dailyOnChainCap,
    alreadyOnChainToday: withdrawable.alreadyOnChainToday,
    remainingDailyCap: withdrawable.remainingDailyCap,
    withdrawableToday: withdrawable.withdrawableToday,
    canWithdraw: withdrawable.canWithdraw,
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
    note:
      withdrawable.withdrawableToday < bank.bankedBonga
        ? `Vault holds ${bank.bankedBonga.toLocaleString()} $BONGA — withdraw up to ${withdrawable.withdrawableToday.toLocaleString()} today (${withdrawable.dailyOnChainCap.toLocaleString()} daily on-chain cap).`
        : "No minimum (0) to withdraw from your BONGA BANK VAULT. Up to 20,001 $BONGA daily on-chain per wallet.",
  });
}
