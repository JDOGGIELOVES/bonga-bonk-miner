import bs58 from "bs58";
import nacl from "tweetnacl";
import { TREASURY_CLAIM_DOMAIN } from "@/lib/treasury/config";

export function buildTapMessage(params: {
  wallet: string;
  date: string;
  tapIndex: number;
}) {
  const { wallet, date, tapIndex } = params;
  return [
    TREASURY_CLAIM_DOMAIN,
    "Tap",
    `Wallet: ${wallet}`,
    `Date: ${date}`,
    `TapIndex: ${tapIndex}`,
  ].join("\n");
}

export function verifyTapSignature(params: {
  wallet: string;
  date: string;
  tapIndex: number;
  signature: Uint8Array;
  signedMessage?: Uint8Array;
}): boolean {
  const expected = {
    wallet: params.wallet,
    date: params.date,
    tapIndex: params.tapIndex,
  };
  const canonicalMessage = buildTapMessage(expected);
  const canonicalBytes = new TextEncoder().encode(canonicalMessage);

  const messageCandidates: Uint8Array[] = [canonicalBytes];
  if (params.signedMessage) {
    const text = new TextDecoder().decode(params.signedMessage);
    if (
      !text.includes(expected.wallet) ||
      !text.includes(String(expected.tapIndex)) ||
      !text.includes(expected.date)
    ) {
      return false;
    }
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

export function buildClaimMessage(params: {
  wallet: string;
  amount: number;
  date: string;
}) {
  const { wallet, amount, date } = params;
  return [
    TREASURY_CLAIM_DOMAIN,
    "Claim Request",
    `Wallet: ${wallet}`,
    `Amount: ${amount}`,
    `Date: ${date}`,
  ].join("\n");
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((byte, index) => byte === b[index]);
}

export function verifyClaimSignature(params: {
  wallet: string;
  amount: number;
  date: string;
  signature: Uint8Array;
  signedMessage?: Uint8Array;
}): boolean {
  const expected = {
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
  };
  const canonicalMessage = buildClaimMessage(expected);
  const canonicalBytes = new TextEncoder().encode(canonicalMessage);

  if (params.signedMessage && !bytesEqual(params.signedMessage, canonicalBytes)) {
    return false;
  }

  let publicKeyBytes: Uint8Array;
  try {
    publicKeyBytes = bs58.decode(params.wallet);
  } catch {
    return false;
  }

  if (params.signature.length !== 64) return false;

  return nacl.sign.detached.verify(
    canonicalBytes,
    params.signature,
    publicKeyBytes
  );
}

// --- Staking (virtual lock) action messages ---

export function buildStakeLockMessage(params: {
  wallet: string;
  tiers: Record<string, number>; // e.g. { Common: 2, Rare: 1, ... }
  at: string; // ISO timestamp or nonce for the lock action
}) {
  const { wallet, tiers, at } = params;
  // Canonical stable representation for signing
  const tierStr = ["Common", "Rare", "Legendary", "Cosmic Bonga"]
    .map((t) => `${t}=${Math.max(0, Math.floor(tiers[t] || 0))}`)
    .join(";");
  return [
    TREASURY_CLAIM_DOMAIN,
    "Stake Lock",
    `Wallet: ${wallet}`,
    `Tiers: ${tierStr}`,
    `At: ${at}`,
  ].join("\n");
}

export function verifyStakeLockSignature(params: {
  wallet: string;
  tiers: Record<string, number>;
  at: string;
  signature: Uint8Array;
  signedMessage?: Uint8Array;
}): boolean {
  const expected = {
    wallet: params.wallet,
    tiers: params.tiers,
    at: params.at,
  };
  const canonicalMessage = buildStakeLockMessage(expected);
  const canonicalBytes = new TextEncoder().encode(canonicalMessage);

  if (params.signedMessage && !bytesEqual(params.signedMessage, canonicalBytes)) {
    return false;
  }

  let publicKeyBytes: Uint8Array;
  try {
    publicKeyBytes = bs58.decode(params.wallet);
  } catch {
    return false;
  }

  if (params.signature.length !== 64) return false;

  return nacl.sign.detached.verify(
    canonicalBytes,
    params.signature,
    publicKeyBytes
  );
}

export function buildStakeUnlockMessage(params: {
  wallet: string;
  at: string;
}) {
  const { wallet, at } = params;
  return [
    TREASURY_CLAIM_DOMAIN,
    "Stake Unlock",
    `Wallet: ${wallet}`,
    `At: ${at}`,
  ].join("\n");
}

export function verifyStakeUnlockSignature(params: {
  wallet: string;
  at: string;
  signature: Uint8Array;
  signedMessage?: Uint8Array;
}): boolean {
  const expected = { wallet: params.wallet, at: params.at };
  const canonicalMessage = buildStakeUnlockMessage(expected);
  const canonicalBytes = new TextEncoder().encode(canonicalMessage);

  if (params.signedMessage && !bytesEqual(params.signedMessage, canonicalBytes)) {
    return false;
  }

  let publicKeyBytes: Uint8Array;
  try {
    publicKeyBytes = bs58.decode(params.wallet);
  } catch {
    return false;
  }

  if (params.signature.length !== 64) return false;

  return nacl.sign.detached.verify(
    canonicalBytes,
    params.signature,
    publicKeyBytes
  );
}