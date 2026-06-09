#!/usr/bin/env node
/**
 * Deploy Bonga Candy Machine v3 on Solana mainnet.
 * Uses hosted metadata at bongabonks.com/api/nft/metadata/{id}
 *
 * Usage:
 *   SOLANA_RPC_URL=<helius> node scripts/deploy-candy-machine.mjs
 *   NFT_DEPLOY_SUPPLY=500  (optional, default 2000)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, keypairIdentity, publicKey, generateSigner, percentAmount, some, none, sol } from "@metaplex-foundation/umi";
import { addConfigLines, create, fetchCandyMachine, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { createNft, mplTokenMetadata, TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bongabonks.com";
const supply = Number(process.env.NFT_DEPLOY_SUPPLY || "2000");
const priceSol = Number(process.env.NEXT_PUBLIC_MINT_PRICE_SOL || "0.08");
const rpc =
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

const treasuryPath = join(root, ".treasury", "treasury-keypair.json");
if (!existsSync(treasuryPath)) {
  console.error("Missing .treasury/treasury-keypair.json — run npm run treasury:setup");
  process.exit(1);
}

const secret = Uint8Array.from(JSON.parse(readFileSync(treasuryPath, "utf8")));
const umi = createUmi(rpc).use(mplCandyMachine()).use(mplTokenMetadata());
const keypair = umi.eddsa.createKeypairFromSecretKey(secret);
umi.use(keypairIdentity(createSignerFromKeypair(umi, keypair)));

const treasury = umi.identity.publicKey;
console.log("\n=== Bonga Candy Machine Deploy ===\n");
console.log("RPC:", rpc.slice(0, 48) + "...");
console.log("Authority:", treasury);
console.log("Supply:", supply);
console.log("Price:", priceSol, "SOL");
console.log("Metadata:", `${siteUrl}/api/nft/metadata/`);

let collectionMintKey = process.env.NEXT_PUBLIC_COLLECTION_ADDRESS || "";

if (!collectionMintKey) {
  const collectionMint = generateSigner(umi);
  console.log("\n1/2 Creating collection NFT...");
  await createNft(umi, {
    mint: collectionMint,
    name: "Bonga NFT Collection",
    symbol: "BONGA",
    uri: `${siteUrl}/api/nft/collection`,
    sellerFeeBasisPoints: percentAmount(5, 2),
    isCollection: true,
    collectionDetails: none(),
  }).sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
  collectionMintKey = collectionMint.publicKey.toString();
  console.log("Collection:", collectionMintKey);
} else {
  console.log("\n1/2 Reusing collection:", collectionMintKey);
}

const candyMachine = generateSigner(umi);
console.log("\n2/2 Creating Candy Machine + guards...");
const candyTx = await create(umi, {
  candyMachine,
  collectionMint: publicKey(collectionMintKey),
  collectionUpdateAuthority: umi.identity,
  symbol: "BONGA",
  sellerFeeBasisPoints: percentAmount(5, 2),
  creators: [{ address: treasury, verified: true, percentageShare: 100 }],
  tokenStandard: TokenStandard.NonFungible,
  itemsAvailable: supply,
  configLineSettings: some({
    prefixName: "Bonga #",
    nameLength: 4,
    prefixUri: `${siteUrl}/api/nft/metadata/`,
    uriLength: 4,
    isSequential: false,
  }),
  guards: {
    solPayment: some({ lamports: sol(priceSol), destination: treasury }),
    mintLimit: some({ id: 1, limit: 3 }),
  },
});
await candyTx.sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });

console.log("\n3/3 Loading config lines (required before mint)...");
const batchSize = Number(process.env.BATCH_SIZE || "40");
const pad4 = (n) => String(n).padStart(4, "0");
let cmAccount = await fetchCandyMachine(umi, candyMachine.publicKey);
while (Number(cmAccount.itemsLoaded) < supply) {
  const index = Number(cmAccount.itemsLoaded);
  const count = Math.min(batchSize, supply - index);
  const configLines = Array.from({ length: count }, (_, i) => {
    const suffix = pad4(index + i + 1);
    return { name: suffix, uri: suffix };
  });
  console.log(`  Inserting ${count} lines at index ${index}...`);
  await addConfigLines(umi, {
    candyMachine: candyMachine.publicKey,
    index,
    configLines,
  }).sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
  cmAccount = await fetchCandyMachine(umi, candyMachine.publicKey);
}
console.log("  Loaded:", cmAccount.itemsLoaded, "/", supply);

const deployInfo = {
  deployedAt: new Date().toISOString(),
  network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta",
  candyMachineAddress: candyMachine.publicKey.toString(),
  collectionAddress: collectionMintKey,
  treasury: treasury.toString(),
  supply,
  priceSol,
  metadataPrefix: `${siteUrl}/api/nft/metadata/`,
};

const outPath = join(root, ".nft-deploy.json");
writeFileSync(outPath, JSON.stringify(deployInfo, null, 2));

console.log("\n=== Deployed ===\n");
console.log("Candy Machine:", deployInfo.candyMachineAddress);
console.log("Collection:", deployInfo.collectionAddress);
console.log("\nAdd to Vercel env:\n");
console.log(`NEXT_PUBLIC_MINT_SIMULATED=false`);
console.log(`NEXT_PUBLIC_CANDY_MACHINE_ADDRESS=${deployInfo.candyMachineAddress}`);
console.log(`NEXT_PUBLIC_COLLECTION_ADDRESS=${deployInfo.collectionAddress}`);
console.log(`NEXT_PUBLIC_MINT_PRICE_SOL=${priceSol}`);
console.log(`NEXT_PUBLIC_SITE_URL=${siteUrl}`);
console.log(`NFT_DEPLOY_SUPPLY=${supply}`);
console.log(`\nSaved: ${outPath}`);
console.log("\nRedeploy Vercel, then mint at https://bongabonks.com/nft\n");