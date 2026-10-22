import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

/**
 * Shared secret for destructive / admin GET routes.
 * Set ADMIN_API_SECRET (or CRON_SECRET) in Vercel — never commit the value.
 */
export function getAdminApiSecret(): string | null {
  const secret =
    process.env.ADMIN_API_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.BONGA_ADMIN_SECRET?.trim() ||
    "";
  return secret.length >= 16 ? secret : null;
}

function safeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** Extract bearer / header / query secret from a request. */
export function extractAdminSecret(request: Request): string {
  const auth = request.headers.get("authorization")?.trim() || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  const header =
    request.headers.get("x-admin-secret")?.trim() ||
    request.headers.get("x-cron-secret")?.trim() ||
    "";
  if (header) return header;
  try {
    return new URL(request.url).searchParams.get("secret")?.trim() || "";
  } catch {
    return "";
  }
}

export function assertAdminAuthorized(
  request: Request
): { ok: true } | { ok: false; response: NextResponse } {
  const expected = getAdminApiSecret();
  if (!expected) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Admin routes are locked. Set ADMIN_API_SECRET (min 16 chars) in Vercel env.",
        },
        { status: 503 }
      ),
    };
  }
  const provided = extractAdminSecret(request);
  if (!provided || !safeEqual(provided, expected)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }
  return { ok: true };
}
