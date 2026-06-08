import { NextResponse } from "next/server";
import { buildItemMetadata, NFT_DEPLOY_SUPPLY } from "@/lib/nft-metadata";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const raw = id.replace(/\.json$/i, "");
  const index = Number.parseInt(raw, 10);

  if (!Number.isFinite(index) || index < 1 || index > NFT_DEPLOY_SUPPLY) {
    return NextResponse.json({ error: "Invalid token index" }, { status: 404 });
  }

  return NextResponse.json(buildItemMetadata(index), {
    headers: {
      "Cache-Control": "public, max-age=3600, immutable",
    },
  });
}