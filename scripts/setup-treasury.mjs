#!/usr/bin/env node
/**
 * Generates a new Solana treasury keypair for $BONGA reward payouts.
 * Run: node scripts/setup-treasury.mjs
 */
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const keypair = Keypair.generate();
const publicKey = keypair.publicKey.toBase58();
const privateKey = bs58.encode(keypair.secretKey);

const outDir = join(process.cwd(), ".treasury");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const keyPath = join(outDir, "treasury-keypair.json");
writeFileSync(keyPath, JSON.stringify(Array.from(keypair.secretKey)), "utf8");

console.log("\n=== Bonga Treasury Wallet Created ===\n");
console.log("Public key (share this):");
console.log(publicKey);
console.log("\nAdd these to Vercel → Settings → Environment Variables:\n");
console.log(`NEXT_PUBLIC_TREASURY_PUBLIC_KEY=${publicKey}`);
console.log(`TREASURY_PUBLIC_KEY=${publicKey}`);
console.log(`TREASURY_PRIVATE_KEY=${privateKey}`);
console.log(`BONGA_MINT_ADDRESS=<your-$BONGA-SPL-mint-address>`);
console.log(`NEXT_PUBLIC_BONGA_MINT_ADDRESS=<your-$BONGA-SPL-mint-address>`);
console.log("ON_CHAIN_CLAIMS_ENABLED=true");
console.log("NEXT_PUBLIC_ON_CHAIN_CLAIMS_ENABLED=true");
console.log("SOLANA_RPC_URL=<helius-or-alchemy-mainnet-rpc>");
console.log("BONGA_TOKEN_DECIMALS=6");
console.log("\nFund the treasury wallet with:");
console.log("  1. SOL — for transaction fees (~0.01 SOL per claim, keep 0.5+ SOL)");
console.log("  2. $BONGA SPL tokens — sent to the treasury public key above");
console.log("\nKeypair backup saved to:");
console.log(keyPath);
console.log("\nSECURITY: Never commit TREASURY_PRIVATE_KEY or .treasury/ to git.\n");