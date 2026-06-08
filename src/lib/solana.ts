import { clusterApiUrl } from "@solana/web3.js";

export function getSolanaRpcEndpoint(): string {
  return (
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    clusterApiUrl(
      (process.env.NEXT_PUBLIC_SOLANA_NETWORK as
        | "mainnet-beta"
        | "devnet"
        | "testnet") || "mainnet-beta"
    )
  );
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