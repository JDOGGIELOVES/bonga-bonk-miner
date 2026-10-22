import type { Metadata } from "next";
import { STAKE_RATES } from "@/lib/nft-collection";
import { StakingClient } from "./staking-client";

const stakeRateBlurb = `Common ${STAKE_RATES.Common} / Rare ${STAKE_RATES.Rare} / Legendary ${STAKE_RATES.Legendary} / Cosmic ${STAKE_RATES["Cosmic Bonga"]} per day`;

export const metadata: Metadata = {
  title: "Bonga NFT Staking — Lock Bonga NFTs to Earn $BONGA Rewards",
  description: `Stake & lock your Bonga NFTs by rarity to earn tiered $BONGA rewards (${stakeRateBlurb}, prorated) from the transparent community treasury. Auto-deposits to Bonga Bank Vault. You keep full custody. Raise the frequency.`,
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
  return <StakingClient />;
}
