import { NextResponse } from "next/server";
import { getTallyStorageStatus } from "@/lib/claim-tally-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getTallyStorageStatus());
}
