import { NextResponse } from "next/server";
import { getFlaggedWallets } from "@/lib/claim-tally-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const flagged = await getFlaggedWallets();
    return NextResponse.json(flagged);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Flags unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
