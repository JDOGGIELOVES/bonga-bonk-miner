import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { readBlobText, writeBlobText } from "@/lib/blob-json-store";
import { withWalletClaimLock } from "@/lib/claim-lock";
import { recordGlobalClaim } from "@/lib/claim-tally-store";

const BANK_BLOB_DIR = "bonga-bank";
const MIN_BANK_WITHDRAW = envInt("BONGA_BANK_MIN_WITHDRAW", 0); // 0 = no minimum. Players can withdraw any amount they have in vault (e.g. their 10,000) up to the daily on-chain cap of 20,001.

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getBankMinWithdraw(): number {
  return MIN_BANK_WITHDRAW;
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

function getLocalDataDir(): string {
  if (isVercelRuntime()) {
    return path.join(os.tmpdir(), "bonga-bank");
  }
  return path.join(process.cwd(), ".bonga-bank-data");
}

function walletFile(wallet: string): string {
  const safe = wallet.trim().replace(/[^a-zA-Z0-9]/g, "_");
  return `${BANK_BLOB_DIR}/${safe}.json`;
}

function localWalletPath(wallet: string): string {
  const safe = wallet.trim().replace(/[^a-zA-Z0-9]/g, "_");
  return path.join(getLocalDataDir(), `${safe}.json`);
}

export interface BongaBankRecord {
  wallet: string;
  bankedBonga: number; // current accumulated balance (off-chain)
  lifetimeBanked: number;
  lifetimeWithdrawn: number;
  lastDepositAt?: string; // ISO
  lastWithdrawAt?: string; // ISO
  updatedAt: string;
  depositHistory?: BankDeposit[];
}

export interface BankDeposit {
  ts: number;      // timestamp
  amount: number;
  source?: string; // "miner" | "garden" | "pet" | "stake" etc.
  date?: string;   // YYYY-MM-DD for context
}

function emptyBank(wallet: string): BongaBankRecord {
  return {
    wallet: wallet.trim(),
    bankedBonga: 0,
    lifetimeBanked: 0,
    lifetimeWithdrawn: 0,
    updatedAt: new Date().toISOString(),
    depositHistory: [],
  };
}

export async function getBongaBank(wallet: string): Promise<BongaBankRecord> {
  const normalized = wallet.trim();
  if (useBlobStorage()) {
    const raw = await readBlobText(walletFile(normalized));
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<BongaBankRecord>;
        return { ...emptyBank(normalized), ...parsed };
      } catch {
        return emptyBank(normalized);
      }
    }
    return emptyBank(normalized);
  }

  const fp = localWalletPath(normalized);
  try {
    const raw = await readFile(fp, "utf8");
    const parsed = JSON.parse(raw) as Partial<BongaBankRecord>;
    return { ...emptyBank(normalized), ...parsed };
  } catch {
    return emptyBank(normalized);
  }
}

async function saveBongaBank(record: BongaBankRecord): Promise<void> {
  record.updatedAt = new Date().toISOString();
  const text = JSON.stringify(record, null, 2) + "\n";

  if (useBlobStorage()) {
    await writeBlobText(walletFile(record.wallet), text);
    return;
  }

  const fp = localWalletPath(record.wallet);
  await mkdir(path.dirname(fp), { recursive: true });
  await writeFile(fp, text, "utf8");
}

/**
 * Credits (deposits) an amount into the player's Bonga Bank.
 * Call this from earning sources after the player elects to "bank" their pending earnings.
 * Idempotency / safety should be handled by the caller (e.g. by zeroing pending in the source store first).
 */
export async function depositToBank(
  wallet: string,
  amount: number,
  meta?: { source?: string; date?: string }
): Promise<BongaBankRecord> {
  if (!amount || amount <= 0) {
    return getBongaBank(wallet);
  }

  return withWalletClaimLock(wallet, "bank-deposit", async () => {
    const bank = await getBongaBank(wallet);
    const safeAmount = Math.max(0, Math.floor(amount * 1000) / 1000); // 3 decimals safety like other bonga

    const previousLifetime = bank.lifetimeBanked || 0;
    const isNewPlayer = previousLifetime === 0;

    bank.bankedBonga = Math.max(0, (bank.bankedBonga || 0) + safeAmount);
    bank.lifetimeBanked = previousLifetime + safeAmount;
    bank.lastDepositAt = new Date().toISOString();

    // Append simple deposit history log (keep last 50 entries)
    const entry: BankDeposit = {
      ts: Date.now(),
      amount: safeAmount,
      source: meta?.source,
      date: meta?.date,
    };
    bank.depositHistory = [...(bank.depositHistory || []), entry].slice(-50);

    await saveBongaBank(bank);

    // Update global community mined & banked stats
    try {
      await updateGlobalBankStatsOnDeposit(safeAmount, isNewPlayer);
    } catch (e) {
      console.error("Failed to update global bank stats (non-fatal):", e);
    }

    // Record to the global claim tally so "Community Claimed" / total paid out stats show the earnings
    // (even for off-chain bank deposits; unifies the community numbers across sources)
    try {
      await recordGlobalClaim(safeAmount, (meta?.source as any) || 'other', wallet);
    } catch (e) {
      console.error("Failed to record global claim to tally for deposit (non-fatal):", e);
    }

    return bank;
  }, "bank");
}

