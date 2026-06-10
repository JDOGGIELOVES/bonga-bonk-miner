import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { listWalletPastUploads, toPublicGalleryItem } from "@/lib/pet-love-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get("wallet")?.trim();
  if (!wallet) {
    return NextResponse.json({ error: "Wallet required." }, { status: 400 });
  }

  try {
    new PublicKey(wallet);
  } catch {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  }

  try {
    const limitParam = new URL(request.url).searchParams.get("limit");
    const limit = limitParam ? Math.min(120, Math.max(1, Number(limitParam))) : 90;
    const submissions = await listWalletPastUploads(wallet, limit);

    return NextResponse.json({
      items: submissions.map(toPublicGalleryItem),
      total: submissions.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload history unavailable.";
    return NextResponse.json({ error: message, items: [] }, { status: 500 });
  }
}