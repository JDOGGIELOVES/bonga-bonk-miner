/** 8×8 difference hash (64 bits) — catches resized/recompressed stock photo reuse. */

export const PET_DHASH_HEX_LENGTH = 16;

export function isPetDuplicateCheckEnabled(): boolean {
  return process.env.PET_DUPLICATE_CHECK_ENABLED !== "false";
}

export function getPetPhashMaxDistance(): number {
  const raw = process.env.PET_PHASH_MAX_DISTANCE?.trim();
  if (!raw) return 5; // tightened from 8 to better catch stock/near-duplicate pet+hand photos
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 5;
  return Math.floor(parsed);
}

function normalizePhashHex(phash: string): string | null {
  const hex = phash.trim().toLowerCase();
  if (!/^[0-9a-f]{16}$/.test(hex)) return null;
  return hex;
}

export function computeDHashFromGray9x8(gray: ArrayLike<number>): string | null {
  if (gray.length < 72) return null;

  let bits = "";
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = gray[y * 9 + x] ?? 0;
      const right = gray[y * 9 + x + 1] ?? 0;
      bits += left < right ? "1" : "0";
    }
  }

  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

export function computeDHashFromRgba(
  width: number,
  height: number,
  rgba: ArrayLike<number>,
  channels = 4
): string | null {
  if (width !== 9 || height !== 8) return null;

  const gray: number[] = [];
  for (let i = 0; i < 72; i++) {
    const offset = i * channels;
    const r = rgba[offset] ?? 0;
    const g = rgba[offset + 1] ?? 0;
    const b = rgba[offset + 2] ?? 0;
    gray.push(Math.round(0.299 * r + 0.587 * g + 0.114 * b));
  }

  return computeDHashFromGray9x8(gray);
}

export function hammingDistanceHex(a: string, b: string): number | null {
  const left = normalizePhashHex(a);
  const right = normalizePhashHex(b);
  if (!left || !right) return null;

  let distance = 0;
  for (let i = 0; i < PET_DHASH_HEX_LENGTH; i++) {
    const xor = parseInt(left[i], 16) ^ parseInt(right[i], 16);
    distance += (xor & 1) + ((xor >> 1) & 1) + ((xor >> 2) & 1) + ((xor >> 3) & 1);
  }
  return distance;
}

export function findClosestPhash(
  target: string,
  candidates: string[],
  maxDistance: number
): { match: string; distance: number } | null {
  let best: { match: string; distance: number } | null = null;

  for (const candidate of candidates) {
    const distance = hammingDistanceHex(target, candidate);
    if (distance == null || distance > maxDistance) continue;
    if (!best || distance < best.distance) {
      best = { match: candidate, distance };
    }
  }

  return best;
}