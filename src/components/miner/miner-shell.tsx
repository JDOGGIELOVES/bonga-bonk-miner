"use client";

import { useState } from "react";
import { GameHub } from "@/components/miner/game-hub";
import { WelcomeToast } from "@/components/miner/welcome-toast";

export function MinerShell() {
  const [showWelcome, setShowWelcome] = useState(false);

  return (
    <>
      <GameHub onWalletConnect={() => setShowWelcome(true)} />
      <WelcomeToast
        show={showWelcome}
        onDismiss={() => setShowWelcome(false)}
      />
    </>
  );
}