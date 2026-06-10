#!/usr/bin/env node
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchCandyMachine, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

const rpc = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const CM = "BbWqpzPW95VDnbK5niSxWSaH4KDuifvHHqa89XQTTmt1";

const umi = createUmi(rpc).use(mplCandyMachine()).use(mplTokenMetadata());
const cm = await fetchCandyMachine(umi, publicKey(CM));

console.log("itemsRedeemed:", Number(cm.itemsRedeemed), "/", Number(cm.data.itemsAvailable));
console.log("itemsLoaded:", Number(cm.itemsLoaded));

const redeemed = Number(cm.itemsRedeemed);
if (redeemed === 0) {
  console.log("\nNo on-chain mints yet — tx may have failed or not confirmed.");
  process.exit(0);
}

const mintedItems = cm.items.filter((i) => i.minted);
console.log("\nMinted items:", mintedItems.length);
for (const item of mintedItems.slice(0, 10)) {
  console.log(`  #${item.index + 1} mint=${item.mint} name=${item.name}`);
  if (item.mint) {
    try {
      const asset = await fetchDigitalAsset(umi, publicKey(item.mint));
      console.log(`    uri=${asset.metadata.uri}`);
      console.log(`    owner token? check explorer for mint ${item.mint}`);
    } catch (e) {
      console.log(`    asset fetch failed: ${e.message}`);
    }
  }
}