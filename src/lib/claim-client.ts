import bs58 from "bs58";
import { buildClaimMessage } from "@/lib/treasury/messages";

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

export async function requestOnChainClaim(params: {
  wallet: string;
  amount: number;
  date: string;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<ClaimApiSuccess> {
  const message = buildClaimMessage({
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
  });
  const messageBytes = new TextEncoder().encode(message);
  const signature = await params.signMessage(messageBytes);

  const response = await fetch("/api/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: params.wallet,
      amount: params.amount,
      date: params.date,
      signature: bs58.encode(signature),
    }),
  });

  const data = (await response.json()) as ClaimApiSuccess | ClaimApiError;
  if (!response.ok) {
    throw new Error("error" in data ? data.error : "Claim failed.");
  }

  return data as ClaimApiSuccess;
}

export function isOnChainClaimsEnabled() {
  return process.env.NEXT_PUBLIC_ON_CHAIN_CLAIMS_ENABLED === "true";
}