"use client";

import { PeaceLanding } from "@/components/peace/peace-landing";
import { SolanaProvider } from "@/components/solana/solana-provider";

export function PeaceShell() {
  return (
    <SolanaProvider>
      <PeaceLanding />
    </SolanaProvider>
  );
}