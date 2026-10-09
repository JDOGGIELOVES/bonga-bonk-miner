import { NextResponse } from "next/server";
import { verifyMinerSessionToken } from "@/lib/miner-session";

/** Extract play/miner session token from headers or query. */
export function extractPlaySessionToken(request: Request): string {
  const header = request.headers.get("x-miner-session")?.trim() || "";
  if (header) return header;
  try {
    return new URL(request.url).searchParams.get("sessionToken")?.trim() || "";
  } catch {
    return "";
  }
}

/**
 * Require a signed play session for wallet-scoped status scrapes.
 * Same token as miner session (one wallet sign → 24h).
 */
export function assertPlaySession(
  request: Request,
  wallet: string
): { ok: true } | { ok: false; response: NextResponse } {
  const token = extractPlaySessionToken(request);
  const check = verifyMinerSessionToken(wallet, token);
  if (!check.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: check.reason, code: "MINER_SESSION" },
        { status: 401 }
      ),
    };
  }
  return { ok: true };
}
