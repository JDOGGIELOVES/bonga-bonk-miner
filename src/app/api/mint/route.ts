import { NextResponse } from "next/server";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import { getSolanaRpcEndpoint } from "@/lib/solana";
import { NFT_DEPLOY_SUPPLY } from "@/lib/nft-metadata";

export const dynamic = "force-dynamic";

const candyMachineAddress =
  process.env.NEXT_PUBLIC_CANDY_MACHINE_ADDRESS || "";
const simulated = process.env.NEXT_PUBLIC_MINT_SIMULATED !== "false";

export async function GET() {
  const base = {
    simulated,
    candyMachineAddress: candyMachineAddress || null,
    collectionAddress: process.env.NEXT_PUBLIC_COLLECTION_ADDRESS || null,
    priceSol: Number(process.env.NEXT_PUBLIC_MINT_PRICE_SOL || "0.08"),
    supply: NFT_DEPLOY_SUPPLY,
    itemsRedeemed: null as number | null,
    itemsAvailable: null as number | null,
    live: false,
  };

  if (simulated || !candyMachineAddress) {
    return NextResponse.json(base);
  }

  try {
    const umi = createUmi(getSolanaRpcEndpoint()).use(mplCandyMachine());
    const candyMachine = await fetchCandyMachine(
      umi,
      publicKey(candyMachineAddress)
    );

    return NextResponse.json({
      ...base,
      live: true,
      itemsRedeemed: Number(candyMachine.itemsRedeemed),
      itemsAvailable: Number(candyMachine.data.itemsAvailable),
      collectionAddress: candyMachine.collectionMint?.toString() ?? base.collectionAddress,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch mint status";
    return NextResponse.json({ ...base, error: message }, { status: 502 });
  }
}