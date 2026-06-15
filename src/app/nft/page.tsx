import type { Metadata } from "next";
import { NFTShell } from "@/components/nft/nft-shell";
import { NftJsonLd } from "@/components/seo/site-json-ld";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Bonga NFT Collection — Mint Bonk's Sister on Solana",
  description:
    "Mint Bonga NFTs on Solana. Stake to earn up to 3,500 $BONGA per day (Cosmic) — auto-deposited to your Bonga Bank Vault. 2,000 unique Bonk's Sister warriors. Join the fam.",
  path: "/nft",
  keywords: [
    "Bonga NFT",
    "Bonga NFT collection",
    "Bonk NFT",
    "Bonk's Sister NFT",
    "Bonga Solana NFT",
    "mint Bonga",
    "Solana NFT",
    "Bonga Bonk",
    "bongabonks NFT",
    "Bonga fam",
    "2,000 Bonga",
  ],
  imageAlt: "Bonga NFT Collection — Bonk's Sister on Solana",
});

export default function NFTPage() {
  return (
    <>
      <NftJsonLd />
      <NFTShell />
    </>
  );
}