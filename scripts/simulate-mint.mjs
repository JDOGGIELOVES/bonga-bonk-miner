#!/usr/bin/env node
/** Simulate MintV2 to confirm CM is mint-ready (no SOL spent). */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  mintV2,
  mplCandyMachine,
  safeFetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";
import { mplTokenMetadata, TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
  publicKey,
  some,
  transactionBuilder,
} from "@metaplex-foundation/umi";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rpc = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const CM = "BbWqpzPW95VDnbK5niSxWSaH4KDuifvHHqa89XQTTmt1";
const TREASURY = "8w1KpwzpAttJAonNHohTyAhzcw4iYuCrQPhppPRw5ASb";

const secret = Uint8Array.from(JSON.parse(readFileSync(join(root, ".treasury/treasury-keypair.json"), "utf8")));
const umi = createUmi(rpc).use(mplCandyMachine()).use(mplTokenMetadata());
umi.use(keypairIdentity(createSignerFromKeypair(umi, umi.eddsa.createKeypairFromSecretKey(secret))));

const candyMachine = await fetchCandyMachine(umi, publicKey(CM));
const candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);
const nftMint = generateSigner(umi);

const builder = transactionBuilder()
  .add(setComputeUnitLimit(umi, { units: 800_000 }))
  .add(
    mintV2(umi, {
      candyMachine: candyMachine.publicKey,
      candyGuard: candyGuard?.publicKey,
      nftMint,
      collectionMint: candyMachine.collectionMint,
      collectionUpdateAuthority: candyMachine.authority,
      tokenStandard: candyMachine.tokenStandard ?? TokenStandard.NonFungible,
      mintArgs: {
        solPayment: some({ destination: publicKey(TREASURY) }),
        mintLimit: some({ id: 1 }),
      },
    })
  );

const tx = await builder.buildAndSign(umi);
const sim = await umi.rpc.simulateTransaction(tx, {
  commitment: "confirmed",
  replaceRecentBlockhash: true,
});

if (sim.err) {
  console.error("Simulation FAILED:", sim.err);
  console.error("Logs:", sim.logs?.join("\n"));
  process.exit(1);
}

console.log("Simulation OK — MintV2 should work in Phantom.");
console.log("itemsLoaded:", Number(candyMachine.itemsLoaded));
console.log("Compute units:", sim.unitsConsumed);