import { DAILY_BONGA_LIMIT } from "@/lib/miner-game";
import { PET_LOVE_REWARD } from "@/lib/pet-love";
import { gardenDailyClaimLimit } from "@/lib/garden-earn-store";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function minerDailyClaimLimit(): number {
  return envInt("DAILY_CLAIM_LIMIT", DAILY_BONGA_LIMIT);
}

/** Max $BONGA one wallet can receive on-chain per UTC day (miner + garden + pet combined). */
export function walletMaxOnChainBongaPerDay(): number {
  return envInt(
    "WALLET_MAX_ON_CHAIN_BONGA_PER_DAY",
    minerDailyClaimLimit() + gardenDailyClaimLimit() + PET_LOVE_REWARD
  );
}