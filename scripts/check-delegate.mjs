#!/usr/bin/env node
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  findCandyMachineAuthorityPda,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import {
  findMetadataDelegateRecordPda,
  MetadataDelegateRole,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

const rpc = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const CM = "BbWqpzPW95VDnbK5niSxWSaH4KDuifvHHqa89XQTTmt1";
const COLLECTION = "DbMJsyBqVDeBc9EcRu8Nbw3RS1nZMdsYw1SnUX6dZNNT";
const AUTHORITY = "8w1KpwzpAttJAonNHohTyAhzcw4iYuCrQPhppPRw5ASb";

const umi = createUmi(rpc).use(mplCandyMachine()).use(mplTokenMetadata());
const cmAuth = findCandyMachineAuthorityPda(umi, { candyMachine: publicKey(CM) });
const delegateRecord = findMetadataDelegateRecordPda(umi, {
  mint: publicKey(COLLECTION),
  delegateRole: MetadataDelegateRole.Collection,
  updateAuthority: publicKey(AUTHORITY),
  delegate: cmAuth,
});

for (const [label, pk] of [
  ["cmAuthorityPda", cmAuth],
  ["collectionDelegateRecord", delegateRecord],
]) {
  const acc = await umi.rpc.getAccount(pk);
  console.log(label, pk.toString(), "exists:", acc.exists, "owner:", acc.exists ? acc.owner : "n/a");
}