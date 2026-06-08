"use client";

import { useEffect, useState } from "react";
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
import {
  fetchClaimStatus,
  requestOnChainClaim,
  type ClaimStatus,
} from "@/lib/claim-client";
import { Wallet, ExternalLink } from "lucide-react";

interface ClaimBongaProps {
  state: GameState;
  onStateChange: (state: GameState) => void;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function ClaimBonga({ state, onStateChange }: ClaimBongaProps) {
  const { connected, publicKey, signMessage, wallet: connectedWallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [claiming, setClaiming] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);

  const claimable = getClaimableBonga(state);
  const onChainEnabled = claimStatus?.enabled === true;

  useEffect(() => {
    let cancelled = false;

    void fetchClaimStatus().then((status) => {
      if (!cancelled) setClaimStatus(status);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClaim = async () => {
    if (!connected || !publicKey || claimable <= 0) return;

    setClaiming(true);
    setErrorMsg("");
    setExplorerUrl(null);

    try {
      const wallet = publicKey.toBase58();

      if (onChainEnabled) {
        const result = await requestOnChainClaim({
          wallet,
          amount: claimable,
          date: todayKey(),
          connectedWallet,
          signMessage,
        });

        const next = processClaim(state, wallet);
        onStateChange(next);
        gameAudio.playCoinCollect();
        setSuccessMsg(
          `Sent ${claimable} $BONGA on-chain! Tx: ${result.signature.slice(0, 8)}…`
        );
        setExplorerUrl(result.explorerUrl);
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        const next = processClaim(state, wallet);
        onStateChange(next);
        gameAudio.playCoinCollect();
        setSuccessMsg(
          `Claimed ${claimable} $BONGA (simulated). Enable on-chain claims in production.`
        );
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Claim failed.");
    } finally {
      setClaiming(false);
      setTimeout(() => {
        setSuccessMsg("");
        setExplorerUrl(null);
        setErrorMsg("");
      }, 8000);
    }
  };

  if (claimable <= 0 && !successMsg && !errorMsg) return null;

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
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-bonga-teal underline"
            >
              View on Solscan <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </motion.div>
      ) : errorMsg ? (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bonga-card border-red-300/40 bg-red-50/50 p-5 text-center dark:bg-red-950/20"
        >
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{errorMsg}</p>
        </motion.div>
      ) : (
        <motion.div
          key="claim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bonga-card p-5"
        >
          <Badge variant="default" className="mb-3">
            {claimStatus === null
              ? "Checking treasury..."
              : onChainEnabled
                ? "On-chain claim ready"
                : "Ready to claim"}
          </Badge>
          <p className="font-display text-xl font-bold tracking-tight">
            {claimable} $BONGA
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {connected
              ? claimStatus === null
                ? "Checking if on-chain claims are live..."
                : onChainEnabled
                  ? "Sign to receive real $BONGA from the treasury wallet."
                  : claimStatus.error
                    ? `On-chain claims unavailable: ${claimStatus.error}`
                    : "Treasury not configured — claims are simulated only."
              : "Connect your wallet to claim."}
          </p>

          {connected ? (
            <Button
              variant="peace"
              className="mt-4 w-full"
              onClick={() => void handleClaim()}
              disabled={claiming || claimStatus === null}
            >
              {claiming
                ? onChainEnabled
                  ? "Sending on-chain..."
                  : "Claiming..."
                : claimStatus === null
                  ? "Loading..."
                  : onChainEnabled
                    ? `Claim ${claimable} $BONGA On-Chain`
                    : `Claim Mined $BONGA`}
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