#!/usr/bin/env node
/**
 * Bonga NFT Collection — on-chain deploy checklist
 *
 * Preview minting works at /nft (simulated).
 * For real Solana mints, deploy a Metaplex Candy Machine:
 *
 * 1. Generate final art for all 16 traits (see src/lib/nft-collection.ts prompts)
 * 2. Upload images + metadata JSON to Arweave/IPFS (e.g. Metaplex Sugar CLI)
 * 3. Create collection NFT + Candy Machine on mainnet
 * 4. Set Vercel env vars:
 *      NEXT_PUBLIC_MINT_SIMULATED=false
 *      NEXT_PUBLIC_CANDY_MACHINE_ADDRESS=<candy_machine_pubkey>
 *      NEXT_PUBLIC_COLLECTION_ADDRESS=<collection_mint_pubkey>
 *      NEXT_PUBLIC_MINT_PRICE_SOL=0.08
 * 5. Redeploy bonga-bonk-miner
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const collectionPath = join(root, "src/lib/nft-collection.ts");
const source = readFileSync(collectionPath, "utf8");

const nameMatch = source.match(/name:\s*"([^"]+)"/);
const supplyMatch = source.match(/totalSupply:\s*(\d+)/);

console.log("Bonga NFT Collection setup");
console.log("==========================");
console.log("");
console.log("Collection:", nameMatch?.[1] ?? "Bonga NFT Collection");
console.log("Supply:", supplyMatch?.[1] ?? "8888");
console.log("Preview mint:", "https://bongabonks.com/nft");
console.log("");
console.log("Trait count: 16 (see nft-collection.ts for art prompts)");
console.log("");
console.log("Whitelist (Bonk Miner):");
console.log("  - 3+ $BONGA mined → 50% off mint");
console.log("  - 10+ $BONGA mined → free mint");
console.log("");
console.log("Next: deploy Candy Machine, then flip NEXT_PUBLIC_MINT_SIMULATED=false");