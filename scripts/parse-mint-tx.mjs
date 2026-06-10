#!/usr/bin/env node
import { Connection, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { findMetadataPda, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const SIG = process.argv[2] || "2KwKKcSdgdS2qbHgKj8GTYWcc4BXPoVXMcAYwmLP8hqCRtCF6HPMTHhZxNNDCbDUqK1CyocQ5ugb9N8RjasCZ5Z7";

const conn = new Connection(rpc, "confirmed");
const umi = createUmi(rpc).use(mplTokenMetadata());

const tx = await conn.getTransaction(SIG, {
  maxSupportedTransactionVersion: 0,
  commitment: "confirmed",
});

if (!tx) {
  console.log("Tx not found");
  process.exit(1);
}

console.log("err:", tx.meta?.err);
console.log("\nLogs:");
for (const line of tx.meta?.logMessages ?? []) console.log(line);

const keys = tx.transaction.message.staticAccountKeys.map((k) => k.toBase58());
console.log("\nStatic accounts:");
keys.forEach((k, i) => console.log(`  [${i}] ${k}`));

// Find mint-like accounts: check which have mint layout / metadata
for (const k of keys) {
  const info = await conn.getAccountInfo(new PublicKey(k));
  if (!info) continue;
  const owner = info.owner.toBase58();
  if (owner === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" && info.data.length === 82) {
    console.log(`\nSPL Mint: ${k}`);
    const md = findMetadataPda(umi, { mint: publicKey(k) });
    const mdInfo = await conn.getAccountInfo(new PublicKey(md));
    console.log(`  Metadata PDA: ${md} exists=${!!mdInfo} owner=${mdInfo?.owner?.toBase58()}`);
  }
}