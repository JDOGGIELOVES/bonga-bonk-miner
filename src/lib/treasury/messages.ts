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

function messageMatchesClaim(
  messageBytes: Uint8Array,
  expected: { wallet: string; amount: number; date: string }
) {
  const text = new TextDecoder().decode(messageBytes);
  return (
    text === buildClaimMessage(expected) ||
    (text.includes(expected.wallet) &&
      text.includes(String(expected.amount)) &&
      text.includes(expected.date))
  );
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

  const messageCandidates: Uint8Array[] = [canonicalBytes];
  if (
    params.signedMessage &&
    !messageCandidates.some(
      (candidate) =>
        candidate.length === params.signedMessage!.length &&
        candidate.every((byte, index) => byte === params.signedMessage![index])
    )
  ) {
    if (!messageMatchesClaim(params.signedMessage, expected)) {
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