import bs58 from "bs58";
import type { Wallet } from "@solana/wallet-adapter-react";
import {
  buildClaimMessage,
  buildStakeLockMessage,
  buildStakeUnlockMessage,
  buildBankWithdrawMessage,
} from "@/lib/treasury/messages";
import { signClaimMessage } from "@/lib/wallet-claim-sign";

/** High-entropy short nonce for replay protection (per-message). */
function generateNonce(): string {
  // 10-12 char alphanum, good enough + timestamp prefix for human debug
  const rnd = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
  return `${Date.now().toString(36)}-${rnd}`;
}

/** Recommended short expiration for a claim message (end of current UTC day + small buffer). */
function defaultClaimExpiresAt(date: string): string {
  // date is YYYY-MM-DD; make it expire at 23:59:59Z of that day + 2h grace
  return new Date(`${date}T23:59:59.000Z`).toISOString().replace(/\.000Z$/, "Z");
}

export interface ClaimStatus {
  enabled: boolean;
  treasury?: string;
  mint?: string;
  dailyLimit?: number;
  balances?: {
    sol: number;
    bonga: number;
    tokenAccount?: string;
  };
  error?: string;
  hint?: string;
}

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
  updatedAt?: string;
}

export interface ClaimApiSuccess {
  ok: true;
  signature: string;
  amount: number;
  explorerUrl: string;
}

export interface ClaimApiError {
  error: string;
  alreadyClaimed?: number;
}

export async function fetchGlobalClaimTally(): Promise<GlobalClaimTally> {
  try {
    const response = await fetch("/api/claim/tally", { cache: "no-store" });
    const data = (await response.json()) as GlobalClaimTally;
    const miner = data.miner ?? { bonga: 0, claims: 0 };
    const garden = data.garden ?? { bonga: 0, claims: 0 };
    const pet = data.pet ?? { bonga: 0, claims: 0 };
    const stake = data.stake ?? { bonga: 0, claims: 0 };
    return {
      totalBonga: Number(data.totalBonga) || 0,
      claimCount: Number(data.claimCount) || 0,
      miner: {
        bonga: Number(miner.bonga) || 0,
        claims: Number(miner.claims) || 0,
      },
      garden: {
        bonga: Number(garden.bonga) || 0,
        claims: Number(garden.claims) || 0,
      },
      pet: {
        bonga: Number(pet.bonga) || 0,
        claims: Number(pet.claims) || 0,
      },
      stake: {
        bonga: Number(stake.bonga) || 0,
        claims: Number(stake.claims) || 0,
      },
      updatedAt: data.updatedAt,
    };
  } catch {
    return {
      totalBonga: 0,
      claimCount: 0,
      miner: { bonga: 0, claims: 0 },
      garden: { bonga: 0, claims: 0 },
      pet: { bonga: 0, claims: 0 },
      stake: { bonga: 0, claims: 0 },
    };
  }
}

export async function fetchClaimStatus(): Promise<ClaimStatus> {
  try {
    const response = await fetch("/api/claim", { cache: "no-store" });
    const data = (await response.json()) as ClaimStatus;
    return data;
  } catch {
    return { enabled: false, error: "Could not reach claim API." };
  }
}

