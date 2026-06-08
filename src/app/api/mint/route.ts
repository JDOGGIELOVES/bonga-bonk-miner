import { NextResponse } from "next/server";
import { getMintStatusPayload } from "@/lib/mint-status-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await getMintStatusPayload());
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch mint status";
    return NextResponse.json(
      { simulated: true, live: false, error: message },
      { status: 502 }
    );
  }
}