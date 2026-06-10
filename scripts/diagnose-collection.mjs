#!/usr/bin/env node
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchMetadataFromSeeds, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const COLLECTION = "DbMJsyBqVDeBc9EcRu8Nbw3RS1nZMdsYw1SnUX6dZNNT";
const umi = createUmi(rpc).use(mplTokenMetadata());

const md = await fetchMetadataFromSeeds(umi, { mint: publicKey(COLLECTION) });
const j = (v) => JSON.stringify(v, (_, x) => typeof x === "bigint" ? x.toString() : x, 2);
console.log(j({
  mint: md.mint,
  updateAuthority: md.updateAuthority,
  name: md.name,
  uri: md.uri,
  tokenStandard: md.tokenStandard,
  programmableConfig: md.programmableConfig,
  collectionDetails: md.collectionDetails,
}));