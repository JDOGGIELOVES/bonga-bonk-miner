import bs58 from "bs58";
import type { Wallet } from "@solana/wallet-adapter-react";
import { buildGardenClaimMessage } from "@/lib/garden-claim-messages";
import { signClaimMessage } from "@/lib/wallet-claim-sign";
import type { GardenState } from "@/lib/vibes-garden";
import type { GardenSyncAction } from "@/lib/garden-sync-server";
import { formatErrorMessage } from "@/lib/format-error";

export interface GardenEarnStatus {
  storageReady: boolean;
  claimsPaused: boolean;
  bootstrapped: boolean;
  farmedToday: number;
  claimable: number;
  claimed: number;
  dailyLimit: number;
  hint?: string;
  error?: string;
}

export interface GardenSyncResult {
  ok: boolean;
  farmedToday: number;
  claimable: number;
  claimed: number;
  gardenBonga: number;
  bootstrapped: boolean;
  rejectedActions?: number;
  error?: string;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchGardenEarnStatus(wallet: string): Promise<GardenEarnStatus> {
  try {
    const response = await fetch(
      `/api/garden/status?wallet=${encodeURIComponent(wallet)}&date=${todayKey()}`,
      { cache: "no-store" }
    );
    const data = (await response.json()) as GardenEarnStatus;
    return data;
  } catch {
    return {
      storageReady: false,
      claimsPaused: true,
      bootstrapped: false,
      farmedToday: 0,
      claimable: 0,
      claimed: 0,
      dailyLimit: 400,
      error: "Could not reach garden status API.",
    };
  }
}

export async function syncGardenActions(params: {
  wallet: string;
  actions: GardenSyncAction[];
}): Promise<GardenSyncResult> {
  const response = await fetch("/api/garden/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: params.wallet,
      date: todayKey(),
      actions: params.actions,
    }),
  });

  const data = (await response.json()) as GardenSyncResult & { error?: string };
  if (!response.ok) {
    return {
      ok: false,
      farmedToday: 0,
      claimable: 0,
      claimed: 0,
      gardenBonga: 0,
      bootstrapped: false,
      error: data.error ?? "Garden sync failed.",
    };
  }

  return data;
}

export function buildBootstrapAction(state: GardenState): GardenSyncAction {
  return {
    type: "bootstrap",
    plants: state.plants,
    gardenBonga: state.gardenBonga,
  };
}

export async function requestGardenOnChainClaim(params: {
  wallet: string;
  amount: number;
  connectedWallet: Wallet | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<{ signature: string; amount: number; explorerUrl: string }> {
  const date = todayKey();
  const message = buildGardenClaimMessage({
    wallet: params.wallet,
    amount: params.amount,
    date,
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
    date,
    signature: bs58.encode(signature),
  };

  const signedDiffers =
    signedMessage.length !== messageBytes.length ||
    signedMessage.some((byte, index) => byte !== messageBytes[index]);
  if (signedDiffers) {
    payload.signedMessage = bs58.encode(signedMessage);
  }

  const response = await fetch("/api/garden/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as
    | { ok: true; signature: string; amount: number; explorerUrl: string }
    | { error: string };

  if (!response.ok || !("ok" in data) || !data.ok) {
    throw new Error(formatErrorMessage(data, "Garden claim failed."));
  }

  return {
    signature: data.signature,
    amount: data.amount,
    explorerUrl: data.explorerUrl,
  };
}