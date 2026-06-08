import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  mintV2,
  mplCandyMachine,
  safeFetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import {
  generateSigner,
  publicKey,
  some,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { getSolanaRpcEndpoint } from "@/lib/solana";
import {
  getNftByTraitId,
  getTraitIdForItemIndex,
} from "@/lib/nft-metadata";
import { MINT_CONFIG, type MintedNFT } from "@/lib/nft-mint";

function getTreasuryDestination(): string {
  return (
    process.env.NEXT_PUBLIC_TREASURY_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_MINT_TREASURY ||
    "8w1KpwzpAttJAonNHohTyAhzcw4iYuCrQPhppPRw5ASb"
  );
}

export async function mintBongaNFTOnChain(
  wallet: WalletContextState,
  walletAddress: string
): Promise<{ success: true; minted: MintedNFT } | { success: false; error: string }> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    return { success: false, error: "Connect Phantom or Solflare to mint" };
  }

  if (!MINT_CONFIG.candyMachineAddress) {
    return {
      success: false,
      error: "Candy Machine not configured yet. Check back soon.",
    };
  }

  try {
    const umi = createUmi(getSolanaRpcEndpoint())
      .use(mplCandyMachine())
      .use(mplTokenMetadata())
      .use(walletAdapterIdentity(wallet));

    const candyMachine = await fetchCandyMachine(
      umi,
      publicKey(MINT_CONFIG.candyMachineAddress)
    );

    if (candyMachine.itemsRedeemed >= candyMachine.data.itemsAvailable) {
      return { success: false, error: "Collection sold out" };
    }

    const candyGuard = await safeFetchCandyGuard(
      umi,
      candyMachine.mintAuthority
    );

    const nftMint = generateSigner(umi);
    const nextIndex = Number(candyMachine.itemsRedeemed) + 1;
    const traitId = getTraitIdForItemIndex(nextIndex);
    const nft = getNftByTraitId(traitId);

    const builder = transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: 800_000 }))
      .add(
        mintV2(umi, {
          candyMachine: candyMachine.publicKey,
          candyGuard: candyGuard?.publicKey,
          nftMint,
          collectionMint: candyMachine.collectionMint,
          collectionUpdateAuthority: candyMachine.authority,
          mintArgs: {
            solPayment: some({ destination: publicKey(getTreasuryDestination()) }),
            mintLimit: some({ id: 1 }),
          },
        })
      );

    const { signature } = await builder.sendAndConfirm(umi, {
      confirm: { commitment: "confirmed" },
    });

    const txSignature = bs58.encode(signature);

    return {
      success: true,
      minted: {
        mint: nftMint.publicKey.toString(),
        nft,
        wallet: walletAddress,
        timestamp: Date.now(),
        txSignature,
        pricePaid: MINT_CONFIG.priceSol,
        simulated: false,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "On-chain mint failed";
    return { success: false, error: message };
  }
}