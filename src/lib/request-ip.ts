import { ipStorageKey, isPetClientIpRequired } from "@/lib/claim-ip-store";

/** Best-effort client IP for Vercel / reverse proxies. */
export function getClientIp(request: Request): string | null {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    const first = vercelForwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

export function getClientIpKey(request: Request): string | null {
  const clientIp = getClientIp(request);
  return clientIp ? ipStorageKey(clientIp) : null;
}

/** Pet Love fails closed when IP cannot be determined (blocks no-header scripts). */
export function requirePetClientIpKey(
  request: Request
): { ok: true; ipKey: string } | { ok: false; reason: string } {
  const ipKey = getClientIpKey(request);
  if (ipKey) return { ok: true, ipKey };

  if (isPetClientIpRequired()) {
    return {
      ok: false,
      reason:
        "Could not verify your connection. Pet Love requires a normal browser session (one share and one claim per IP per day).",
    };
  }

  return { ok: false, reason: "Connection could not be verified." };
}