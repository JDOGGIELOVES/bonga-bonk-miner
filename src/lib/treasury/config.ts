import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { DAILY_BONGA_LIMIT } from "@/lib/miner-game";

export const TREASURY_CLAIM_DOMAIN = "Bonga Bonk Miner";

export interface TreasuryConfig {
  enabled: boolean;
  mint: PublicKey;
  treasuryPublicKey: PublicKey;
  treasuryPrivateKey: Uint8Array;
  tokenDecimals: number;
  dailyLimit: number;
  rpcUrl: string;
}

function parsePublicKey(value: string | undefined, label: string): PublicKey | null {
  if (!value?.trim()) return null;
  try {
    return new PublicKey(value.trim());
  } catch {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

export function getTreasuryConfig(): TreasuryConfig | null {
  const enabled = process.env.ON_CHAIN_CLAIMS_ENABLED === "true";
  if (!enabled) return null;

  const mint = parsePublicKey(process.env.BONGA_MINT_ADDRESS, "BONGA_MINT_ADDRESS");
  const treasuryPublicKey = parsePublicKey(
    process.env.TREASURY_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_TREASURY_PUBLIC_KEY,
    "TREASURY_PUBLIC_KEY"
  );
  const privateKeyB58 = process.env.TREASURY_PRIVATE_KEY?.trim();

  if (!mint || !treasuryPublicKey || !privateKeyB58) {
    return null;
  }

  const treasuryPrivateKey = bs58.decode(privateKeyB58);

  if (treasuryPrivateKey.length !== 64) {
    throw new Error("TREASURY_PRIVATE_KEY must be a base58-encoded 64-byte secret key");
  }

  return {
    enabled: true,
    mint,
    treasuryPublicKey,
    treasuryPrivateKey,
    tokenDecimals: Number(process.env.BONGA_TOKEN_DECIMALS ?? "6"),
    dailyLimit: Number(process.env.DAILY_CLAIM_LIMIT ?? String(DAILY_BONGA_LIMIT)),
    rpcUrl:
      process.env.SOLANA_RPC_URL ??
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
      "https://api.mainnet-beta.solana.com",
  };
}

export function getPublicTreasuryInfo() {
  const pubkey = process.env.NEXT_PUBLIC_TREASURY_PUBLIC_KEY?.trim();
  const mint = process.env.NEXT_PUBLIC_BONGA_MINT_ADDRESS?.trim();
  const enabled = process.env.NEXT_PUBLIC_ON_CHAIN_CLAIMS_ENABLED === "true";

  return {
    enabled: enabled && Boolean(pubkey && mint),
    treasuryPublicKey: pubkey ?? null,
    mintAddress: mint ?? null,
  };
}