export async function requestOnChainClaim(params: {
  wallet: string;
  amount: number;
  date: string;
  connectedWallet: Wallet | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<ClaimApiSuccess> {
  const nonce = generateNonce();
  const expiresAt = defaultClaimExpiresAt(params.date);
  const message = buildClaimMessage({
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
    nonce,
    expiresAt,
  });
  const messageBytes = new TextEncoder().encode(message);
  const { signature, signedMessage } = await signClaimMessage({
    wallet: params.connectedWallet,
    signMessage: params.signMessage,
    walletAddress: params.wallet,
    messageBytes,
  });

  const payload: Record<string, string | number> = {
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
    nonce,
    expiresAt,
    signature: bs58.encode(signature),
  };

  const signedDiffers =
    signedMessage.length !== messageBytes.length ||
    signedMessage.some((byte, index) => byte !== messageBytes[index]);
  if (signedDiffers) {
    payload.signedMessage = bs58.encode(signedMessage);
  }

  const response = await fetch("/api/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ClaimApiSuccess | ClaimApiError;
  if (!response.ok) {
    throw new Error("error" in data ? data.error : "Claim failed.");
  }

  return data as ClaimApiSuccess;
}

/** Build-time hint only — prefer runtime `fetchClaimStatus()` in the UI. */
export function isOnChainClaimsEnabled() {
  return process.env.NEXT_PUBLIC_ON_CHAIN_CLAIMS_ENABLED === "true";
}

export interface FlaggedWallet {
  flaggedAt: string;
  reason: string;
  amountInWindow: number;
  windowLabel?: string;
}

export async function fetchFlaggedWallets(): Promise<Record<string, FlaggedWallet[]>> {
  try {
    const response = await fetch("/api/claim/flags", { cache: "no-store" });
    if (!response.ok) return {};
    const parsed = await response.json();
    // Support legacy
    const result: Record<string, FlaggedWallet[]> = {};
    for (const [w, val] of Object.entries(parsed)) {
      result[w] = Array.isArray(val) ? val : [val as FlaggedWallet];
    }
    return result;
  } catch {
    return {};
  }
}

export interface BlockedWallet {
  blockedUntil: string;
  reason: string;
}

export async function fetchBlockedWallets(): Promise<Record<string, BlockedWallet>> {
  try {
    const response = await fetch("/api/claim/blocked", { cache: "no-store" });
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

// ====================== BONGA BANK (client) ======================

export interface BongaBankStatus {
  bankedBonga: number;
  lifetimeBanked: number;
  lifetimeWithdrawn: number;
  minWithdraw: number;
  canWithdraw: boolean;
  /** Max on-chain payout allowed per wallet per UTC day (default 20,001). */
  dailyOnChainCap?: number;
  /** $BONGA already sent on-chain from treasury to this wallet today. */
  alreadyOnChainToday?: number;
  /** Remaining headroom under the daily on-chain cap. */
  remainingDailyCap?: number;
  /** min(vault balance, remaining daily cap) — amount to sign for withdraw today. */
  withdrawableToday?: number;
  // No vault minimum (primary limit is the 20,001 daily on-chain wallet cap)
  pending: {
    miner: number;
    garden: number;
    stake: number;
    pet: number;
    total: number;
  };
  lastActivity?: string;
  recentDeposits?: Array<{
    ts: number;
    amount: number;
    source?: string;
    date?: string;
  }>;
  community?: {
    totalLifetimeBanked: number;
    totalUniquePlayers: number;
    lastUpdated: string;
  };
  note?: string;
}

export async function fetchBongaBankStatus(wallet: string): Promise<BongaBankStatus | null> {
  try {
    const res = await fetch(`/api/bank/status?wallet=${encodeURIComponent(wallet)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function depositPendingToBank(params: {
  wallet: string;
  source?: "miner" | "garden" | "stake" | "pet" | "all";
  date?: string;
}): Promise<{ ok: boolean; deposited?: Record<string, number>; totalDeposited?: number; newBankBalance?: number; error?: string }> {
  try {
    const res = await fetch("/api/bank/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: params.wallet,
        source: params.source ?? "all",
        date: params.date,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error || "Deposit failed" };
    return { ok: true, ...data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Deposit failed" };
  }
}

export interface BankWithdrawSuccess {
  ok: true;
  signature: string;
  amount: number;
  newBankBalance: number;
  explorerUrl: string;
}

export async function requestBankWithdraw(params: {
  wallet: string;
  amount: number;
  date: string;
  connectedWallet: Wallet | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<BankWithdrawSuccess> {
  const nonce = generateNonce();
  const expiresAt = defaultClaimExpiresAt(params.date);

  const message = buildBankWithdrawMessage({
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
    nonce,
    expiresAt,
  });

  const messageBytes = new TextEncoder().encode(message);
  const { signature, signedMessage } = await signClaimMessage({
    wallet: params.connectedWallet,
    signMessage: params.signMessage,
    walletAddress: params.wallet,
    messageBytes,
  });

  const payload: Record<string, any> = {
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
    nonce,
    expiresAt,
    signature: bs58.encode(signature),
  };

  const signedDiffers =
    signedMessage.length !== messageBytes.length ||
    signedMessage.some((b, i) => b !== messageBytes[i]);
  if (signedDiffers) payload.signedMessage = bs58.encode(signedMessage);

  const res = await fetch("/api/bank/withdraw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error("error" in data ? data.error : "Bank withdraw failed.");
  }
  return data as BankWithdrawSuccess;
}

// --- NFT Staking client helpers ---

export interface StakeStatus {
  ok: boolean;
  heldCount: number;
  isHolder: boolean;
  stakedCount: number;
  stakedAt: string | null;
  lastClaimedAt: string | null;
  pendingBonga: number;
  dailyRate: number;
  canClaim: boolean;
  heldByRarity?: Record<string, number>;
  stakedByRarity?: Record<string, number>;
  totalClaimed?: number; // cumulative deposited to your Bonga Bank Vault from staking (running total, does not reset when pending is deposited)
  minClaim: number;
  error?: string;
}

export async function fetchStakeStatus(wallet: string): Promise<StakeStatus> {
  try {
    const res = await fetch(`/api/stake/status?wallet=${encodeURIComponent(wallet)}`, { cache: "no-store" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return { ok: false, heldCount: 0, isHolder: false, stakedCount: 0, stakedAt: null, lastClaimedAt: null, pendingBonga: 0, dailyRate: 0, canClaim: false, minClaim: 10, error: j?.error || "Failed to load stake status" };
    }
    return await res.json();
  } catch {
    return { ok: false, heldCount: 0, isHolder: false, stakedCount: 0, stakedAt: null, lastClaimedAt: null, pendingBonga: 0, dailyRate: 0, canClaim: false, minClaim: 10, error: "Could not reach staking service." };
  }
}

export interface StakeActionSuccess {
  ok: true;
  stakedCount?: number;
  stakedAt?: string;
  unstaked?: boolean;
  signature?: string;
  amount?: number;
  explorerUrl?: string;
}

export async function requestStakeLock(params: {
  wallet: string;
  tiers: Record<string, number>; // { Common: number, Rare: number, ... }
  at: string;
  connectedWallet: Wallet | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<StakeActionSuccess> {
  const nonce = generateNonce();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // short for lock actions
  const message = buildStakeLockMessage({
    wallet: params.wallet,
    tiers: params.tiers,
    at: params.at,
    nonce,
    expiresAt,
  });
  const messageBytes = new TextEncoder().encode(message);
  const { signature, signedMessage } = await signClaimMessage({
    wallet: params.connectedWallet,
    signMessage: params.signMessage,
    walletAddress: params.wallet,
    messageBytes,
  });

  const payload: any = {
    wallet: params.wallet,
    tiers: params.tiers,
    at: params.at,
    nonce,
    expiresAt,
    signature: bs58.encode(signature),
  };
  const signedDiffers = signedMessage.length !== messageBytes.length || !signedMessage.every((b, i) => b === messageBytes[i]);
  if (signedDiffers) payload.signedMessage = bs58.encode(signedMessage);

  const res = await fetch("/api/stake/lock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Stake lock failed.");
  return data as StakeActionSuccess;
}

export async function requestStakeUnlock(params: {
  wallet: string;
  at: string;
  connectedWallet: Wallet | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<StakeActionSuccess> {
  const nonce = generateNonce();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const message = buildStakeUnlockMessage({
    wallet: params.wallet,
    at: params.at,
    nonce,
    expiresAt,
  });
  const messageBytes = new TextEncoder().encode(message);
  const { signature, signedMessage } = await signClaimMessage({
    wallet: params.connectedWallet,
    signMessage: params.signMessage,
    walletAddress: params.wallet,
    messageBytes,
  });

  const payload: any = {
    wallet: params.wallet,
    at: params.at,
    nonce,
    expiresAt,
    signature: bs58.encode(signature),
  };
  if (signedMessage.length !== messageBytes.length || !signedMessage.every((b, i) => b === messageBytes[i])) {
    payload.signedMessage = bs58.encode(signedMessage);
  }

  const res = await fetch("/api/stake/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Stake unlock failed.");
  return data as StakeActionSuccess;
}

export async function requestStakeClaim(params: {
  wallet: string;
  amount: number;
  date: string;
  connectedWallet: Wallet | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<StakeActionSuccess> {
  // Reuse the exact same message builder as regular claims for the payout signature (now with nonce)
  const nonce = generateNonce();
  const expiresAt = defaultClaimExpiresAt(params.date);
  const message = buildClaimMessage({
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
    nonce,
    expiresAt,
  });
  const messageBytes = new TextEncoder().encode(message);
  const { signature, signedMessage } = await signClaimMessage({
    wallet: params.connectedWallet,
    signMessage: params.signMessage,
    walletAddress: params.wallet,
    messageBytes,
  });

  const payload: Record<string, string | number> = {
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
    nonce,
    expiresAt,
    signature: bs58.encode(signature),
  };
  const signedDiffers =
    signedMessage.length !== messageBytes.length ||
    signedMessage.some((byte, index) => byte !== messageBytes[index]);
  if (signedDiffers) {
    payload.signedMessage = bs58.encode(signedMessage);
  }

  const res = await fetch("/api/stake/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error("error" in data ? data.error : "Stake claim failed.");
  }
  return data as StakeActionSuccess;
}
