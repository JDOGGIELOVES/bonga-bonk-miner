import { Connection, PublicKey } from "@solana/web3.js";
import {
  DEPLOYED_CANDY_MACHINE,
  getCandyMachineAddress,
  getCollectionAddress,
  getMintPriceSol,
  isMintSimulated,
} from "@/lib/mint-config";
import { NFT_DEPLOY_SUPPLY } from "@/lib/nft-metadata";
import { getSolanaRpcEndpoint } from "@/lib/solana";

/** Candy Machine v3 account layout — verified on mainnet BbWqpz... */
const ITEMS_REDEEMED_OFFSET = 112;
const ITEMS_AVAILABLE_OFFSET = 120;

async function fetchItemsRedeemed(
  candyMachineAddress: string
): Promise<number | null> {
  try {
    const connection = new Connection(getSolanaRpcEndpoint(), "confirmed");
    const account = await connection.getAccountInfo(
      new PublicKey(candyMachineAddress)
    );
    if (!account?.data || account.data.length < ITEMS_AVAILABLE_OFFSET + 8) {
      return null;
    }
    return Number(account.data.readBigUInt64LE(ITEMS_REDEEMED_OFFSET));
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
    const connection = new Connection(getSolanaRpcEndpoint(), "confirmed");
    const account = await connection.getAccountInfo(
      new PublicKey(candyMachineAddress)
    );
    if (account?.data && account.data.length >= ITEMS_AVAILABLE_OFFSET + 8) {
      itemsAvailable = Number(
        account.data.readBigUInt64LE(ITEMS_AVAILABLE_OFFSET)
      );
    }
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