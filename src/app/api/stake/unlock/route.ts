import { NextResponse } from "next/server";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { verifyStakeUnlockSignature } from "@/lib/treasury/messages";
import { isWalletBlocked } from "@/lib/claim-tally-store";
import { saveStakeRecord } from "@/lib/stake-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      wallet?: string;
      at?: string;
      signature?: string;
      signedMessage?: string;
    };

    const wallet = body.wallet?.trim();
    const at = body.at?.trim();
    const signatureB58 = body.signature?.trim();

    if (!wallet || !signatureB58 || !at) {
      return NextResponse.json({ error: "Invalid stake unlock request." }, { status: 400 });
    }

    const blockCheck = await isWalletBlocked(wallet);
    if (blockCheck.blocked) {
      const until = blockCheck.until ? new Date(blockCheck.until).toLocaleString() : "soon";
      return NextResponse.json({ error: `Wallet temporarily blocked until ${until}.` }, { status: 403 });
    }

    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const signature = bs58.decode(signatureB58);
    let signedMessage: Uint8Array | undefined;
    if (body.signedMessage?.trim()) {
      try {
        signedMessage = bs58.decode(body.signedMessage.trim());
      } catch {
        return NextResponse.json({ error: "Invalid signed message." }, { status: 400 });
      }
    }

    const valid = verifyStakeUnlockSignature({ wallet, at, signature, signedMessage });
    if (!valid) {
      return NextResponse.json({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    await saveStakeRecord(wallet, null);

    return NextResponse.json({ ok: true, unstaked: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stake unlock failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
