"use client";

import { useState } from "react";
import { SolanaProvider } from "@/components/solana/solana-provider";
import { BonkMinerGame } from "@/components/miner/bonk-miner-game";
import { WelcomeToast } from "@/components/miner/welcome-toast";

export function MinerShell() {
  const [showWelcome, setShowWelcome] = useState(false);

  return (
    <SolanaProvider>
      <BonkMinerGame onWalletConnect={() => setShowWelcome(true)} />
      <WelcomeToast
        show={showWelcome}
        onDismiss={() => setShowWelcome(false)}
      />
    </SolanaProvider>
  );
}