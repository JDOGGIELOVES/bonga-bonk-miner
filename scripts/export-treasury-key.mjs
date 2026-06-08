#!/usr/bin/env node
/** Prints the base58 private key for Vercel from local .treasury backup */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import bs58 from "bs58";

const keyPath = join(process.cwd(), ".treasury", "treasury-keypair.json");
if (!existsSync(keyPath)) {
  console.error("Missing .treasury/treasury-keypair.json — run: npm run treasury:setup");
  process.exit(1);
}

const secret = Uint8Array.from(JSON.parse(readFileSync(keyPath, "utf8")));
const privateKey = bs58.encode(secret);

console.log("\nPaste this EXACT value into Vercel → TREASURY_PRIVATE_KEY:\n");
console.log(privateKey);
console.log(`\nLength: ${privateKey.length} characters (should be 88)`);
console.log(`Starts with: ${privateKey.slice(0, 4)}... Ends with: ...${privateKey.slice(-4)}`);
console.log("\nDo NOT use the JSON array. No quotes. No spaces.");
console.log("In Vercel: delete the old variable first, then add a fresh one.\n");