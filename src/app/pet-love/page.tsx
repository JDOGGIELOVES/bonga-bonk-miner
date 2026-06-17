import type { Metadata } from "next";
import { PetLoveShell } from "@/components/pet-love/pet-love-shell";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Bonga Pet Love — Share Pet Photos, Earn $BONGA Daily",
  description:
    "Bonga Pet Love — upload a hand-petting pet photo, stay anonymous, join the community gallery, and earn 1000 $BONGA per validated image (auto to Bonga Bank Vault). On-device verification at bongabonks.com. Images must have creation date after 2026-04-01.",
  path: "/pet-love",
  keywords: [
    "Bonga Pet Love",
    "pet photo reward",
    "Bonga",
    "Bonk",
    "$BONGA",
    "Solana meme coin",
    "pet community",
    "bongabonks",
    "Raise the Frequency",
  ],
  image: "/bonga-character.png",
  imageAlt: "Bonga Pet Love — hand petting pets for daily rewards",
});

export default function PetLovePage() {
  return <PetLoveShell />;
}