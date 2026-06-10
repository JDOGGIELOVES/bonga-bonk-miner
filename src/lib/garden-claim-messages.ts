import bs58 from "bs58";
import nacl from "tweetnacl";
import { TREASURY_CLAIM_DOMAIN } from "@/lib/treasury/config";

export function buildGardenClaimMessage(params: {
  wallet: string;
  amount: number;
  date: string;
}) {
  const { wallet, amount, date } = params;
  return [
    TREASURY_CLAIM_DOMAIN,
    "Garden Claim Request",
    `Wallet: ${wallet}`,
    `Amount: ${amount}`,
    `Date: ${date}`,
  ].join("\n");
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((byte, index) => byte === b[index]);
}

export function verifyGardenClaimSignature(params: {
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