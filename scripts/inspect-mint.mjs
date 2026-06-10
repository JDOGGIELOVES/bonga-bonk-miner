#!/usr/bin/env node
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchDigitalAsset, findMetadataPda, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const MINT = process.argv[2] || "7a1aZMQqs2Hg6iNG4WoR5kbqytQWNVCJ1BL9aaWG3Sy4";
const MINTER = process.argv[3] || "5UdUcAmCp2brWCCVFFdHSJb5JtAggJQfPsZzxcYgYaPA";

const conn = new Connection(rpc, "confirmed");
const umi = createUmi(rpc).use(mplTokenMetadata());
const mintPk = new PublicKey(MINT);
const minterPk = new PublicKey(MINTER);

const mintInfo = await conn.getAccountInfo(mintPk);
console.log("Mint", MINT, "exists:", !!mintInfo, "owner:", mintInfo?.owner.toBase58());

const mdPda = findMetadataPda(umi, { mint: publicKey(MINT) });
const mdStr = typeof mdPda === "string" ? mdPda : mdPda.toString().split(",")[0];
const mdInfo = await conn.getAccountInfo(new PublicKey(mdStr));
console.log("Metadata", mdStr, "exists:", !!mdInfo, "owner:", mdInfo?.owner?.toBase58());

try {
  const asset = await fetchDigitalAsset(umi, publicKey(MINT));
  console.log("\nDigital asset:");
  console.log("  name:", asset.metadata.name);
  console.log("  uri:", asset.metadata.uri);
  console.log("  collection:", JSON.stringify(asset.metadata.collection));
} catch (e) {
  console.log("\nfetchDigitalAsset failed:", e.message);
}

const ata = getAssociatedTokenAddressSync(mintPk, minterPk);
const ataInfo = await conn.getAccountInfo(ata);
console.log("\nATA for minter", MINTER);
console.log("  ata:", ata.toBase58(), "exists:", !!ataInfo);
if (ataInfo) {
  const bal = await conn.getTokenAccountBalance(ata);
  console.log("  balance:", bal.value.uiAmount);
}

// Scan all ATAs for this mint with supply 1
const largest = await conn.getTokenLargestAccounts(mintPk);
console.log("\nToken largest accounts:", largest.value.map((a) => `${a.address.toBase58()} amount=${a.amount}`));