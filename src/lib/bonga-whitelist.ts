import { loadGameState, STORAGE_KEY } from "@/lib/miner-game";

export type WhitelistTier = "none" | "discount" | "free";

export interface WhitelistStatus {
  tier: WhitelistTier;
  totalBonga: number;
  bongaToday: number;
  discountPercent: number;
  label: string;
  eligible: boolean;
}

export const WHITELIST_THRESHOLDS = {
  freeMint: 10,
  discountMint: 3,
  discountPercent: 50,
};

export function getWhitelistStatus(walletAddress?: string): WhitelistStatus {
  const game = loadGameState();
  const total = game.totalBonga;
  const today = game.bongaToday;

  if (total >= WHITELIST_THRESHOLDS.freeMint) {
    return {
      tier: "free",
      totalBonga: total,
      bongaToday: today,
      discountPercent: 100,
      label: "Free Mint Whitelist ✌️",
      eligible: true,
    };
  }

  if (total >= WHITELIST_THRESHOLDS.discountMint || today >= 1) {
    return {
      tier: "discount",
      totalBonga: total,
      bongaToday: today,
      discountPercent: WHITELIST_THRESHOLDS.discountPercent,
      label: `${WHITELIST_THRESHOLDS.discountPercent}% Off — Bonk Miner Fam`,
      eligible: true,
    };
  }

  return {
    tier: "none",
    totalBonga: total,
    bongaToday: today,
    discountPercent: 0,
    label: "Mine $BONGA in Bonk Miner for whitelist perks",
    eligible: false,
  };
}

export function getMinerStorageKey() {
  return STORAGE_KEY;
}