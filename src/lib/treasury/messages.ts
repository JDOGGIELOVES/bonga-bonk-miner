import bs58 from "bs58";
import nacl from "tweetnacl";
import { TREASURY_CLAIM_DOMAIN } from "@/lib/treasury/config";

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

export function verifyClaimSignature(params: {
  wallet: string;
  amount: number;
  date: string;
  signature: Uint8Array;
}): boolean {
  const message = buildClaimMessage(params);
  const messageBytes = new TextEncoder().encode(message);

  let publicKeyBytes: Uint8Array;
  try {
    publicKeyBytes = bs58.decode(params.wallet);
  } catch {
    return false;
  }

  return nacl.sign.detached.verify(messageBytes, params.signature, publicKeyBytes);
}