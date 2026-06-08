import { NextResponse } from "next/server";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import { getSolanaRpcEndpoint } from "@/lib/solana";
import { NFT_DEPLOY_SUPPLY } from "@/lib/nft-metadata";
import {
  getCandyMachineAddress,
  getCollectionAddress,
  getMintPriceSol,
  isMintSimulated,
} from "@/lib/mint-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const candyMachineAddress = getCandyMachineAddress();
  const simulated = isMintSimulated();

  const base = {
    simulated,
    candyMachineAddress: candyMachineAddress || null,
    collectionAddress: getCollectionAddress() || null,
    priceSol: getMintPriceSol(),
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
      simulated: false,
      live: true,
      itemsRedeemed: Number(candyMachine.itemsRedeemed),
      itemsAvailable: Number(candyMachine.data.itemsAvailable),
      collectionAddress:
        candyMachine.collectionMint?.toString() ?? base.collectionAddress,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch mint status";
    return NextResponse.json({ ...base, error: message }, { status: 502 });
  }
}