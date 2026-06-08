#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  mplCandyMachine,
  updateCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, keypairIdentity, publicKey } from "@metaplex-foundation/umi";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const CM = "BbWqpzPW95VDnbK5niSxWSaH4KDuifvHHqa89XQTTmt1";
const TREASURY = "8w1KpwzpAttJAonNHohTyAhzcw4iYuCrQPhppPRw5ASb";

const secret = Uint8Array.from(JSON.parse(readFileSync(join(root, ".treasury/treasury-keypair.json"), "utf8")));
const umi = createUmi(rpc).use(mplCandyMachine()).use(mplTokenMetadata());
umi.use(keypairIdentity(createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(secret))));

const cm = await fetchCandyMachine(umi, publicKey(CM));
console.log("Before creators:", cm.data.creators);

await updateCandyMachine(umi, {
  candyMachine: cm.publicKey,
  authority: umi.identity,
  data: {
    ...cm.data,
    creators: [
      {
        address: publicKey(TREASURY),
        verified: true,
        percentageShare: 100,
      },
    ],
  },
}).sendAndConfirm(umi, { confirm: { commitment: "finalized" } });

const updated = await fetchCandyMachine(umi, publicKey(CM));
console.log("After creators:", updated.data.creators);