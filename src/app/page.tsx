import type { Metadata } from "next";
import { MinerShell } from "@/components/miner/miner-shell";
import { HomeSeoContent } from "@/components/seo/home-seo-content";
import { HomeJsonLd } from "@/components/seo/site-json-ld";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Bonga Bonk Miner — Bonk's Sister, Mine $BONGA on Solana",
  description:
    "Play Bonga Bonk Miner — Bonk's Sister tap game on Solana. Bonk meme coins, mine $BONGA, climb the leaderboard, and unlock Bonga NFT whitelist perks. Free at bongabonks.com.",
  path: "/",
  keywords: [
    "Bonga",
    "Bonk",
    "Bonga Bonk",
    "Bonk's Sister",
    "Bonk Miner",
    "Bonga Bonk Miner",
    "Bonga Solana",
    "Bonga game",
    "mine BONGA",
    "$BONGA",
    "Solana meme coin",
    "bongabonks",
    "Raise the Frequency",
    "Bonga NFT",
  ],
  imageAlt: "Bonga Bonk Miner — Bonk's Sister mascot",
});

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <HomeSeoContent />
      <MinerShell />
    </>
  );
}