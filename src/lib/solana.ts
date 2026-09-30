import { clusterApiUrl } from "@solana/web3.js";

/**
 * Browser-safe RPC endpoint.
 * Never put paid Helius/QuickNode API keys in NEXT_PUBLIC_* — they ship in the JS bundle.
 * Browser mint uses same-origin /api/solana-rpc (server proxies with SOLANA_RPC_URL).
 * Server routes should prefer lib/treasury/rpc.ts (getRpcUrls / withRpcRetry).
 */
export function getSolanaRpcEndpoint(): string {
  const network =
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK as
      | "mainnet-beta"
      | "devnet"
      | "testnet") || "mainnet-beta";

  // Optional public (keyless) override only — reject URLs that look like api-key=
  const pub = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  if (pub && !/[?&]api-key=/i.test(pub) && !/api-key=/i.test(pub)) {
    return pub;
  }

  // In the browser, always prefer our proxy so public RPC 403s don't break mint
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/solana-rpc`;
  }

  // SSR / Node: use dedicated RPC if set, else public cluster (may 403 under load)
  const server = process.env.SOLANA_RPC_URL?.split(/[,;\s]+/)[0]?.trim();
  if (server) return server;

  return clusterApiUrl(network);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatSol(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  if (sol >= 1) return sol.toFixed(2);
  if (sol >= 0.01) return sol.toFixed(3);
  return sol.toFixed(4);
}
