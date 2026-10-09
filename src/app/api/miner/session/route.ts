import { NextResponse } from "next/server";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { issueMinerSessionToken } from "@/lib/miner-session";
import { verifyMinerSessionSignature } from "@/lib/treasury/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One wallet signature → day-long miner session token for taps / earned status.
 * Avoids per-tap popups while stopping anonymous tap injection.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      wallet?: string;
      at?: string;
      nonce?: string;
      expiresAt?: string;
      signature?: string;
      signedMessage?: string;
    };

    const wallet = body.wallet?.trim();
    const at = body.at?.trim();
    const nonce = (body.nonce || "").trim();
    const expiresAt = (body.expiresAt || "").trim();
    const signatureB58 = body.signature?.trim();

    if (!wallet || !at || !signatureB58) {
      return NextResponse.json({ error: "Invalid miner session request." }, { status: 400 });
    }

    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet." }, { status: 400 });
    }

    const signature = bs58.decode(signatureB58);
    let signedMessage: Uint8Array | undefined;
    if (body.signedMessage?.trim()) {
      try {
        signedMessage = bs58.decode(body.signedMessage.trim());
      } catch {
        return NextResponse.json({ error: "Bad signedMessage." }, { status: 400 });
      }
    }

    const valid = verifyMinerSessionSignature({
      wallet,
      at,
      nonce: nonce || undefined,
      expiresAt: expiresAt || undefined,
      signature,
      signedMessage,
    });
    if (!valid) {
      return NextResponse.json({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    const sessionToken = issueMinerSessionToken(wallet);
    return NextResponse.json({
      ok: true,
      sessionToken,
      expiresInMs: 24 * 60 * 60 * 1000,
      note: "Use this token on miner tap / earned requests for 24h. No per-tap popup.",
    });
  } catch (e) {
    console.error("[miner/session]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Session failed" },
      { status: 500 }
    );
  }
}
