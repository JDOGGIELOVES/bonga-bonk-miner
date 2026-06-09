import type { Metadata } from "next";
import { PeaceShell } from "@/components/peace/peace-shell";

export const metadata: Metadata = {
  title: "Bonga Peace | Mindfulness the Bonga Way",
  description:
    "Voice-guided stretching and exercises, breathing, Bonk Break, Tai Chi flows, and peace check-ins. Slow, playful mindfulness on bongabonks.com.",
  keywords: [
    "Bonga Peace",
    "mindfulness",
    "stretching",
    "breathing",
    "Tai Chi",
    "Bonk Break",
    "bongabonks",
  ],
  openGraph: {
    title: "Bonga Peace — Mindfulness the Bonga Way",
    description:
      "Stretch, breathe, bonk, flow. Peaceful tools from Bonk's Sister — no clinical vibes, just good bonks.",
    type: "website",
  },
};

export default function PeacePage() {
  return <PeaceShell />;
}