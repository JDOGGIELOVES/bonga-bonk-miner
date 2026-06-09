import type { Metadata } from "next";
import { NFTShell } from "@/components/nft/nft-shell";
import { NftJsonLd } from "@/components/seo/site-json-ld";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Bonga NFT Collection — Mint Bonk's Sister on Solana",
  description:
    "Mint Bonga NFTs on Solana — 8,888 unique Bonk's Sister warriors with hippie, cosmic, and bonk vibes. Bonk Miner players get whitelist discounts. Join the Bonga fam.",
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
    "Bonk Miner whitelist",
    "bongabonks NFT",
    "Bonga fam",
    "8,888 Bonga",
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