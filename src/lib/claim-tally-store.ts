import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { withWalletClaimLock } from "./claim-lock";
import { readBlobText, writeBlobText } from "@/lib/blob-json-store";
import { triggerAutoPause, recordPayoutVelocity } from "@/lib/treasury/payout-guard";

const TALLY_BLOB_PATH = "bonga-claims/global-tally.json";
const WALLET_CLAIM_LOGS_PATH = "bonga-claims/wallet-claim-logs.json";
const FLAGGED_WALLETS_PATH = "bonga-claims/flagged-wallets.json";
const BLOCKED_WALLETS_PATH = "bonga-claims/blocked-wallets.json";

export const SUSPICIOUS_RULES = [
  { windowMs: 5 * 60 * 1000, threshold: 1000, label: '5min' },
  { windowMs: 10 * 60 * 1000, threshold: 2000, label: '10min' },
  { windowMs: 60 * 60 * 1000, threshold: 3000, label: '1h' },
] as const;

export const SUSPICIOUS_HOURLY_THRESHOLD = 3000; // kept for reference / legacy

const ONE_HOUR_MS = 60 * 60 * 1000;  // max window for pruning

// In-memory last-good cache for the community claim tally.
// Prevents the "all fields zero" problem on transient read failures or when blob storage
// is not (yet) configured and the code falls back to ephemeral /tmp on Vercel serverless.
let lastGoodTally: GlobalClaimTally | null = null;

export interface CategoryTally {
  bonga: number;
  claims: number;
}

export interface GlobalClaimTally {
  totalBonga: number;
  claimCount: number;
  miner: CategoryTally;
  garden: CategoryTally;
  pet: CategoryTally;
  stake: CategoryTally;
  updatedAt: string;
}

function emptyCategory(): CategoryTally {
  return { bonga: 0, claims: 0 };
}

function emptyTally(): GlobalClaimTally {
  return {
    totalBonga: 0,
    claimCount: 0,
    miner: emptyCategory(),
    garden: emptyCategory(),
    pet: emptyCategory(),
    stake: emptyCategory(),
    updatedAt: new Date().toISOString(),
  };
}

function envFlag(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

function hasBlobCredentials(): boolean {
  if (envFlag("BLOB_READ_WRITE_TOKEN")) return true;
  if (!envFlag("BLOB_STORE_ID")) return false;
  if (isVercelRuntime()) return true;
  return envFlag("VERCEL_OIDC_TOKEN");
}

function useBlobStorage(): boolean {
  if (isVercelRuntime()) return hasBlobCredentials();
  return envFlag("BLOB_READ_WRITE_TOKEN");
}

type BlobAccess = "public" | "private";

function blobAccess(): BlobAccess {
  const configured = process.env.BLOB_DEFAULT_ACCESS?.trim().toLowerCase();
  if (configured === "private" || configured === "public") return configured;
  return "public";
}

export function getTallyStorageStatus() {
  const blobToken = envFlag("BLOB_READ_WRITE_TOKEN");
  const blobStoreId = envFlag("BLOB_STORE_ID");
  const oidcEnv = envFlag("VERCEL_OIDC_TOKEN");
  const vercel = isVercelRuntime();
  const oidcReady = blobStoreId && (oidcEnv || vercel);
  return {
    vercel,
    blobToken,
    blobStoreId,
    oidcEnv,
    storageReady: vercel ? blobToken || oidcReady : true,
    mode: useBlobStorage() ? "blob" : "local",
  };
}

function getLocalDataDir(): string {
  if (isVercelRuntime()) {
    return path.join(os.tmpdir(), "bonga-claim-tally");
  }
  return path.join(process.cwd(), ".bonga-claim-data");
}

function localRecordPath(relative: string): string {
  return path.join(getLocalDataDir(), relative);
}

async function readRecord(pathname: string): Promise<string | null> {
  if (useBlobStorage()) {
    return readBlobText(pathname);
  }

  try {
    return await readFile(localRecordPath(pathname), "utf8");
  } catch {
    return null;
  }
}

async function writeRecord(pathname: string, body: string): Promise<void> {
  if (useBlobStorage()) {
    await writeBlobText(pathname, body);
    return;
  }

  const filePath = localRecordPath(pathname);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body, "utf8");
}

