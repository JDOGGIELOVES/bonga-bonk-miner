import type { Metadata } from "next";
import { AboutHeader } from "@/components/about/about-header";
import { AboutContent } from "@/components/about/about-content";
import { AboutJsonLd } from "@/components/seo/site-json-ld";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About Bonga Bonk's Sister — Who Is Bonga on Solana?",
  description:
    "Meet Bonga Bonk's Sister — Bonk's Sister on Solana. Official $BONGA CA on the About page. Learn who Bonga is, how Bonga and Bonk connect, the NFT collection, Bonk Miner game, and Bonga Peace at bongabonks.com.",
  path: "/about",
  keywords: [
    "Bonga Bonk's Sister",
    "Bonga Bonks Sister",
    "Bonga",
    "Bonk",
    "Bonk's Sister",
    "Bonga Bonk",
    "who is Bonga",
    "Bonga Solana",
    "Bonga story",
    "Bonga Bonk Miner",
    "Bonga NFT",
    "$BONGA",
    "bongabonks",
    "Raise the Frequency",
    "Bonga community",
    "Bonga fam",
  ],
  imageAlt: "Bonga Bonk's Sister — official mascot",
});

export default function AboutPage() {
  return (
    <>
      <AboutJsonLd />
      <AboutHeader />
      <AboutContent />
    </>
  );
}