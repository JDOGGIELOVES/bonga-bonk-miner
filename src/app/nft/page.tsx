import type { Metadata } from "next";
import { NFTShell } from "@/components/nft/nft-shell";

export const metadata: Metadata = {
  title: "Bonga NFT Collection | Mint on Solana",
  description:
    "8,888 unique Bonga Bonk's Sister NFTs. Hippie, cosmic, cyber vibes. Bonk Miner players get whitelist discounts. Mint on Solana.",
  openGraph: {
    title: "Bonga NFT Collection",
    description: "8,888 peaceful warriors on Solana. Mint yours. Join the fam.",
    type: "website",
  },
};

export default function NFTPage() {
  return <NFTShell />;
}