#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  mplCandyMachine,
  setCollection,
  setCollectionV2,
} from "@metaplex-foundation/mpl-candy-machine";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, keypairIdentity, publicKey } from "@metaplex-foundation/umi";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const CM = "BbWqpzPW95VDnbK5niSxWSaH4KDuifvHHqa89XQTTmt1";
const NEW_COLLECTION = process.env.NEW_COLLECTION || "29euf1CexRvPydBUnu9HtSpMBUanKADoicie3MT4nBPY";

const secret = Uint8Array.from(JSON.parse(readFileSync(join(root, ".treasury/treasury-keypair.json"), "utf8")));
const umi = createUmi(rpc).use(mplCandyMachine()).use(mplTokenMetadata());
umi.use(keypairIdentity(createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(secret))));

const cm = await fetchCandyMachine(umi, publicKey(CM));
console.log("version:", cm.version, "collection:", cm.collectionMint);

const input = {
  candyMachine: cm.publicKey,
  authority: umi.identity,
  collectionMint: cm.collectionMint,
  collectionUpdateAuthority: umi.identity,
  newCollectionMint: publicKey(NEW_COLLECTION),
  newCollectionUpdateAuthority: umi.identity,
};

const fn = cm.version === 1 || cm.version?.__kind === "V1" ? setCollection : setCollectionV2;
console.log("Using", fn.name);

const result = await fn(umi, input).sendAndConfirm(umi, { confirm: { commitment: "finalized" } });
console.log("Result:", result.result?.value?.err ?? "ok");

const updated = await fetchCandyMachine(umi, publicKey(CM));
console.log("New collection on CM:", updated.collectionMint);