import type { Metadata } from "next";
import { PeaceShell } from "@/components/peace/peace-shell";
import { PeaceJsonLd } from "@/components/seo/site-json-ld";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Bonga Peace — Mindfulness & Bonk Breaks the Bonga Way",
  description:
    "Bonga Peace from Bonk's Sister — Pet Love daily rewards, guided breathing, transcendental meditation, stretching, Tai Chi, Bonk Break, affirmations, and check-ins. Mindfulness with good bonks at bongabonks.com.",
  path: "/peace",
  keywords: [
    "Bonga Peace",
    "Bonga Pet Love",
    "pet photo reward",
    "Bonga mindfulness",
    "transcendental meditation",
    "Bonga meditation",
    "mantra meditation",
    "Bonk break",
    "Bonga stretching",
    "Bonga Tai Chi",
    "Bonga affirmations",
    "Bonk stress relief",
    "Bonga breathing",
    "mindfulness Bonk",
    "bongabonks peace",
    "Raise the Frequency",
    "Bonga wellness",
  ],
  image: "/nft/traits/bonga-01-peaceful.png",
  imageAlt: "Peaceful Bonga — Bonga Peace mindfulness",
});

export default function PeacePage() {
  return (
    <>
      <PeaceJsonLd />
      <PeaceShell />
    </>
  );
}