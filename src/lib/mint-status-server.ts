import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  mplCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import {
  getCandyMachineAddress,
  getCollectionAddress,
  getMintPriceSol,
  isMintSimulated,
} from "@/lib/mint-config";
import { NFT_DEPLOY_SUPPLY } from "@/lib/nft-metadata";
import { getSolanaRpcEndpoint } from "@/lib/solana";

export async function getMintStatusPayload() {
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
    return base;
  }

  const umi = createUmi(getSolanaRpcEndpoint()).use(mplCandyMachine());
  const candyMachine = await fetchCandyMachine(
    umi,
    publicKey(candyMachineAddress)
  );

  return {
    ...base,
    simulated: false,
    live: true,
    itemsRedeemed: Number(candyMachine.itemsRedeemed),
    itemsAvailable: Number(candyMachine.data.itemsAvailable),
    collectionAddress:
      candyMachine.collectionMint?.toString() ?? base.collectionAddress,
  };
}