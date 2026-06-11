import bs58 from "bs58";
import nacl from "tweetnacl";
import { PET_LOVE_DOMAIN } from "@/lib/pet-love";

export function buildPetSubmissionMessage(params: {
  wallet: string;
  date: string;
  imageHash: string;
  petLabel: string;
  confidence: number;
}) {
  const { wallet, date, imageHash, petLabel, confidence } = params;
  return [
    PET_LOVE_DOMAIN,
    "Pet Submission",
    `Wallet: ${wallet}`,
    `Date: ${date}`,
    `ImageHash: ${imageHash}`,
    `Pet: ${petLabel}`,
    `Confidence: ${confidence.toFixed(3)}`,
  ].join("\n");
}

export function buildPetClaimMessage(params: {
  wallet: string;
  amount: number;
  date: string;
  submissionId: string;
}) {
  const { wallet, amount, date, submissionId } = params;
  return [
    PET_LOVE_DOMAIN,
    "Daily Pet Reward",
    `Wallet: ${wallet}`,
    `Amount: ${amount}`,
    `Date: ${date}`,
    `Submission: ${submissionId}`,
  ].join("\n");
}

export function verifyPetSignature(params: {
  wallet: string;
  message: string;
  signature: Uint8Array;
  signedMessage?: Uint8Array;
}): boolean {
  const expectedBytes = new TextEncoder().encode(params.message);
  const messageCandidates: Uint8Array[] = [expectedBytes];

  if (params.signedMessage) {
    // Always try the signedMessage bytes too (some wallets return a different representation)
    // Do not early-reject; let the signature verification decide.
    // This matches the pattern used in regular claim and stake lock verification.
    messageCandidates.push(params.signedMessage);
  }

  let publicKeyBytes: Uint8Array;
  try {
    publicKeyBytes = bs58.decode(params.wallet);
  } catch {
    return false;
  }

  if (params.signature.length !== 64) return false;

  return messageCandidates.some((messageBytes) =>
    nacl.sign.detached.verify(messageBytes, params.signature, publicKeyBytes)
  );
}