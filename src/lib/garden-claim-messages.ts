import bs58 from "bs58";
import nacl from "tweetnacl";
import { TREASURY_CLAIM_DOMAIN } from "@/lib/treasury/config";

export const MESSAGE_VERSION = "v1";
export const SIGNED_PAYLOAD_DOMAIN = `${TREASURY_CLAIM_DOMAIN} ${MESSAGE_VERSION}`;

function buildVersionedHeader(action: string): string[] {
  return [SIGNED_PAYLOAD_DOMAIN, `Action: ${action}`];
}

function fmtAmount(n: number): string {
  return String(n);
}

export function buildGardenClaimMessage(params: {
  wallet: string;
  amount: number;
  date: string;
  nonce?: string;
  expiresAt?: string;
}) {
  const { wallet, amount, date, nonce = "", expiresAt = "" } = params;
  const lines = [
    ...buildVersionedHeader("GardenClaim"),
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

export function verifyGardenClaimSignature(params: {
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

  const canonicalMessage = buildGardenClaimMessage(expected);
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