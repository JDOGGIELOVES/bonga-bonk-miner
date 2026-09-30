import { PublicKey } from "@solana/web3.js";
import {
  DEPLOYED_CANDY_MACHINE,
  getCandyMachineAddress,
  getCollectionAddress,
  getMintPriceSol,
  isMintSimulated,
} from "@/lib/mint-config";
import { NFT_DEPLOY_SUPPLY } from "@/lib/nft-metadata";
import { withRpcRetry } from "@/lib/treasury/rpc";

/** Candy Machine v3 account layout — verified on mainnet BbWqpz... */
const ITEMS_REDEEMED_OFFSET = 112;
const ITEMS_AVAILABLE_OFFSET = 120;

async function fetchItemsRedeemed(
  candyMachineAddress: string
): Promise<number | null> {
  try {
    return await withRpcRetry(async (connection) => {
      const account = await connection.getAccountInfo(
        new PublicKey(candyMachineAddress)
      );
      if (!account?.data || account.data.length < ITEMS_AVAILABLE_OFFSET + 8) {
        return null;
      }
      return Number(account.data.readBigUInt64LE(ITEMS_REDEEMED_OFFSET));
    });
  } catch {
    return null;
  }
}

/** Server-safe mint status — no Metaplex (breaks on Vercel serverless ESM). */
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
    itemsAvailable: NFT_DEPLOY_SUPPLY,
    live: false,
  };

  if (simulated || !candyMachineAddress) {
    return base;
  }

  const itemsRedeemed = await fetchItemsRedeemed(candyMachineAddress);
  let itemsAvailable = NFT_DEPLOY_SUPPLY;
  try {
    itemsAvailable = await withRpcRetry(async (connection) => {
      const account = await connection.getAccountInfo(
        new PublicKey(candyMachineAddress)
      );
      if (account?.data && account.data.length >= ITEMS_AVAILABLE_OFFSET + 8) {
        return Number(account.data.readBigUInt64LE(ITEMS_AVAILABLE_OFFSET));
      }
      return NFT_DEPLOY_SUPPLY;
    });
  } catch {
    /* use default supply */
  }

  return {
    ...base,
    simulated: false,
    live: true,
    itemsRedeemed,
    itemsAvailable,
    candyMachineAddress: candyMachineAddress || DEPLOYED_CANDY_MACHINE,
  };
}