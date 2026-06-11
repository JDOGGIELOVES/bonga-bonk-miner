import bs58 from "bs58";
import type { Wallet } from "@solana/wallet-adapter-react";
import { buildClaimMessage } from "@/lib/treasury/messages";
import { signClaimMessage } from "@/lib/wallet-claim-sign";

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
      updatedAt: data.updatedAt,
    };
  } catch {
    return {
      totalBonga: 0,
      claimCount: 0,
      miner: { bonga: 0, claims: 0 },
      garden: { bonga: 0, claims: 0 },
      pet: { bonga: 0, claims: 0 },
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
  const message = buildClaimMessage({
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
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