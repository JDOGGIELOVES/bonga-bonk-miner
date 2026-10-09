/** $BONGA coin staking — monthly APR cycles (soft-lock + wallet credit at month end). */

export const COIN_STAKE_TIER_MAX = 1_000_000; // up to 1M → high APR
export const COIN_STAKE_APR_HIGH = 0.25; // 25% APR
export const COIN_STAKE_APR_LOW = 0.07; // 7% APR when staked > 1M
export const COIN_STAKE_MIN_AMOUNT = 1;

/** Flat APR: whole position at 25% if ≤1M, else whole position at 7%. */
export function coinStakeApr(stakedAmount: number): number {
  const n = Math.max(0, Number(stakedAmount) || 0);
  if (n <= 0) return 0;
  return n <= COIN_STAKE_TIER_MAX ? COIN_STAKE_APR_HIGH : COIN_STAKE_APR_LOW;
}

/** One month of rewards at the position's APR (not pro-rated by day). */
export function monthlyRewardForStake(stakedAmount: number): number {
  const apr = coinStakeApr(stakedAmount);
  if (apr <= 0) return 0;
  const raw = stakedAmount * (apr / 12);
  // 6 decimal places max for bank deposits
  return Math.floor(raw * 1e6) / 1e6;
}

export function utcMonthKey(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

/** Previous UTC calendar month key. */
export function previousUtcMonthKey(d = new Date()): string {
  const x = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1, 0, 0, 0, 0)
  );
  return utcMonthKey(x);
}

export function monthKeyToLabel(monthKey: string): string {
  const [ys, ms] = monthKey.split("-");
  const y = Number(ys);
  const m = Number(ms);
  if (!y || !m) return monthKey;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** End of month UTC (exclusive = start of next month). */
export function endOfUtcMonthMs(monthKey: string): number {
  const [ys, ms] = monthKey.split("-").map(Number);
  return Date.UTC(ys, ms, 1, 0, 0, 0, 0); // day 1 of next month
}

export function startOfUtcMonthMs(monthKey: string): number {
  const [ys, ms] = monthKey.split("-").map(Number);
  return Date.UTC(ys, ms - 1, 1, 0, 0, 0, 0);
}

export function aprPercentLabel(apr: number): string {
  return `${(apr * 100).toFixed(0)}%`;
}
