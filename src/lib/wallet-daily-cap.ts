import { DAILY_BONGA_LIMIT } from "@/lib/miner-game";
import { PET_LOVE_REWARD } from "@/lib/pet-love";
import { gardenDailyClaimLimit } from "@/lib/garden-earn-store";
import { getBankMinWithdraw } from "@/lib/bonga-bank";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function minerDailyClaimLimit(): number {
  return envInt("DAILY_CLAIM_LIMIT", DAILY_BONGA_LIMIT);
}

/**
 * Combined daily on-chain wallet cap (explicitly pinned default: 2600).
 * Pinned components: minerDailyClaimLimit (1000) + gardenDailyClaimLimit (1500) + PET_LOVE_REWARD (100).
 * 
 * IMPORTANT CLARIFICATION FOR PLAYERS:
 * $BONGA earned from the games can ONLY be claimed on-chain after your personal BONGA BANK VAULT 
 * reaches 10,000 $BONGA (see onChainClaimRequiresBankMin / getBankMinWithdraw).
 * All smaller earnings auto-deposit to the off-chain Bonga Bank Vault for free (no SOL cost to treasury).
 * 
 * This daily cap is a secondary velocity limit on actual treasury on-chain payouts per wallet per UTC day.
 */
export const DEFAULT_WALLET_MAX_ON_CHAIN_BONGA_PER_DAY = 2600; // pinned: 1000 (miner) + 1500 (garden) + 100 (pet)

export function walletMaxOnChainBongaPerDay(): number {
  const defaultCombined =
    minerDailyClaimLimit() + gardenDailyClaimLimit() + PET_LOVE_REWARD; // matches DEFAULT_WALLET_MAX_ON_CHAIN_BONGA_PER_DAY when no envs set
  return envInt("WALLET_MAX_ON_CHAIN_BONGA_PER_DAY", defaultCombined);
}

/** The primary threshold players must reach in their Bonga Bank before any on-chain claims/withdrawals are possible. */
export function onChainClaimRequiresBankMin(): number {
  return getBankMinWithdraw();
}