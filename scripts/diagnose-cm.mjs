#!/usr/bin/env node
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  fetchCandyGuard,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

const CM = "BbWqpzPW95VDnbK5niSxWSaH4KDuifvHHqa89XQTTmt1";
const rpc =
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  "https://api.mainnet-beta.solana.com";

const umi = createUmi(rpc).use(mplCandyMachine()).use(mplTokenMetadata());

const cm = await fetchCandyMachine(umi, publicKey(CM));
console.log("=== Candy Machine ===");
const j = (v) => JSON.stringify(v, (_, x) => typeof x === "bigint" ? x.toString() : x, 2);
console.log(j({
  publicKey: cm.publicKey,
  authority: cm.authority,
  mintAuthority: cm.mintAuthority,
  collectionMint: cm.collectionMint,
  itemsRedeemed: cm.itemsRedeemed,
  itemsAvailable: cm.data.itemsAvailable,
  itemsLoaded: cm.itemsLoaded,
  tokenStandard: cm.tokenStandard,
  version: cm.version,
  creators: cm.data.creators,
  symbol: cm.data.symbol,
  isFullyLoaded: cm.isFullyLoaded,
  configLineSettings: cm.configLineSettings,
  hiddenSettings: cm.hiddenSettings,
  items: cm.items?.slice?.(0, 3),
}));

try {
  const guard = await fetchCandyGuard(umi, cm.mintAuthority);
  console.log("\n=== Candy Guard ===");
  const j = (v) => JSON.stringify(v, (_, x) => typeof x === "bigint" ? x.toString() : x, 2);
console.log(j({
    publicKey: guard.publicKey,
    base: guard.base,
    authority: guard.authority,
    guards: guard.guards,
    groups: guard.groups,
  }));
} catch (e) {
  console.error("Guard fetch failed:", e.message);
}