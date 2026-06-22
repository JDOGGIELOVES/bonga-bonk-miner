"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const SolanaProvider = dynamic(
  () =>
    import("@/components/solana/solana-provider").then((m) => m.SolanaProvider),
  {
    ssr: false,
    loading: () => null,
  },
);

export function SolanaProviderLoader({ children }: { children: ReactNode }) {
  return <SolanaProvider>{children}</SolanaProvider>;
}