/** Central kill switch — all treasury SPL payouts must pass this.
 *  Enhanced with runtime auto-pause (anomaly/velocity) + global velocity skeleton.
 */

// Runtime auto-pause state (survives hot reloads in dev, resets on full cold start / new instance).
// For stronger durability across deploys use a blob "treasury-auto-pause.json" — here we keep a
// simple in-memory + manual CLAIMS_PAUSED env override for ops.
let autoPausedUntilMs = 0;
let autoPauseReason = "";

export function triggerAutoPause(durationMinutes: number, reason: string) {
  const until = Date.now() + Math.max(1, durationMinutes) * 60 * 1000;
  autoPausedUntilMs = until;
  autoPauseReason = reason || "Anomalous treasury activity detected";
  console.error("[TREASURY AUTO-PAUSE]", { until: new Date(until).toISOString(), reason });
}

export function clearAutoPause() {
  autoPausedUntilMs = 0;
  autoPauseReason = "";
}

/** Global velocity (simple counters, best-effort; callers increment on successful payouts). */
let lastWindowStart = Date.now();
let payoutsInWindow = 0;
const VELOCITY_WINDOW_MS = 5 * 60 * 1000; // 5 min
const MAX_PAYOUTS_PER_WINDOW = 120; // tune; burst of 120 claims / 5min is already very high for this game

function rollVelocityWindow(now = Date.now()) {
  if (now - lastWindowStart > VELOCITY_WINDOW_MS) {
    lastWindowStart = now;
    payoutsInWindow = 0;
  }
}

export function recordPayoutVelocity() {
  const now = Date.now();
  rollVelocityWindow(now);
  payoutsInWindow += 1;
  if (payoutsInWindow > MAX_PAYOUTS_PER_WINDOW) {
    // Auto-pause on sustained global velocity breach
    triggerAutoPause(20, `Global velocity breach: >${MAX_PAYOUTS_PER_WINDOW} payouts in 5min window`);
  }
}

export function currentGlobalVelocity() {
  rollVelocityWindow();
  return { count: payoutsInWindow, windowMs: VELOCITY_WINDOW_MS, limit: MAX_PAYOUTS_PER_WINDOW };
}

/** Central kill switch — all treasury SPL payouts must pass this. */
export function treasuryPayoutsAllowed(): boolean {
  if (process.env.CLAIMS_PAYOUTS_UNLOCKED !== "true") return false;
  if (process.env.CLAIMS_PAUSED === "true") return false;
  if (process.env.ON_CHAIN_CLAIMS_ENABLED !== "true") return false;
  if (Date.now() < autoPausedUntilMs) return false;
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
  if (Date.now() < autoPausedUntilMs) {
    return `Treasury auto-paused due to anomalous activity. ${autoPauseReason}. Try again later.`;
  }
  return "Treasury payouts are not allowed.";
}