#!/usr/bin/env node
/**
 * Insert config lines into an existing Candy Machine (required before minting).
 * With prefix settings, only the suffix after prefixName/prefixUri is stored per line.
 *
 * Usage:
 *   SOLANA_RPC_URL=<helius> node scripts/load-cm-items.mjs
 *   CANDY_MACHINE_ADDRESS=BbWq... BATCH_SIZE=40
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  addConfigLines,
  fetchCandyMachine,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, keypairIdentity, publicKey } from "@metaplex-foundation/umi";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rpc =
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";
const batchSize = Number(process.env.BATCH_SIZE || "20");
const delayMs = Number(process.env.BATCH_DELAY_MS || "3000");
const maxRetries = Number(process.env.BATCH_RETRIES || "12");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForProgress(umi, cmPk, prevLoaded, expectedMin) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await sleep(delayMs);
    const cm = await fetchCandyMachine(umi, cmPk);
    const loaded = Number(cm.itemsLoaded);
    if (loaded >= expectedMin) return cm;
    console.log(`  Waiting for chain (${attempt}/${maxRetries}): still ${loaded}, want >= ${expectedMin}`);
  }
  return fetchCandyMachine(umi, cmPk);
}
const cmAddress =
  process.env.CANDY_MACHINE_ADDRESS ||
  process.env.NEXT_PUBLIC_CANDY_MACHINE_ADDRESS ||
  "BbWqpzPW95VDnbK5niSxWSaH4KDuifvHHqa89XQTTmt1";

const treasuryPath = join(root, ".treasury", "treasury-keypair.json");
if (!existsSync(treasuryPath)) {
  console.error("Missing .treasury/treasury-keypair.json");
  process.exit(1);
}

const secret = Uint8Array.from(JSON.parse(readFileSync(treasuryPath, "utf8")));
const umi = createUmi(rpc).use(mplCandyMachine()).use(mplTokenMetadata());
const keypair = umi.eddsa.createKeypairFromSecretKey(secret);
umi.use(keypairIdentity(createSignerFromKeypair(umi, keypair)));

function pad4(n) {
  return String(n).padStart(4, "0");
}

function buildBatch(startIndex, count) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const id = startIndex + i;
    const suffix = pad4(id);
    lines.push({ name: suffix, uri: suffix });
  }
  return lines;
}

console.log("\n=== Load Candy Machine Items ===\n");
console.log("RPC:", rpc.slice(0, 48) + "...");
console.log("Candy Machine:", cmAddress);
console.log("Authority:", umi.identity.publicKey);
console.log("Batch size:", batchSize);

let candyMachine = await fetchCandyMachine(umi, publicKey(cmAddress));
const total = Number(candyMachine.data.itemsAvailable);
const loaded = Number(candyMachine.itemsLoaded);

console.log("Items available:", total);
console.log("Items loaded:", loaded);

if (loaded >= total) {
  console.log("\nAlready fully loaded — nothing to do.\n");
  process.exit(0);
}

let txCount = 0;

while (Number(candyMachine.itemsLoaded) < total) {
  const index = Number(candyMachine.itemsLoaded);
  const remaining = total - index;
  const count = Math.min(batchSize, remaining);
  const configLines = buildBatch(index + 1, count);

  console.log(`\nTx ${++txCount}: inserting ${count} lines at index ${index} (${index + 1}–${index + count})...`);

  await addConfigLines(umi, {
    candyMachine: candyMachine.publicKey,
    index,
    configLines,
  }).sendAndConfirm(umi, { confirm: { commitment: "finalized" } });

  const expectedMin = index + count;
  candyMachine = await waitForProgress(
    umi,
    publicKey(cmAddress),
    index,
    expectedMin
  );
  const newLoaded = Number(candyMachine.itemsLoaded);
  console.log("Progress:", newLoaded, "/", total);

  if (newLoaded < expectedMin) {
    console.error(`itemsLoaded stuck at ${newLoaded} (expected >= ${expectedMin}).`);
    process.exit(1);
  }
}

console.log("\n=== Done ===");
console.log("itemsLoaded:", candyMachine.itemsLoaded);
console.log("isFullyLoaded:", candyMachine.isFullyLoaded);
console.log("Minting should work now.\n");