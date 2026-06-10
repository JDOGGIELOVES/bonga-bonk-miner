import bs58 from "bs58";
import type { Wallet } from "@solana/wallet-adapter-react";
import {
  buildPetClaimMessage,
  buildPetSubmissionMessage,
} from "@/lib/pet-love-messages";
import { PET_LOVE_REWARD } from "@/lib/pet-love";
import { signClaimMessage } from "@/lib/wallet-claim-sign";

export interface PetGalleryItem {
  id: string;
  date: string;
  petLabel: string;
  imagePath: string;
  submittedAt: string;
}

export interface PetStatus {
  submittedToday: boolean;
  claimedToday: boolean;
  submission: PetGalleryItem | null;
  reward: number;
  treasuryEnabled: boolean;
  claimsPaused?: boolean;
  dailyOnChainLimit?: number;
}

export interface PetSubmitSuccess {
  ok: true;
  submission: PetGalleryItem;
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
  const message = buildPetClaimMessage({
    wallet: params.wallet,
    amount: PET_LOVE_REWARD,
    date: params.date,
    submissionId: params.submissionId,
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