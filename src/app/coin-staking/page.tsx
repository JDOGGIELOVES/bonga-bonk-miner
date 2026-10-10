import type { Metadata } from "next";
import {
  COIN_STAKE_APR_HIGH,
  COIN_STAKE_APR_LOW,
  COIN_STAKE_TIER_MAX,
} from "@/lib/coin-stake";
import { CoinStakingClient } from "./coin-staking-client";

export const metadata: Metadata = {
  title: "Stake $BONGA — Monthly APR Coin Staking | Bonga Bonks",
  description: `Stake $BONGA for monthly rewards. Up to ${COIN_STAKE_TIER_MAX.toLocaleString()} earns ${(COIN_STAKE_APR_HIGH * 100).toFixed(0)}% APR; over ${COIN_STAKE_TIER_MAX.toLocaleString()} earns ${(COIN_STAKE_APR_LOW * 100).toFixed(0)}% APR. Paid at UTC month-end to Bonga Bank — unstake early and forfeit that month.`,
  keywords: [
    "stake BONGA",
    "BONGA staking",
    "BONGA APR",
    "Bonga coin stake",
    "Solana staking",
    "bongabonks",
  ],
};

export default function CoinStakingPage() {
  return <CoinStakingClient />;
}