function parseTally(raw: string): GlobalClaimTally {
  const data = JSON.parse(raw) as Partial<GlobalClaimTally>;
  const miner = data.miner ?? emptyCategory();
  const garden = data.garden ?? emptyCategory();
  const pet = data.pet ?? emptyCategory();
  const stake = data.stake ?? emptyCategory();
  return {
    totalBonga: Math.max(0, Number(data.totalBonga) || 0),
    claimCount: Math.max(0, Number(data.claimCount) || 0),
    miner: {
      bonga: Math.max(0, Number(miner.bonga) || 0),
      claims: Math.max(0, Number(miner.claims) || 0),
    },
    garden: {
      bonga: Math.max(0, Number(garden.bonga) || 0),
      claims: Math.max(0, Number(garden.claims) || 0),
    },
    pet: {
      bonga: Math.max(0, Number(pet.bonga) || 0),
      claims: Math.max(0, Number(pet.claims) || 0),
    },
    stake: {
      bonga: Math.max(0, Number(stake.bonga) || 0),
      claims: Math.max(0, Number(stake.claims) || 0),
    },
    updatedAt:
      typeof data.updatedAt === "string"
        ? data.updatedAt
        : new Date().toISOString(),
  };
}

async function getWalletClaimLogs(): Promise<Record<string, WalletClaimEntry[]>> {
  const raw = await readRecord(WALLET_CLAIM_LOGS_PATH);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveWalletClaimLogs(logs: Record<string, WalletClaimEntry[]>): Promise<void> {
  await writeRecord(WALLET_CLAIM_LOGS_PATH, JSON.stringify(logs));
}

export async function getFlaggedWallets(): Promise<Record<string, FlaggedWallet[]>> {
  const raw = await readRecord(FLAGGED_WALLETS_PATH);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    // Support legacy single-object format
    const result: Record<string, FlaggedWallet[]> = {};
    for (const [w, val] of Object.entries(parsed)) {
      result[w] = Array.isArray(val) ? val : [val as FlaggedWallet];
    }
    return result;
  } catch {
    return {};
  }
}

async function saveFlaggedWallets(flagged: Record<string, FlaggedWallet[]>): Promise<void> {
  await writeRecord(FLAGGED_WALLETS_PATH, JSON.stringify(flagged));
}

