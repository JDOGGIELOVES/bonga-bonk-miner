import { Connection, PublicKey, type ParsedTransactionWithMeta } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TokenAccountNotFoundError,
  getAccount,
} from "@solana/spl-token";
import { withRpcRetry } from "@/lib/treasury/rpc";
import { readBlobText, writeBlobText } from "@/lib/blob-json-store";
import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";

function utcDayBounds(date: string) {
  const start = Math.floor(new Date(`${date}T00:00:00.000Z`).getTime() / 1000);
  return { start, end: start + 86_400 };
}

function getSplTransferFromTreasury(
  tx: ParsedTransactionWithMeta,
  mint: PublicKey,
  treasuryAta: PublicKey,
  recipientAta: PublicKey
): number | null {
  const instructions = tx.transaction.message.instructions;
  const inner = tx.meta?.innerInstructions ?? [];

  const allParsed = [
    ...instructions
      .filter((ix) => "parsed" in ix && ix.program === "spl-token")
      .map((ix) => ("parsed" in ix ? ix.parsed : null)),
    ...inner.flatMap((group) =>
      group.instructions
        .filter((ix) => "parsed" in ix && ix.program === "spl-token")
        .map((ix) => ("parsed" in ix ? ix.parsed : null))
    ),
  ];

  for (const parsed of allParsed) {
    if (!parsed || typeof parsed !== "object") continue;
    const info = (parsed as { info?: Record<string, unknown> }).info;
    if (!info) continue;

    const type = (parsed as { type?: string }).type;
    if (type !== "transfer" && type !== "transferChecked") continue;

    const source = info.source as string | undefined;
    const destination = info.destination as string | undefined;
    if (source !== treasuryAta.toBase58() || destination !== recipientAta.toBase58()) {
      continue;
    }

    if (type === "transferChecked") {
      const mintAddress = info.mint as string | undefined;
      if (mintAddress !== mint.toBase58()) continue;
    }

    const tokenAmount = info.tokenAmount as { uiAmount?: number | null } | undefined;
    if (tokenAmount?.uiAmount != null) return tokenAmount.uiAmount;

    const raw = info.amount as string | undefined;
    if (raw) return Number(raw);
  }

  return null;
}

async function getParsedTransactionsLight(
  connection: Connection,
  signatures: string[]
): Promise<(ParsedTransactionWithMeta | null)[]> {
  if (signatures.length === 0) return [];

  const results: (ParsedTransactionWithMeta | null)[] = [];
  const chunkSize = 5;

  for (let i = 0; i < signatures.length; i += chunkSize) {
    const chunk = signatures.slice(i, i + chunkSize);
    const batch = await connection.getParsedTransactions(chunk, {
      maxSupportedTransactionVersion: 0,
    });
    results.push(...batch);
  }

  return results;
}

export async function getTodayClaimedFromTreasury(params: {
  treasury: PublicKey;
  recipientWallet: PublicKey;
  mint: PublicKey;
  date: string;
}): Promise<number> {
  const { treasury, recipientWallet, mint, date } = params;
  const { start, end } = utcDayBounds(date);
  const treasuryAta = getAssociatedTokenAddressSync(mint, treasury, false);
  const recipientAta = getAssociatedTokenAddressSync(mint, recipientWallet, false);

  return withRpcRetry(async (connection) => {
    try {
      await getAccount(connection, recipientAta);
    } catch (err) {
      if (err instanceof TokenAccountNotFoundError) return 0;
      throw err;
    }

    const signatures = await connection.getSignaturesForAddress(recipientAta, {
      limit: 15,
    });

    const todays = signatures.filter(
      (entry) => entry.blockTime != null && entry.blockTime >= start && entry.blockTime < end
    );

    if (todays.length === 0) return 0;

    const txs = await getParsedTransactionsLight(
      connection,
      todays.map((s) => s.signature)
    );

    let total = 0;
    for (const tx of txs) {
      if (!tx) continue;
      const amount = getSplTransferFromTreasury(tx, mint, treasuryAta, recipientAta);
      if (amount != null) total += amount;
    }

    return total;
  });
}

export async function getRecentTreasuryPayouts(params: {
  treasury: PublicKey;
  mint: PublicKey;
  limit?: number;
}): Promise<Array<{
  signature: string;
  blockTime: number | null;
  amount: number;
  recipient: string;
}>> {
  const { treasury, mint, limit = 20 } = params;
  const treasuryAta = getAssociatedTokenAddressSync(mint, treasury, false);

  return withRpcRetry(async (connection) => {
    const signatures = await connection.getSignaturesForAddress(treasuryAta, {
      limit,
    });

    if (signatures.length === 0) return [];

    const txs = await getParsedTransactionsLight(
      connection,
      signatures.map((s) => s.signature)
    );

    const payouts: Array<{
      signature: string;
      blockTime: number | null;
      amount: number;
      recipient: string;
    }> = [];

    for (let i = 0; i < txs.length; i++) {
      const tx = txs[i];
      const sig = signatures[i];
      if (!tx) continue;

      const instructions = tx.transaction.message.instructions;
      const inner = tx.meta?.innerInstructions ?? [];

      const allParsed = [
        ...instructions
          .filter((ix) => "parsed" in ix && ix.program === "spl-token")
          .map((ix) => ("parsed" in ix ? ix.parsed : null)),
        ...inner.flatMap((group) =>
          group.instructions
            .filter((ix) => "parsed" in ix && ix.program === "spl-token")
            .map((ix) => ("parsed" in ix ? ix.parsed : null))
        ),
      ];

      for (const parsed of allParsed) {
        if (!parsed || typeof parsed !== "object") continue;
        const info = (parsed as { info?: Record<string, unknown> }).info;
        if (!info) continue;

        const type = (parsed as { type?: string }).type;
        if (type !== "transfer" && type !== "transferChecked") continue;

        const source = info.source as string | undefined;
        if (source !== treasuryAta.toBase58()) continue;

        const destination = info.destination as string | undefined;
        if (!destination) continue;

        let amount = 0;
        const tokenAmount = info.tokenAmount as { uiAmount?: number | null } | undefined;
        if (tokenAmount?.uiAmount != null) {
          amount = tokenAmount.uiAmount;
        } else {
          const raw = info.amount as string | undefined;
          if (raw) amount = Number(raw) / 1_000_000; // 6 decimals for BONGA
        }

        if (amount > 0) {
          payouts.push({
            signature: sig.signature,
            blockTime: sig.blockTime ?? null,
            amount,
            recipient: destination,
          });
          break;
        }
      }
    }

    return payouts;
  });
}

