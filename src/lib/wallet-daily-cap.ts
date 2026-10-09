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
 * Economy v2 on-chain withdraw caps (per wallet per UTC day).
 * Free games stay lean; staking keeps a larger headroom.
 */
export const DEFAULT_WALLET_MAX_ON_CHAIN_GAME_PER_DAY = 200;
export const DEFAULT_WALLET_MAX_ON_CHAIN_STAKE_PER_DAY = 5000;
export const DEFAULT_WALLET_MAX_ON_CHAIN_BONGA_PER_DAY =
  DEFAULT_WALLET_MAX_ON_CHAIN_GAME_PER_DAY +
  DEFAULT_WALLET_MAX_ON_CHAIN_STAKE_PER_DAY; // 5200

export function walletMaxOnChainGamePerDay(): number {
  return envInt(
    "WALLET_MAX_ON_CHAIN_GAME_PER_DAY",
    DEFAULT_WALLET_MAX_ON_CHAIN_GAME_PER_DAY
  );
}

export function walletMaxOnChainStakePerDay(): number {
  return envInt(
    "WALLET_MAX_ON_CHAIN_STAKE_PER_DAY",
    DEFAULT_WALLET_MAX_ON_CHAIN_STAKE_PER_DAY
  );
}

/**
 * Combined daily on-chain wallet cap (treasury → wallet).
 * Defaults to game + stake. Override with WALLET_MAX_ON_CHAIN_BONGA_PER_DAY.
 */
export function walletMaxOnChainBongaPerDay(): number {
  const combined =
    walletMaxOnChainGamePerDay() + walletMaxOnChainStakePerDay();
  return envInt("WALLET_MAX_ON_CHAIN_BONGA_PER_DAY", combined);
}

/** Short player-facing blurb for the split cap. */
export function onChainDailyCapBlurb(): string {
  const game = walletMaxOnChainGamePerDay();
  const stake = walletMaxOnChainStakePerDay();
  const total = walletMaxOnChainBongaPerDay();
  return `${total.toLocaleString()}/day on-chain (game ${game.toLocaleString()} + staking ${stake.toLocaleString()})`;
}

/** Minimum vault balance required before on-chain withdraw (0 = none). */
export function onChainClaimRequiresBankMin(): number {
  return getBankMinWithdraw();
}

export type BankWithdrawableSnapshot = {
  dailyOnChainCap: number;
  gameDailyCap: number;
  stakeDailyCap: number;
  alreadyOnChainToday: number;
  remainingDailyCap: number;
  withdrawableToday: number;
  canWithdraw: boolean;
};

/**
 * How much a player can withdraw from Bonga Bank today.
 * Vault balance may exceed the daily on-chain cap — withdrawableToday is always capped.
 */
export function computeBankWithdrawableAmount(params: {
  bankedBonga: number;
  alreadyOnChainToday: number;
  minWithdraw?: number;
}): BankWithdrawableSnapshot {
  const dailyOnChainCap = walletMaxOnChainBongaPerDay();
  const gameDailyCap = walletMaxOnChainGamePerDay();
  const stakeDailyCap = walletMaxOnChainStakePerDay();
  const min = params.minWithdraw ?? getBankMinWithdraw();
  const banked = Math.max(0, params.bankedBonga);
  const already = Math.max(0, params.alreadyOnChainToday);
  const remainingDailyCap = Math.max(0, dailyOnChainCap - already);
  const withdrawableToday = Math.min(banked, remainingDailyCap);
  const canWithdraw = withdrawableToday >= min && withdrawableToday > 0;

  return {
    dailyOnChainCap,
    gameDailyCap,
    stakeDailyCap,
    alreadyOnChainToday: already,
    remainingDailyCap,
    withdrawableToday,
    canWithdraw,
  };
}

/** @deprecated use DEFAULT_WALLET_MAX_ON_CHAIN_BONGA_PER_DAY */
export const WALLET_ON_CHAIN_CAP = DEFAULT_WALLET_MAX_ON_CHAIN_BONGA_PER_DAY;
