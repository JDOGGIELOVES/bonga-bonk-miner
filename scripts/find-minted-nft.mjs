#!/usr/bin/env node
import { Connection, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchCandyMachine, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import {
  fetchDigitalAsset,
  fetchMetadataFromSeeds,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const CM = "BbWqpzPW95VDnbK5niSxWSaH4KDuifvHHqa89XQTTmt1";
const CANDY_GUARD = "GiDbS1LqyVzz6JNvqSDPtKRchkrTMwZj827cAy2RuP1p";

const umi = createUmi(rpc).use(mplCandyMachine()).use(mplTokenMetadata());
const conn = new Connection(rpc, "confirmed");

const cm = await fetchCandyMachine(umi, publicKey(CM));
console.log("itemsRedeemed:", Number(cm.itemsRedeemed));

// Recent txs on candy guard (mints go through guard)
const sigs = await conn.getSignaturesForAddress(new PublicKey(CANDY_GUARD), { limit: 5 });
console.log("\nRecent guard txs:");
for (const s of sigs) {
  console.log(`  ${s.signature} slot=${s.slot} err=${s.err ? JSON.stringify(s.err) : "ok"}`);
}

if (sigs[0]) {
  const tx = await conn.getParsedTransaction(sigs[0].signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });
  const keys = tx?.transaction.message.accountKeys.map((k) =>
    typeof k === "string" ? k : k.pubkey.toBase58()
  );
  console.log("\nAccounts in latest tx (first 15):");
  keys?.slice(0, 15).forEach((k, i) => console.log(`  [${i}] ${k}`));

  // NFT mint is typically index 6 in mintV2
  const nftMintPk = keys?.[6];
  if (nftMintPk) {
    console.log("\nLikely NFT mint:", nftMintPk);
    try {
      const asset = await fetchDigitalAsset(umi, publicKey(nftMintPk));
      console.log("Name:", asset.metadata.name);
      console.log("URI:", asset.metadata.uri);
      console.log("Collection:", asset.metadata.collection);
      console.log("Update authority:", asset.metadata.updateAuthority);

      const ownerKey = keys?.[5];
      if (ownerKey) {
        const ata = getAssociatedTokenAddressSync(new PublicKey(nftMintPk), new PublicKey(ownerKey));
        const bal = await conn.getTokenAccountBalance(ata).catch(() => null);
        console.log("Minter (idx 5):", ownerKey);
        console.log("ATA:", ata.toBase58(), "balance:", bal?.value?.uiAmount ?? "missing");
      }
    } catch (e) {
      console.log("Asset fetch error:", e.message);
      try {
        const md = await fetchMetadataFromSeeds(umi, { mint: publicKey(nftMintPk) });
        console.log("Metadata name:", md.name, "uri:", md.uri);
      } catch (e2) {
        console.log("Metadata missing:", e2.message);
      }
    }
  }
}

// Check metadata API for item 570
const uri = "https://bongabonks.com/api/nft/metadata/0570";
const res = await fetch(uri);
console.log(`\nMetadata API ${uri}: ${res.status}`);
if (res.ok) {
  const json = await res.json();
  console.log("  name:", json.name);
  console.log("  image:", json.image?.slice?.(0, 80));
}