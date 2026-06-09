import { NextResponse } from "next/server";
import { getPetLoveStorageStatus } from "@/lib/pet-love-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getPetLoveStorageStatus());
}