export async function getBlockedWallets(): Promise<Record<string, BlockedWallet>> {
  const raw = await readRecord(BLOCKED_WALLETS_PATH);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveBlockedWallets(blocked: Record<string, BlockedWallet>): Promise<void> {
  await writeRecord(BLOCKED_WALLETS_PATH, JSON.stringify(blocked));
}

export async function isWalletBlocked(wallet: string): Promise<{ blocked: boolean; until?: string; reason?: string }> {
  const blocked = await getBlockedWallets();
  const entry = blocked[wallet];
  if (!entry) return { blocked: false };

  const untilDate = new Date(entry.blockedUntil);
  if (untilDate > new Date()) {
    return {
      blocked: true,
      until: entry.blockedUntil,
      reason: entry.reason,
    };
  }

  // Expired block - clean up optionally
  delete blocked[wallet];
  await saveBlockedWallets(blocked);
  return { blocked: false };
}

export async function getGlobalClaimTally(): Promise<GlobalClaimTally> {
  const raw = await readRecord(TALLY_BLOB_PATH);
  if (!raw) {
    // Transient read failure or first-ever / no blob creds (falls back to local tmp which is ephemeral).
    // Return last known good value if we have one so the community claimed numbers don't drop to zero.
    if (lastGoodTally) {
      return { ...lastGoodTally };
    }
    // Only seed a brand new empty on very first lifetime read (no cache yet). Do not blindly overwrite.
    const empty = emptyTally();
    try {
      await writeRecord(TALLY_BLOB_PATH, JSON.stringify(empty));
    } catch (e) {
      console.error("Failed to bootstrap claim tally blob (will use in-memory empty until writes succeed):", e);
    }
    lastGoodTally = empty; // remember even the zero so subsequent transient misses don't look worse
    return empty;
  }

  try {
    const parsed = parseTally(raw);
    lastGoodTally = parsed; // success path — cache it for resilience
    return parsed;
  } catch (error) {
    console.error("Claim tally parse failed:", error);
    if (lastGoodTally) {
      return { ...lastGoodTally };
    }
    return emptyTally();
  }
}

export type ClaimCategory = 'miner' | 'garden' | 'pet' | 'stake' | 'bank';

export interface WalletClaimEntry {
  ts: number;
  amount: number;
  category: ClaimCategory;
}

export interface FlaggedWallet {
  flaggedAt: string;
  reason: string;
  amountInWindow: number;
  windowLabel?: string;
}

export interface BlockedWallet {
  blockedUntil: string;
  reason: string;
}

async function trackAndFlagWalletClaim(
  wallet: string,
  amount: number,
  category: ClaimCategory
): Promise<void> {
  const safeAmount = Math.max(0, Math.floor(amount));
  if (safeAmount <= 0) return;

  const now = Date.now();
  const logs = await getWalletClaimLogs();
  let walletLogs = logs[wallet] || [];

  // prune entries older than max window (1h)
  walletLogs = walletLogs.filter((entry) => now - entry.ts < ONE_HOUR_MS);

  // add new claim
  walletLogs.push({ ts: now, amount: safeAmount, category });
  logs[wallet] = walletLogs;

  await saveWalletClaimLogs(logs);

  // Check all suspicious rules
  const flagged = await getFlaggedWallets();
  if (!flagged[wallet]) flagged[wallet] = [];

  const blocked = await getBlockedWallets();

  for (const rule of SUSPICIOUS_RULES) {
    const windowLogs = walletLogs.filter((entry) => now - entry.ts < rule.windowMs);
    const windowSum = windowLogs.reduce((sum, entry) => sum + entry.amount, 0);

    if (windowSum > rule.threshold) {
      // Avoid duplicate flags for the exact same window if recently flagged
      const recentSame = flagged[wallet].some(
        (f) =>
          f.windowLabel === rule.label &&
          now - new Date(f.flaggedAt).getTime() < rule.windowMs
      );
      if (!recentSame) {
        flagged[wallet].push({
          flaggedAt: new Date().toISOString(),
          reason: `Claimed ${windowSum} $BONGA in last ${rule.label} (threshold ${rule.threshold}) across ${windowLogs.length} claims`,
          amountInWindow: windowSum,
          windowLabel: rule.label,
        });

        // Auto-block for 3 days on any new flag
        const blockUntil = new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString();
        const currentBlock = blocked[wallet];
        if (!currentBlock || new Date(currentBlock.blockedUntil) < new Date(blockUntil)) {
          blocked[wallet] = {
            blockedUntil: blockUntil,
            reason: `Auto-blocked for 3 days due to ${rule.label} violation (${windowSum} $BONGA)`,
          };
        }
      }
    }
  }

  await saveFlaggedWallets(flagged);
  await saveBlockedWallets(blocked);
}

export async function recordGlobalClaim(
  amount: number,
  category?: ClaimCategory,
  wallet?: string
): Promise<GlobalClaimTally> {
  const safeAmount = Math.max(0, Math.floor(amount));
  if (safeAmount <= 0) {
    return getGlobalClaimTally();
  }

  // Use a global lock to serialize tally updates and prevent lost updates from concurrent claims
  return await withWalletClaimLock(
    "__GLOBAL_TALLY__",
    "lifetime",
    async () => {
      const current = await getGlobalClaimTally();
      const next: GlobalClaimTally = {
        totalBonga: current.totalBonga + safeAmount,
        claimCount: current.claimCount + 1,
        miner: { ...current.miner },
        garden: { ...current.garden },
        pet: { ...current.pet },
        stake: { ...current.stake },
        updatedAt: new Date().toISOString(),
      };

      if (category === 'miner') {
        next.miner.bonga += safeAmount;
        next.miner.claims += 1;
      } else if (category === 'garden') {
        next.garden.bonga += safeAmount;
        next.garden.claims += 1;
      } else if (category === 'pet') {
        next.pet.bonga += safeAmount;
        next.pet.claims += 1;
      } else if (category === 'stake') {
        next.stake.bonga += safeAmount;
        next.stake.claims += 1;
      } else {
        // legacy: distribute to total only (should not happen after migration)
      }

      await writeRecord(TALLY_BLOB_PATH, JSON.stringify(next));

      // Update the in-memory cache immediately with the value we just persisted.
      // This keeps the community claimed stats stable even if the very next read misses the blob.
      lastGoodTally = next;

      if (wallet && category) {
        await trackAndFlagWalletClaim(wallet, safeAmount, category);
      }

      // Record for global velocity (5min burst limit + auto-pause on breach)
      recordPayoutVelocity();

      // Global anomaly / velocity detection (runs under the global lock)
      try {
        await detectGlobalAnomalyPatterns(safeAmount, wallet, category);
      } catch (e) {
        console.error("Anomaly detector error (non-fatal):", e);
      }

      return next;
    },
    "tally"
  );
}

// ====================== GLOBAL ANOMALY + VELOCITY (stronger auto-pause) ======================

const TINY_CLAIM_THRESHOLD = 50; // $BONGA
const MANY_NEW_WALLETS_WINDOW_MS = 10 * 60 * 1000; // 10 min
const MANY_NEW_WALLETS_THRESHOLD = 12; // >12 distinct "new-ish" wallets doing tiny claims in window -> pause

/** Detect mass tiny claims from many low-history ("new") wallets in a short window.
 *  This directly addresses the attack pattern: attacker created dozens of fresh wallets and drained treasury
 *  with small per-wallet claims (rent + 0.13 SOL each).
 */
async function detectGlobalAnomalyPatterns(
  justClaimedAmount: number,
  justClaimedWallet: string | undefined,
  category?: ClaimCategory
) {
  if (!justClaimedWallet) return;

  const now = Date.now();
  const logs = await getWalletClaimLogs();

  // Collect recent claims in the anomaly window
  const recentClaims: Array<{ wallet: string; ts: number; amount: number; isNewish: boolean }> = [];
  let distinctRecent = new Set<string>();

  for (const [w, entries] of Object.entries(logs)) {
    for (const e of entries) {
      if (now - e.ts > MANY_NEW_WALLETS_WINDOW_MS) continue;
      const isNewish = entries.length <= 2; // first or second time we've seen this wallet claim at all (within 1h prune)
      recentClaims.push({ wallet: w, ts: e.ts, amount: e.amount, isNewish });
      distinctRecent.add(w.toLowerCase());
    }
  }

  // Count tiny claims from new-ish wallets
  const tinyNewClaims = recentClaims.filter(
    (c) => c.amount > 0 && c.amount <= TINY_CLAIM_THRESHOLD && c.isNewish
  );
  const uniqueTinyNewWallets = new Set(tinyNewClaims.map((c) => c.wallet.toLowerCase()));

  if (uniqueTinyNewWallets.size >= MANY_NEW_WALLETS_THRESHOLD) {
    const reason = `Anomaly: ${uniqueTinyNewWallets.size} distinct low-history wallets claimed tiny amounts (<=${TINY_CLAIM_THRESHOLD}) in last ${Math.round(MANY_NEW_WALLETS_WINDOW_MS / 60000)}min. Auto-pausing treasury.`;
    console.error("[TREASURY ANOMALY]", reason);
    triggerAutoPause(45, reason);
    // Also globally flag a sample of the offenders (best effort)
    for (const w of Array.from(uniqueTinyNewWallets).slice(0, 20)) {
      // mark as flagged via existing path (non-blocking)
      try {
        const flagged = await getFlaggedWallets();
        if (!flagged[w]) flagged[w] = [];
        flagged[w].push({
          flaggedAt: new Date().toISOString(),
          reason: "auto: many-new-tiny-wallets pattern",
          amountInWindow: tinyNewClaims.filter((c) => c.wallet.toLowerCase() === w).reduce((s, c) => s + c.amount, 0),
          windowLabel: "anomaly",
        });
        // persist is expensive here; the next record cycle or manual will save, but we can kick a write
      } catch {}
    }
  }

  // Extra: global velocity of distinct recipients (even non-tiny)
  if (distinctRecent.size >= 25 && recentClaims.length >= 30) {
    const vReason = `High distinct recipient velocity: ${distinctRecent.size} different wallets in ${Math.round(MANY_NEW_WALLETS_WINDOW_MS / 60000)}min window.`;
    // Only pause if we also see a bunch of small payouts (defend the exact prior exploit)
    const smallCount = recentClaims.filter((c) => c.amount <= 100).length;
    if (smallCount >= 20) {
      triggerAutoPause(30, vReason + " Combined with many small payouts — auto-paused.");
    }
  }
}

/** Manual flag for a wallet as exploit (e.g. for Pet Love abuse). */
export async function manuallyFlagAsExploit(wallet: string, reason = "Manual flag for exploit") {
  const normalized = wallet.toLowerCase().trim();
  if (!normalized) return;

  const flagged = await getFlaggedWallets();
  if (!flagged[normalized]) flagged[normalized] = [];

  const now = new Date().toISOString();
  flagged[normalized].push({
    flaggedAt: now,
    reason,
    amountInWindow: 0,
    windowLabel: "manual",
  });

  const blocked = await getBlockedWallets();
  const blockUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days for exploits
  blocked[normalized] = {
    blockedUntil: blockUntil,
    reason,
  };

  await saveFlaggedWallets(flagged);
  await saveBlockedWallets(blocked);
}

/** Flag the last N recent Pet Love submissions as exploits. */
export async function flagLastPetLoveExploits(count = 8) {
  const { listGallery } = await import("@/lib/pet-love-store");
  const recent = await listGallery(count);
  const wallets = [...new Set(recent.map((s: any) => (s.wallet || "").toLowerCase().trim()))]
    .filter(Boolean)
    .slice(0, count);

  for (const wallet of wallets) {
    await manuallyFlagAsExploit(wallet, "Pet Love exploit - scripted/multi-wallet abuse");
  }

  return wallets;
}