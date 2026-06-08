"use client";

import { SolanaProvider } from "@/components/solana/solana-provider";
import { NFTLanding } from "@/components/nft/nft-landing";

export function NFTShell() {
  return (
    <SolanaProvider>
      <NFTLanding />
    </SolanaProvider>
  );
}