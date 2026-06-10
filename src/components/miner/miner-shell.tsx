"use client";

import { useState } from "react";
import { SolanaProvider } from "@/components/solana/solana-provider";
import { GameHub } from "@/components/miner/game-hub";
import { WelcomeToast } from "@/components/miner/welcome-toast";

export function MinerShell() {
  const [showWelcome, setShowWelcome] = useState(false);

  return (
    <SolanaProvider>
      <GameHub onWalletConnect={() => setShowWelcome(true)} />
      <WelcomeToast
        show={showWelcome}
        onDismiss={() => setShowWelcome(false)}
      />
    </SolanaProvider>
  );
}