/**
 * Attempts to withdraw `amount` from the bank on-chain.
 * Enforces the global MIN_BANK_WITHDRAW threshold.
 * The caller (API route) must have already verified the wallet signature for this exact amount + nonce + date.
 * After successful treasury transfer, this subtracts the amount.
 */
export async function withdrawFromBank(
  wallet: string,
  amount: number
): Promise<{ bank: BongaBankRecord; withdrawn: number }> {
  if (!amount || amount <= 0) {
    throw new Error("Withdraw amount must be positive.");
  }

  const min = getBankMinWithdraw();
  if (amount < min) {
    throw new Error(`Minimum Bonga Bank withdrawal is ${min.toLocaleString()} $BONGA.`);
  }

  return withWalletClaimLock(wallet, "bank-withdraw", async () => {
    const bank = await getBongaBank(wallet);

    if (amount > bank.bankedBonga) {
      throw new Error("Withdraw amount exceeds current Bonga Bank balance.");
    }

    // The actual on-chain transfer + nonce consumption + safety happens in the calling route
    // (using the hardened transferBongaFromTreasury + consumeNonceIfFresh).
    // Here we just perform the off-chain debit after the route has decided the on-chain part succeeded.

    bank.bankedBonga = Math.max(0, bank.bankedBonga - amount);
    bank.lifetimeWithdrawn = (bank.lifetimeWithdrawn || 0) + amount;
    bank.lastWithdrawAt = new Date().toISOString();

    await saveBongaBank(bank);

    return { bank, withdrawn: amount };
  }, "bank");
}

/** Helper to get a summary for UI (bank balance + whether withdraw is possible now). */
export async function getBankStatus(wallet: string) {
  const bank = await getBongaBank(wallet);
  const min = getBankMinWithdraw();
  return {
    bankedBonga: bank.bankedBonga,
    lifetimeBanked: bank.lifetimeBanked,
    lifetimeWithdrawn: bank.lifetimeWithdrawn,
    minWithdraw: min,
    canWithdraw: bank.bankedBonga >= min,
    lastActivity: bank.lastWithdrawAt || bank.lastDepositAt || bank.updatedAt,
    recentDeposits: (bank.depositHistory || []).slice(-20),
  };
}

// ====================== GLOBAL COMMUNITY MINED & BANKED STATS ======================

const GLOBAL_BANK_STATS_BLOB = "bonga-bank/global-stats.json";

export interface GlobalBankStats {
  totalLifetimeBanked: number;   // cumulative $BONGA deposited into all banks (mined & saved)
  totalUniquePlayers: number;    // unique wallets that have ever deposited into the bank
  lastUpdated: string;
}

function emptyGlobalBankStats(): GlobalBankStats {
  return {
    totalLifetimeBanked: 0,
    totalUniquePlayers: 0,
    lastUpdated: new Date().toISOString(),
  };
}

// In-memory last-good cache for the vault's "Community Mined & Banked" numbers.
// Same resilience fix as the claim tally so these don't reset to zero on transient storage misses.
let lastGoodBankStats: GlobalBankStats | null = null;

async function readGlobalBankStats(): Promise<GlobalBankStats> {
  try {
    let raw: string | null = null;
    if (useBlobStorage()) {
      raw = await readBlobText(GLOBAL_BANK_STATS_BLOB);
    } else {
      const fp = path.join(getLocalDataDir(), "global-stats.json");
      try {
        raw = await readFile(fp, "utf8");
      } catch {
        raw = null;
      }
    }
    if (!raw) {
      if (lastGoodBankStats) return { ...lastGoodBankStats };
      const empty = emptyGlobalBankStats();
      lastGoodBankStats = empty;
      return empty;
    }
    const parsed = JSON.parse(raw) as Partial<GlobalBankStats>;
    const stats = {
      totalLifetimeBanked: Math.max(0, Number(parsed.totalLifetimeBanked) || 0),
      totalUniquePlayers: Math.max(0, Number(parsed.totalUniquePlayers) || 0),
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
    lastGoodBankStats = stats;
    return stats;
  } catch {
    if (lastGoodBankStats) return { ...lastGoodBankStats };
    return emptyGlobalBankStats();
  }
}

async function writeGlobalBankStats(stats: GlobalBankStats): Promise<void> {
  stats.lastUpdated = new Date().toISOString();
  const body = JSON.stringify(stats, null, 2);

  if (useBlobStorage()) {
    await writeBlobText(GLOBAL_BANK_STATS_BLOB, body);
    return;
  }

  // local fallback
  const fp = path.join(getLocalDataDir(), "global-stats.json");
  await mkdir(path.dirname(fp), { recursive: true });
  await writeFile(fp, body, "utf8");
}

export async function getGlobalBankStats(): Promise<GlobalBankStats> {
  return readGlobalBankStats();
}

async function updateGlobalBankStatsOnDeposit(amount: number, isNewPlayer: boolean): Promise<GlobalBankStats> {
  const stats = await readGlobalBankStats();
  stats.totalLifetimeBanked = (stats.totalLifetimeBanked || 0) + Math.max(0, amount);
  if (isNewPlayer) {
    stats.totalUniquePlayers = (stats.totalUniquePlayers || 0) + 1;
  }
  await writeGlobalBankStats(stats);
  lastGoodBankStats = { ...stats }; // keep cache fresh after successful write
  return stats;
}
