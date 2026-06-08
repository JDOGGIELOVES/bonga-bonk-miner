#!/usr/bin/env node
/**
 * Check treasury SOL + $BONGA balances.
 * Requires env vars set (or .env.local loaded manually).
 */
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";

const treasury = process.env.TREASURY_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_TREASURY_PUBLIC_KEY;
const mint = process.env.BONGA_MINT_ADDRESS ?? process.env.NEXT_PUBLIC_BONGA_MINT_ADDRESS;
const rpc =
  process.env.SOLANA_RPC_URL ??
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
  "https://api.mainnet-beta.solana.com";
const decimals = Number(process.env.BONGA_TOKEN_DECIMALS ?? "6");

if (!treasury || !mint) {
  console.error("Set TREASURY_PUBLIC_KEY and BONGA_MINT_ADDRESS first.");
  process.exit(1);
}

const connection = new Connection(rpc, "confirmed");
const treasuryPk = new PublicKey(treasury);
const mintPk = new PublicKey(mint);
const ata = getAssociatedTokenAddressSync(mintPk, treasuryPk, false);

const sol = await connection.getBalance(treasuryPk);
let bonga = 0;
try {
  const account = await getAccount(connection, ata);
  bonga = Number(account.amount) / 10 ** decimals;
} catch {
  bonga = 0;
}

console.log("\n=== Treasury Status ===\n");
console.log("Treasury:", treasury);
console.log("Mint:", mint);
console.log("Token account:", ata.toBase58());
console.log("SOL balance:", (sol / 1e9).toFixed(4));
console.log("$BONGA balance:", bonga.toLocaleString());
console.log("");