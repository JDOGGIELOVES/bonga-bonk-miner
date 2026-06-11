import type { Metadata } from "next";
import { SolanaProvider } from "@/components/solana/solana-provider";
import { StakingClient } from "./staking-client";

export const metadata: Metadata = {
  title: "Bonga NFT Staking — Lock Bonga NFTs to Earn $BONGA Rewards",
  description:
    "Stake & lock your Bonga NFTs by rarity to earn tiered $BONGA rewards (Common 100 / Rare 150 / Legendary 200 / Cosmic 350 per day, prorated) from the transparent community treasury. You keep full custody. Raise the frequency.",
  keywords: [
    "Bonga staking",
    "stake Bonga NFT",
    "Bonga NFT rewards",
    "lock Bonga",
    "Bonga Bonk staking",
    "earn $BONGA",
    "Solana NFT staking",
    "Bonga Bonk's Sister",
  ],
};

export default function StakingPage() {
  return (
    <SolanaProvider>
      <StakingClient />
    </SolanaProvider>
  );
}
