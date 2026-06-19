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
 * Combined daily on-chain wallet cap.
 * 
 * IMPORTANT CLARIFICATION FOR PLAYERS:
 * $BONGA earned from the games can be claimed on-chain from your personal BONGA BANK VAULT 
 * (no minimum threshold, up to 20,001 $BONGA daily per wallet — see walletMaxOnChainBongaPerDay).
 * All smaller earnings auto-deposit to the off-chain Bonga Bank Vault for free (no SOL cost to treasury).
 * 
 * This daily cap is a secondary velocity limit on actual treasury on-chain payouts per wallet per UTC day.
 */
export const DEFAULT_WALLET_MAX_ON_CHAIN_BONGA_PER_DAY = 20001;

export function walletMaxOnChainBongaPerDay(): number {
  // Daily on-chain limit per wallet (across all sources: miner + garden + pet + stake etc.)
  // Set to 20,001 as requested. Players can withdraw up to this daily from the vault.
  const defaultCombined = 20001;
  return envInt("WALLET_MAX_ON_CHAIN_BONGA_PER_DAY", defaultCombined);
}

/** The minimum in Bonga Bank before on-chain withdrawals are allowed. Currently set very low (1) so nothing prevents withdrawing amounts like 10,000 from the vault (subject to daily on-chain cap of 20,001). */
export function onChainClaimRequiresBankMin(): number {
  return getBankMinWithdraw();
}