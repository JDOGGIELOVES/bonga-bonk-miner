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