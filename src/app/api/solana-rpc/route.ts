import { NextRequest, NextResponse } from "next/server";
import { getRpcUrls, isRpcRateLimitError } from "@/lib/treasury/rpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin JSON-RPC proxy for browser mint / wallet reads.
 * Keeps Helius/QuickNode keys in SOLANA_RPC_URL (server-only).
 * Fixes: "failed to get info about account … 403 Access forbidden"
 * when api.mainnet-beta.solana.com blocks the client IP.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
      { status: 400 }
    );
  }

  const urls = getRpcUrls();
  let lastStatus = 502;
  let lastText = "All RPC endpoints failed";

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const text = await upstream.text();
      lastStatus = upstream.status;
      lastText = text;

      if (upstream.ok) {
        return new NextResponse(text, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      }

      // Retry next URL on 403/429
      if (upstream.status === 403 || upstream.status === 429) {
        continue;
      }

      // Other errors: still try next if rate-limit shaped
      if (isRpcRateLimitError(text) && i < urls.length - 1) {
        continue;
      }

      return new NextResponse(text, {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      lastText = e instanceof Error ? e.message : String(e);
      lastStatus = 502;
    }
  }

  const hint =
    urls.length === 1 && urls[0].includes("api.mainnet-beta.solana.com")
      ? " Set SOLANA_RPC_URL to a Helius/QuickNode mainnet URL in Vercel (and locally in .env.local), then redeploy."
      : "";

  return NextResponse.json(
    {
      jsonrpc: "2.0",
      error: {
        code: 403,
        message: `Solana RPC access failed (${lastStatus}).${hint} Upstream: ${lastText.slice(0, 200)}`,
      },
      id: null,
    },
    { status: lastStatus === 403 || lastStatus === 429 ? lastStatus : 502 }
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "POST JSON-RPC bodies here. Uses server SOLANA_RPC_URL.",
  });
}
