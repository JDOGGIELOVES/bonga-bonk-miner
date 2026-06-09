"use client";

import { PetLoveLanding } from "@/components/pet-love/pet-love-landing";
import { SolanaProvider } from "@/components/solana/solana-provider";

export function PetLoveShell() {
  return (
    <SolanaProvider>
      <PetLoveLanding />
    </SolanaProvider>
  );
}