import type { Metadata } from "next";
import { StakingClient } from "./staking-client";

export const metadata: Metadata = {
  title: "Bonga NFT Staking — Lock Bonga NFTs to Earn $BONGA Rewards",
  description:
    "Stake & lock your Bonga NFTs to earn generous $BONGA (75 per NFT per day, prorated). High-yield passive rewards paid from the transparent community treasury. You keep full custody of your NFTs. Raise the frequency.",
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
