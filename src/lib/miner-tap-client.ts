import bs58 from "bs58";
import type { Wallet } from "@solana/wallet-adapter-react";
import { buildMinerSessionMessage } from "@/lib/treasury/messages";

export interface MinerEarnedStatus {
  wallet: string;
  date: string;
  taps: number;
  earned: number;
  claimed: number;
  claimable: number;
  bankedBonga?: number;
  bankMinWithdraw?: number;
  dailyLimitReached?: boolean;
  nextDailyReset?: string;
  limitMessage?: string | null;
}

export interface MinerTapSuccess {
  ok: true;
  taps: number;
  earned: number;
  dailyLimitReached?: boolean;
  nextDailyReset?: string;
  limitMessage?: string | null;
}

export interface MinerTapError {
  error: string;
  code?: string;
  taps?: number;
  earned?: number;
  dailyLimitReached?: boolean;
  nextDailyReset?: string;
  limitMessage?: string | null;
}

const SESSION_KEY = "bonga-miner-session-v1";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function sessionStorageKey(wallet: string) {
  return `${SESSION_KEY}:${wallet.toLowerCase()}`;
}

export function getStoredMinerSession(wallet: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(sessionStorageKey(wallet));
  } catch {
    return null;
  }
}

export function storeMinerSession(wallet: string, token: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(sessionStorageKey(wallet), token);
  } catch {
    // private mode
  }
}

export function clearMinerSession(wallet: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(sessionStorageKey(wallet));
  } catch {
    // ignore
  }
}

function generateNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * One wallet signature → 24h miner session (no per-tap popups).
 */
export async function ensureMinerSession(params: {
  wallet: string;
  connectedWallet: Wallet | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
  force?: boolean;
}): Promise<string> {
  const existing = getStoredMinerSession(params.wallet);
  if (existing && !params.force) return existing;

  if (!params.signMessage) {
    throw new Error("Wallet does not support message signing.");
  }

  const at = new Date().toISOString();
  const nonce = generateNonce();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const message = buildMinerSessionMessage({
    wallet: params.wallet,
    at,
    nonce,
    expiresAt,
  });
  const messageBytes = new TextEncoder().encode(message);
  const signature = await params.signMessage(messageBytes);

  const payload: Record<string, string> = {
    wallet: params.wallet,
    at,
    nonce,
    expiresAt,
    signature: bs58.encode(signature),
  };

  const res = await fetch("/api/miner/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data?.sessionToken) {
    throw new Error(data?.error || "Could not start miner session.");
  }
  storeMinerSession(params.wallet, data.sessionToken as string);
  return data.sessionToken as string;
}

export async function fetchMinerEarned(wallet: string): Promise<MinerEarnedStatus | null> {
  try {
    const date = todayKey();
    const sessionToken = getStoredMinerSession(wallet);
    if (!sessionToken) return null;
    const response = await fetch(
      `/api/miner/earned?wallet=${encodeURIComponent(wallet)}&date=${encodeURIComponent(date)}&sessionToken=${encodeURIComponent(sessionToken)}`,
      {
        cache: "no-store",
        headers: { "x-miner-session": sessionToken },
      }
    );
    if (!response.ok) return null;
    return (await response.json()) as MinerEarnedStatus;
  } catch {
    return null;
  }
}

export async function registerMinerTap(params: {
  wallet: string;
  tapIndex: number;
  sessionToken?: string;
}): Promise<MinerTapSuccess | MinerTapError> {
  const sessionToken =
    params.sessionToken || getStoredMinerSession(params.wallet) || "";
  const response = await fetch("/api/miner/tap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken ? { "x-miner-session": sessionToken } : {}),
    },
    body: JSON.stringify({
      wallet: params.wallet,
      date: todayKey(),
      tapIndex: params.tapIndex,
      sessionToken: sessionToken || undefined,
    }),
  });

  const data = (await response.json()) as MinerTapSuccess | MinerTapError;
  if (!response.ok) {
    const errData = data as MinerTapError;
    return {
      error: errData.error || "Tap registration failed.",
      code: errData.code,
      taps: errData.taps,
      earned: errData.earned,
      dailyLimitReached: errData.dailyLimitReached,
      nextDailyReset: errData.nextDailyReset,
      limitMessage: errData.limitMessage,
    };
  }

  return data as MinerTapSuccess;
}
