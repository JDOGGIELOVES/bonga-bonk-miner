import bs58 from "bs58";
import type { Wallet } from "@solana/wallet-adapter-react";
import {
  buildPetClaimMessage,
  buildPetSubmissionMessage,
} from "@/lib/pet-love-messages";
import { PET_LOVE_REWARD } from "@/lib/pet-love";
import { signClaimMessage } from "@/lib/wallet-claim-sign";

/** High-entropy short nonce for pet actions. */
function generateNonce(): string {
  const rnd = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
  return `${Date.now().toString(36)}-${rnd}`;
}
function defaultClaimExpiresAt(date: string): string {
  return new Date(`${date}T23:59:59.000Z`).toISOString().replace(/\.000Z$/, "Z");
}

export interface PetGalleryItem {
  id: string;
  date: string;
  petLabel: string;
  imagePath: string;
  submittedAt: string;
}

export interface PetGlobalClaimCap {
  claimsToday: number;
  maxClaims: number | null;
  capReached: boolean;
}

export interface PetIpLimits {
  submissionsToday: number;
  claimsToday: number;
  maxSubmissions: number;
  maxClaims: number;
  submissionCapReached: boolean;
  claimCapReached: boolean;
}

export interface PetStatus {
  submittedToday: boolean;
  claimedToday: boolean;
  submission: PetGalleryItem | null;
  reward: number;
  treasuryEnabled: boolean;
  claimsPaused?: boolean;
  dailyOnChainLimit?: number;
  ipLimits?: PetIpLimits | null;
  globalClaimCap?: PetGlobalClaimCap | null;
}

export interface PetSubmitSuccess {
  ok: true;
  submission: PetGalleryItem;
}

export interface PetImageCheckResult {
  ok: boolean;
  duplicate: boolean;
  exact?: boolean;
  similar?: boolean;
  distance?: number;
  reason?: string;
}

export interface PetClaimSuccess {
  ok: true;
  signature: string;
  amount: number;
  explorerUrl: string;
}

export async function fetchPetGallery(): Promise<PetGalleryItem[]> {
  const response = await fetch("/api/pet/gallery", { cache: "no-store" });
  if (!response.ok) return [];
  const data = (await response.json()) as { items?: PetGalleryItem[] };
  return data.items ?? [];
}

export async function fetchPetPastUploads(wallet: string): Promise<PetGalleryItem[]> {
  const response = await fetch(
    `/api/pet/history?wallet=${encodeURIComponent(wallet)}`,
    { cache: "no-store" }
  );
  if (!response.ok) return [];
  const data = (await response.json()) as { items?: PetGalleryItem[] };
  return data.items ?? [];
}

export async function checkPetImageDuplicate(params: {
  imageHash: string;
  perceptualHash: string;
}): Promise<PetImageCheckResult> {
  const form = new FormData();
  form.append("imageHash", params.imageHash);
  form.append("perceptualHash", params.perceptualHash);

  const response = await fetch("/api/pet/check-image", {
    method: "POST",
    body: form,
  });

  const data = (await response.json()) as PetImageCheckResult & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "Could not check image for duplicates.");
  }

  return data;
}

export async function fetchPetStatus(wallet: string): Promise<PetStatus> {
  const response = await fetch(
    `/api/pet/status?wallet=${encodeURIComponent(wallet)}`,
    { cache: "no-store" }
  );
  const data = (await response.json()) as PetStatus;
  return data;
}

export async function submitPetPhoto(params: {
  wallet: string;
  date: string;
  file: File;
  imageHash: string;
  petLabel: string;
  confidence: number;
  connectedWallet: Wallet | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<PetSubmitSuccess> {
  const message = buildPetSubmissionMessage({
    wallet: params.wallet,
    date: params.date,
    imageHash: params.imageHash,
    petLabel: params.petLabel,
    confidence: params.confidence,
  });
  const messageBytes = new TextEncoder().encode(message);
  const { signature, signedMessage } = await signClaimMessage({
    wallet: params.connectedWallet,
    signMessage: params.signMessage,
    walletAddress: params.wallet,
    messageBytes,
  });

  const form = new FormData();
  form.append("wallet", params.wallet);
  form.append("date", params.date);
  form.append("imageHash", params.imageHash);
  form.append("petLabel", params.petLabel);
  form.append("confidence", String(params.confidence));
  form.append("signature", bs58.encode(signature));
  if (
    signedMessage.length !== messageBytes.length ||
    signedMessage.some((byte, index) => byte !== messageBytes[index])
  ) {
    form.append("signedMessage", bs58.encode(signedMessage));
  }
  form.append("image", params.file);

  const response = await fetch("/api/pet/submit", {
    method: "POST",
    body: form,
  });

  const data = (await response.json()) as PetSubmitSuccess | { error: string };
  if (!response.ok) {
    throw new Error("error" in data ? data.error : "Submission failed.");
  }

  return data as PetSubmitSuccess;
}

export async function claimPetReward(params: {
  wallet: string;
  date: string;
  submissionId: string;
  connectedWallet: Wallet | null;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<PetClaimSuccess> {
  const nonce = generateNonce();
  const expiresAt = defaultClaimExpiresAt(params.date);
  const message = buildPetClaimMessage({
    wallet: params.wallet,
    amount: PET_LOVE_REWARD,
    date: params.date,
    submissionId: params.submissionId,
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
    amount: PET_LOVE_REWARD,
    date: params.date,
    submissionId: params.submissionId,
    nonce,
    expiresAt,
    signature: bs58.encode(signature),
  };

  if (
    signedMessage.length !== messageBytes.length ||
    signedMessage.some((byte, index) => byte !== messageBytes[index])
  ) {
    payload.signedMessage = bs58.encode(signedMessage);
  }

  const response = await fetch("/api/pet/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as PetClaimSuccess | { error: string };
  if (!response.ok) {
    throw new Error("error" in data ? data.error : "Claim failed.");
  }

  return data as PetClaimSuccess;
}