import bs58 from "bs58";
import nacl from "tweetnacl";
import { TREASURY_CLAIM_DOMAIN } from "@/lib/treasury/config";

export const MESSAGE_VERSION = "v1";
export const SIGNED_PAYLOAD_DOMAIN = `${TREASURY_CLAIM_DOMAIN} ${MESSAGE_VERSION}`;

function buildVersionedHeader(action: string): string[] {
  return [SIGNED_PAYLOAD_DOMAIN, `Action: ${action}`];
}

/** Helper to ensure stable number/string formatting in payloads (no locale, fixed decimals where needed). */
function fmtAmount(n: number): string {
  // Amounts are integers or small floats; keep simple and exact as provided by caller.
  return String(n);
}

export function buildTapMessage(params: {
  wallet: string;
  date: string;
  tapIndex: number;
}) {
  const { wallet, date, tapIndex } = params;
  return [
    SIGNED_PAYLOAD_DOMAIN,
    "Action: Tap",
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
  nonce?: string;
  expiresAt?: string; // ISO or day-end for the claim window (recommended ~24h or end-of-UTC-day)
}) {
  const { wallet, amount, date, nonce = "", expiresAt = "" } = params;
  const lines = [
    ...buildVersionedHeader("Claim"),
    `Wallet: ${wallet}`,
    `Amount: ${fmtAmount(amount)}`,
    `Date: ${date}`,
  ];
  if (nonce) lines.push(`Nonce: ${nonce}`);
  if (expiresAt) lines.push(`Expires: ${expiresAt}`);
  return lines.join("\n");
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((byte, index) => byte === b[index]);
}

export function verifyClaimSignature(params: {
  wallet: string;
  amount: number;
  date: string;
  nonce?: string;
  expiresAt?: string;
  signature: Uint8Array;
  signedMessage?: Uint8Array;
}): boolean {
  const expected: any = {
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
  };
  if (params.nonce) expected.nonce = params.nonce;
  if (params.expiresAt) expected.expiresAt = params.expiresAt;

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
  at: string; // ISO timestamp or nonce for the lock action (also serves replay protection)
  nonce?: string;
  expiresAt?: string;
}) {
  const { wallet, tiers, at, nonce = "", expiresAt = "" } = params;
  // Canonical stable representation for signing (sorted keys, integers)
  const tierStr = ["Common", "Rare", "Legendary", "Cosmic Bonga"]
    .map((t) => `${t}=${Math.max(0, Math.floor(tiers[t] || 0))}`)
    .join(";");
  const lines = [
    ...buildVersionedHeader("StakeLock"),
    `Wallet: ${wallet}`,
    `Tiers: ${tierStr}`,
    `At: ${at}`,
  ];
  if (nonce) lines.push(`Nonce: ${nonce}`);
  if (expiresAt) lines.push(`Expires: ${expiresAt}`);
  return lines.join("\n");
}

export function verifyStakeLockSignature(params: {
  wallet: string;
  tiers: Record<string, number>;
  at: string;
  nonce?: string;
  expiresAt?: string;
  signature: Uint8Array;
  signedMessage?: Uint8Array;
}): boolean {
  const expected: any = {
    wallet: params.wallet,
    tiers: params.tiers,
    at: params.at,
  };
  if (params.nonce) expected.nonce = params.nonce;
  if (params.expiresAt) expected.expiresAt = params.expiresAt;

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
  nonce?: string;
  expiresAt?: string;
}) {
  const { wallet, at, nonce = "", expiresAt = "" } = params;
  const lines = [
    ...buildVersionedHeader("StakeUnlock"),
    `Wallet: ${wallet}`,
    `At: ${at}`,
  ];
  if (nonce) lines.push(`Nonce: ${nonce}`);
  if (expiresAt) lines.push(`Expires: ${expiresAt}`);
  return lines.join("\n");
}

export function verifyStakeUnlockSignature(params: {
  wallet: string;
  at: string;
  nonce?: string;
  expiresAt?: string;
  signature: Uint8Array;
  signedMessage?: Uint8Array;
}): boolean {
  const expected: any = { wallet: params.wallet, at: params.at };
  if (params.nonce) expected.nonce = params.nonce;
  if (params.expiresAt) expected.expiresAt = params.expiresAt;

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

// --- Bonga Bank Withdraw (the >=10k on-chain claim / treasury spend) ---

export function buildBankWithdrawMessage(params: {
  wallet: string;
  amount: number;
  date: string;
  nonce?: string;
  expiresAt?: string;
}) {
  const { wallet, amount, date, nonce = "", expiresAt = "" } = params;
  const lines = [
    ...buildVersionedHeader("BankWithdraw"),
    `Wallet: ${wallet}`,
    `Amount: ${fmtAmount(amount)}`,
    `Date: ${date}`,
  ];
  if (nonce) lines.push(`Nonce: ${nonce}`);
  if (expiresAt) lines.push(`Expires: ${expiresAt}`);
  return lines.join("\n");
}

export function verifyBankWithdrawSignature(params: {
  wallet: string;
  amount: number;
  date: string;
  nonce?: string;
  expiresAt?: string;
  signature: Uint8Array;
  signedMessage?: Uint8Array;
}): boolean {
  const expected: any = {
    wallet: params.wallet,
    amount: params.amount,
    date: params.date,
  };
  if (params.nonce) expected.nonce = params.nonce;
  if (params.expiresAt) expected.expiresAt = params.expiresAt;

  const canonicalMessage = buildBankWithdrawMessage(expected);
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