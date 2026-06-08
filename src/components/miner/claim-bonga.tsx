"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getClaimableBonga,
  processClaim,
  type GameState,
} from "@/lib/miner-game";
import { gameAudio } from "@/lib/audio/audio-manager";
import { Wallet } from "lucide-react";

interface ClaimBongaProps {
  state: GameState;
  onStateChange: (state: GameState) => void;
}

export function ClaimBonga({ state, onStateChange }: ClaimBongaProps) {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [claiming, setClaiming] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const claimable = getClaimableBonga(state);

  const handleClaim = async () => {
    if (!connected || !publicKey || claimable <= 0) return;

    setClaiming(true);
    await new Promise((r) => setTimeout(r, 1200));

    const next = processClaim(state, publicKey.toBase58());
    onStateChange(next);
    gameAudio.playCoinCollect();
    setSuccessMsg(
      `Claimed ${claimable} $BONGA successfully. On-chain rewards coming soon.`
    );
    setClaiming(false);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  if (claimable <= 0 && !successMsg) return null;

  return (
    <AnimatePresence mode="wait">
      {successMsg ? (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bonga-card border-bonga-teal/30 bg-bonga-teal/5 p-5 text-center"
        >
          <p className="text-sm font-medium text-bonga-teal">{successMsg}</p>
        </motion.div>
      ) : (
        <motion.div
          key="claim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bonga-card p-5"
        >
          <Badge variant="default" className="mb-3">
            Ready to claim
          </Badge>
          <p className="font-display text-xl font-bold tracking-tight">
            {claimable} $BONGA
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {connected
              ? "Your mined rewards are waiting."
              : "Connect your wallet to claim."}
          </p>

          {connected ? (
            <Button
              variant="peace"
              className="mt-4 w-full"
              onClick={() => void handleClaim()}
              disabled={claiming}
            >
              {claiming ? "Claiming..." : `Claim Mined $BONGA`}
            </Button>
          ) : (
            <Button
              variant="default"
              className="mt-4 w-full"
              onClick={() => setVisible(true)}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}