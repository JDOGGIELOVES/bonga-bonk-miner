import type { Metadata } from "next";
import { PeaceShell } from "@/components/peace/peace-shell";

export const metadata: Metadata = {
  title: "Bonga Peace | Mindfulness the Bonga Way",
  description:
    "Guided breathing, Bonk Break stress release, Tai Chi flows, and daily peace check-ins. Slow, playful mindfulness on bongabonks.com.",
  keywords: [
    "Bonga Peace",
    "mindfulness",
    "breathing",
    "Tai Chi",
    "Bonk Break",
    "bongabonks",
  ],
  openGraph: {
    title: "Bonga Peace — Mindfulness the Bonga Way",
    description:
      "Breathe, bonk, flow. Peaceful tools from Bonk's Sister — no clinical vibes, just good bonks.",
    type: "website",
  },
};

export default function PeacePage() {
  return <PeaceShell />;
}