/** Central kill switch — all treasury SPL payouts must pass this. */
export function treasuryPayoutsAllowed(): boolean {
  if (process.env.CLAIMS_PAYOUTS_UNLOCKED !== "true") return false;
  if (process.env.CLAIMS_PAUSED === "true") return false;
  if (process.env.ON_CHAIN_CLAIMS_ENABLED !== "true") return false;
  return true;
}

export function treasuryPayoutsBlockedReason(): string {
  if (process.env.CLAIMS_PAYOUTS_UNLOCKED !== "true") {
    return "Treasury payouts are locked. Set CLAIMS_PAYOUTS_UNLOCKED=true in Vercel only after security review.";
  }
  if (process.env.CLAIMS_PAUSED === "true") {
    return "Claims are temporarily paused.";
  }
  if (process.env.ON_CHAIN_CLAIMS_ENABLED !== "true") {
    return "On-chain claims are disabled.";
  }
  return "Treasury payouts are not allowed.";
}