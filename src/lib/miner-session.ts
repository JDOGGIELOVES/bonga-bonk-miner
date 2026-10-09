import { createHmac, timingSafeEqual } from "crypto";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function sessionSecret(): string {
  return (
    process.env.MINER_SESSION_SECRET?.trim() ||
    process.env.ADMIN_API_SECRET?.trim() ||
    process.env.TREASURY_PRIVATE_KEY?.trim()?.slice(0, 32) ||
    "dev-only-miner-session-change-me"
  );
}

export function issueMinerSessionToken(wallet: string, now = Date.now()): string {
  const exp = now + SESSION_TTL_MS;
  const payload = `${wallet.toLowerCase().trim()}|${exp}`;
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${Buffer.from(payload, "utf8").toString("base64url")}.${sig}`;
}

export function verifyMinerSessionToken(
  wallet: string,
  token: string | null | undefined
): { ok: true } | { ok: false; reason: string } {
  if (!token?.trim()) {
    return { ok: false, reason: "Miner session required. Sign once after connecting wallet." };
  }
  const parts = token.trim().split(".");
  if (parts.length !== 2) return { ok: false, reason: "Invalid miner session." };
  const [payloadB64, sig] = parts;
  let payload: string;
  try {
    payload = Buffer.from(payloadB64!, "base64url").toString("utf8");
  } catch {
    return { ok: false, reason: "Invalid miner session." };
  }
  const expectedSig = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
  try {
    const a = Buffer.from(sig!);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, reason: "Invalid miner session signature." };
    }
  } catch {
    return { ok: false, reason: "Invalid miner session." };
  }
  const [w, expStr] = payload.split("|");
  const exp = Number(expStr);
  if (!w || w !== wallet.toLowerCase().trim()) {
    return { ok: false, reason: "Miner session wallet mismatch." };
  }
  if (!Number.isFinite(exp) || exp < Date.now()) {
    return { ok: false, reason: "Miner session expired. Sign in again." };
  }
  return { ok: true };
}