// ====================== NONCE / REPLAY STORE (24h short-lived) ======================
// Used nonces are stored keyed by `${wallet}:${action}:${date}:${nonce}` with an expiry.
// Persisted via the same blob/local pattern as tally (durable across deploys/instances).
// Nonces should be client-generated high-entropy (e.g. 8-12 alphanum) and short lived.

const NONCE_BLOB_PATH = "bonga-claims/used-nonces.json";
const NONCE_TTL_MS = 26 * 60 * 60 * 1000; // ~26h (covers UTC day rollover + buffer)

type NonceMap = Record<string, number>; // key -> expiryTs

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}
function envFlag(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}
function hasBlobCredentials(): boolean {
  if (envFlag("BLOB_READ_WRITE_TOKEN")) return true;
  if (!envFlag("BLOB_STORE_ID")) return false;
  if (isVercelRuntime()) return true;
  return envFlag("VERCEL_OIDC_TOKEN");
}
function useBlobStorage(): boolean {
  if (isVercelRuntime()) return hasBlobCredentials();
  return envFlag("BLOB_READ_WRITE_TOKEN");
}

function getLocalDataDir(): string {
  if (isVercelRuntime()) return path.join(os.tmpdir(), "bonga-nonces");
  return path.join(process.cwd(), ".bonga-claim-data");
}
function localNoncePath(): string {
  return path.join(getLocalDataDir(), "used-nonces.json");
}

async function readNonces(): Promise<NonceMap> {
  try {
    let raw: string | null = null;
    if (useBlobStorage()) {
      raw = await readBlobText(NONCE_BLOB_PATH);
    } else {
      try {
        raw = await readFile(localNoncePath(), "utf8");
      } catch {
        raw = null;
      }
    }
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NonceMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeNonces(map: NonceMap): Promise<void> {
  const body = JSON.stringify(map);
  if (useBlobStorage()) {
    await writeBlobText(NONCE_BLOB_PATH, body);
    return;
  }
  const fp = localNoncePath();
  await mkdir(path.dirname(fp), { recursive: true });
  await writeFile(fp, body, "utf8");
}

function makeNonceKey(wallet: string, action: string, date: string, nonce: string): string {
  return `${wallet.toLowerCase().trim()}:${action}:${date}:${nonce}`;
}

function pruneNonces(map: NonceMap, now = Date.now()): NonceMap {
  const out: NonceMap = {};
  for (const [k, exp] of Object.entries(map)) {
    if (exp > now) out[k] = exp;
  }
  return out;
}

/** Returns true if this exact (wallet, action, date, nonce) was already used within TTL window. */
export async function isNonceUsed(
  wallet: string,
  action: "claim" | "stake" | "garden" | "pet" | string,
  date: string,
  nonce: string
): Promise<boolean> {
  if (!nonce || nonce.length < 4) return true; // treat missing/short nonce as already "used" to force clients to supply
  const map = await readNonces();
  const key = makeNonceKey(wallet, action, date, nonce);
  const exp = map[key];
  if (!exp) return false;
  if (exp <= Date.now()) {
    // lazy cleanup on read path
    delete map[key];
    // fire-and-forget write (best effort)
    writeNonces(pruneNonces(map)).catch(() => {});
    return false;
  }
  return true;
}

/** Mark a nonce as used for ~24-26h. Safe to call multiple times (idempotent). */
export async function markNonceUsed(
  wallet: string,
  action: "claim" | "stake" | "garden" | "pet" | string,
  date: string,
  nonce: string,
  customTtlMs?: number
): Promise<void> {
  if (!nonce) return;
  const now = Date.now();
  const ttl = customTtlMs ?? NONCE_TTL_MS;
  const map = await readNonces();
  const key = makeNonceKey(wallet, action, date, nonce);
  map[key] = now + ttl;
  // occasional prune to keep map small
  const pruned = Object.keys(map).length > 5000 ? pruneNonces(map, now) : map;
  await writeNonces(pruned);
}

/** Convenience: check then mark atomically under a per-wallet-ish lock is ideal, but callers already use withWalletClaimLock for payouts. */
export async function consumeNonceIfFresh(
  wallet: string,
  action: "claim" | "stake" | "garden" | "pet" | string,
  date: string,
  nonce: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (await isNonceUsed(wallet, action, date, nonce)) {
    return { ok: false, reason: "Nonce already used or invalid (replay protection)." };
  }
  await markNonceUsed(wallet, action, date, nonce);
  return { ok: true };
}

// ================================================================================