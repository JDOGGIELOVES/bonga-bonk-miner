#!/usr/bin/env node
/**
 * Clear CollectionDetails V2 from collection NFT metadata.
 * Candy Machine core cannot deserialize V2 — causes BorshIoError on mint.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  collectionDetails,
  collectionDetailsToggle,
  fetchMetadataFromSeeds,
  mplTokenMetadata,
  updateV1,
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, keypairIdentity, publicKey } from "@metaplex-foundation/umi";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION_ADDRESS || "DbMJsyBqVDeBc9EcRu8Nbw3RS1nZMdsYw1SnUX6dZNNT";

const secret = Uint8Array.from(JSON.parse(readFileSync(join(root, ".treasury/treasury-keypair.json"), "utf8")));
const umi = createUmi(rpc).use(mplTokenMetadata());
umi.use(keypairIdentity(createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(secret))));

const mint = publicKey(COLLECTION);
const before = await fetchMetadataFromSeeds(umi, { mint });
console.log("Before collectionDetails:", before.collectionDetails);

// CM core only understands CollectionDetails V1 — convert from V2.
await updateV1(umi, {
  mint,
  authority: umi.identity,
  collectionDetails: collectionDetailsToggle("Set", [
    collectionDetails("V1", { size: 2000 }),
  ]),
}).sendAndConfirm(umi, { confirm: { commitment: "finalized" } });

const after = await fetchMetadataFromSeeds(umi, { mint });
console.log("After collectionDetails:", after.collectionDetails);
console.log("Collection metadata fixed.");