import { NextResponse } from "next/server";
import { buildCollectionMetadata } from "@/lib/nft-metadata";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(buildCollectionMetadata(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}