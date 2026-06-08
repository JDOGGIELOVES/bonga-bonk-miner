#!/usr/bin/env node
/**
 * Create a CM-compatible collection (no CollectionDetails V2) and attach to existing CM.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  mplCandyMachine,
  setCollectionV2,
} from "@metaplex-foundation/mpl-candy-machine";
import {
  createNft,
  fetchMetadataFromSeeds,
  mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  none,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bongabonks.com";
const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const CM = process.env.CANDY_MACHINE_ADDRESS || "BbWqpzPW95VDnbK5niSxWSaH4KDuifvHHqa89XQTTmt1";

const secret = Uint8Array.from(JSON.parse(readFileSync(join(root, ".treasury/treasury-keypair.json"), "utf8")));
const umi = createUmi(rpc).use(mplCandyMachine()).use(mplTokenMetadata());
umi.use(keypairIdentity(createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(secret))));

const candyMachine = await fetchCandyMachine(umi, publicKey(CM));
console.log("Candy Machine:", CM);
console.log("Old collection:", candyMachine.collectionMint);
console.log("itemsLoaded:", Number(candyMachine.itemsLoaded));

const collectionMint = generateSigner(umi);
console.log("\nCreating CM-compatible collection...");
await createNft(umi, {
  mint: collectionMint,
  name: "Bonga NFT Collection",
  symbol: "BONGA",
  uri: `${siteUrl}/api/nft/collection`,
  sellerFeeBasisPoints: percentAmount(5, 2),
  tokenStandard: TokenStandard.NonFungible,
  isCollection: true,
  collectionDetails: none(),
}).sendAndConfirm(umi, { confirm: { commitment: "finalized" } });

await new Promise((r) => setTimeout(r, 4000));
const md = await fetchMetadataFromSeeds(umi, { mint: collectionMint.publicKey });
console.log("New collection:", collectionMint.publicKey);
console.log("collectionDetails:", md.collectionDetails);

console.log("\nAttaching new collection to Candy Machine...");
await setCollectionV2(umi, {
  candyMachine: candyMachine.publicKey,
  authority: umi.identity,
  collectionMint: candyMachine.collectionMint,
  collectionUpdateAuthority: umi.identity,
  newCollectionMint: collectionMint.publicKey,
  newCollectionUpdateAuthority: umi.identity,
}).sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });

const updated = await fetchCandyMachine(umi, publicKey(CM));
console.log("Updated CM collection:", updated.collectionMint);

const deployPath = join(root, ".nft-deploy.json");
try {
  const info = JSON.parse(readFileSync(deployPath, "utf8"));
  info.collectionAddress = collectionMint.publicKey.toString();
  info.collectionFixedAt = new Date().toISOString();
  writeFileSync(deployPath, JSON.stringify(info, null, 2));
} catch {
  /* optional */
}

console.log("\nDone. Update NEXT_PUBLIC_COLLECTION_ADDRESS in Vercel:");
console.log(collectionMint.publicKey);