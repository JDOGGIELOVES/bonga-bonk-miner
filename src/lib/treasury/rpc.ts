import { Connection, type ConnectionConfig } from "@solana/web3.js";

const DEFAULT_COMMITMENT = "confirmed" as const;

const CONNECTION_CONFIG: ConnectionConfig = {
  commitment: DEFAULT_COMMITMENT,
  confirmTransactionInitialTimeout: 60_000,
};

export function isRpcRateLimitError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  const lower = message.toLowerCase();
  return (
    lower.includes("too many requests") ||
    lower.includes("rate limit") ||
    lower.includes("429") ||
    lower.includes("exceeded")
  );
}

export function getRpcUrls(): string[] {
  const raw =
    process.env.SOLANA_RPC_URL ??
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    "https://api.mainnet-beta.solana.com";

  return raw
    .split(/[,;\s]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

export function createTreasuryConnection(rpcUrl?: string): Connection {
  const url = rpcUrl ?? getRpcUrls()[0];
  return new Connection(url, CONNECTION_CONFIG);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRpcRetry<T>(
  fn: (connection: Connection) => Promise<T>,
  options?: { attempts?: number; baseDelayMs?: number }
): Promise<T> {
  const urls = getRpcUrls();
  const attempts = options?.attempts ?? 4;
  const baseDelayMs = options?.baseDelayMs ?? 800;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const connection = createTreasuryConnection(urls[attempt % urls.length]);

    try {
      return await fn(connection);
    } catch (error) {
      lastError = error;
      if (!isRpcRateLimitError(error) || attempt === attempts - 1) {
        throw error;
      }
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }

  throw lastError;
}