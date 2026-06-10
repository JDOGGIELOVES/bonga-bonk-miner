"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchClaimStatus, type ClaimStatus } from "@/lib/claim-client";
import {
  fetchGardenEarnStatus,
  requestGardenOnChainClaim,
  type GardenEarnStatus,
} from "@/lib/garden-sync-client";
import { GARDEN_DAILY_EARN_CAP } from "@/lib/vibes-garden";
import { formatErrorMessage } from "@/lib/format-error";
import { gameAudio } from "@/lib/audio/audio-manager";
import { ExternalLink, Wallet } from "lucide-react";

interface GardenClaimBongaProps {
  refreshKey?: number;
  onClaimSuccess?: () => void;
}

export function GardenClaimBonga({ refreshKey = 0, onClaimSuccess }: GardenClaimBongaProps) {
  const { connected, publicKey, signMessage, wallet: connectedWallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);
  const [gardenStatus, setGardenStatus] = useState<GardenEarnStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const onChainEnabled = claimStatus?.enabled === true;
  const claimable = gardenStatus?.claimable ?? 0;
  const farmedToday = gardenStatus?.farmedToday ?? 0;

  useEffect(() => {
    let cancelled = false;
    void fetchClaimStatus().then((status) => {
      if (!cancelled) setClaimStatus(status);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!connected || !publicKey) {
      setGardenStatus(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void fetchGardenEarnStatus(publicKey.toBase58()).then((status) => {
      if (!cancelled) {
        setGardenStatus(status);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, refreshKey]);

  const handleClaim = async () => {
    if (!connected || !publicKey || claimable <= 0) return;

    setClaiming(true);
    setErrorMsg("");
    setExplorerUrl(null);

    try {
      const wallet = publicKey.toBase58();
      const claimAmount = Math.floor(claimable * 100) / 100;
      if (claimAmount <= 0) {
        setErrorMsg("No verified garden $BONGA ready to claim yet.");
        return;
      }

      const result = await requestGardenOnChainClaim({
        wallet,
        amount: claimAmount,
        connectedWallet,
        signMessage,
      });

      gameAudio.playCoinCollect();
      setSuccessMsg(`Sent ${result.amount} garden $BONGA on-chain! Tx: ${result.signature.slice(0, 8)}…`);
      setExplorerUrl(result.explorerUrl);
      setGardenStatus((prev) =>
        prev
          ? {
              ...prev,
              claimable: 0,
              claimed: prev.claimed + result.amount,
            }
          : prev
      );
      onClaimSuccess?.();
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Garden claim failed."));
    } finally {
      setClaiming(false);
      setTimeout(() => {
        setSuccessMsg("");
        setExplorerUrl(null);
        setErrorMsg("");
      }, 10_000);
    }
  };

  const waiting =
    connected && (loading || gardenStatus === null) && !successMsg && !errorMsg;

  const showPaused =
    connected &&
    gardenStatus &&
    gardenStatus.claimsPaused &&
    !successMsg &&
    !errorMsg;

  const showNotBootstrapped =
    connected &&
    gardenStatus &&
    !gardenStatus.bootstrapped &&
    !gardenStatus.claimsPaused &&
    !successMsg &&
    !errorMsg;

  const showReady =
    connected &&
    onChainEnabled &&
    gardenStatus &&
    !gardenStatus.claimsPaused &&
    gardenStatus.bootstrapped &&
    claimable > 0 &&
    !successMsg &&
    !errorMsg;

  const showZeroClaimable =
    connected &&
    onChainEnabled &&
    gardenStatus &&
    !gardenStatus.claimsPaused &&
    gardenStatus.bootstrapped &&
    claimable <= 0 &&
    !waiting &&
    !successMsg &&
    !errorMsg;

  const showConnectHint = !connected && !successMsg && !errorMsg;

  if (
    !successMsg &&
    !errorMsg &&
    !waiting &&
    !showPaused &&
    !showNotBootstrapped &&
    !showReady &&
    !showZeroClaimable &&
    !showConnectHint
  ) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {successMsg ? (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
          className="bonga-card border-red-300/40 bg-red-50/50 p-5 text-center dark:bg-red-950/20"
        >
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{errorMsg}</p>
        </motion.div>
      ) : waiting ? (
        <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bonga-card p-5">
          <p className="text-sm text-muted-foreground">Syncing verified garden earnings…</p>
        </motion.div>
      ) : showConnectHint ? (
        <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bonga-card p-5">
          <Badge variant="outline" className="mb-3">
            On-chain garden claims
          </Badge>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to sync today&apos;s garden progress and claim verified $BONGA from
            the treasury (up to {GARDEN_DAILY_EARN_CAP}/day).
          </p>
          <Button variant="default" className="mt-4 w-full" onClick={() => setVisible(true)}>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet to Claim
          </Button>
        </motion.div>
      ) : showPaused ? (
        <motion.div key="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bonga-card p-5">
          <p className="text-sm text-muted-foreground">
            Garden claims are paused. Keep growing — verified sync still tracks your progress.
          </p>
        </motion.div>
      ) : showNotBootstrapped ? (
        <motion.div key="bootstrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bonga-card p-5">
          <p className="text-sm text-muted-foreground">
            Linking your garden to this wallet… water a plant or wait a few seconds for idle sync.
          </p>
        </motion.div>
      ) : showZeroClaimable ? (
        <motion.div key="zero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bonga-card p-5">
          <Badge variant="outline" className="mb-3">
            Verified garden earnings
          </Badge>
          <p className="font-display text-lg font-bold">
            {farmedToday.toFixed(2)} / {GARDEN_DAILY_EARN_CAP} farmed today
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {gardenStatus?.claimed && gardenStatus.claimed > 0
              ? "Today\u2019s garden reward claimed. Come back tomorrow UTC."
              : "Keep growing — claims use server-verified idle + taps (local numbers are for play only)."}
          </p>
        </motion.div>
      ) : showReady ? (
        <motion.div key="claim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bonga-card p-5">
          <Badge variant="default" className="mb-3">
            Garden claim ready
          </Badge>
          <p className="font-display text-xl font-bold tracking-tight">{claimable} $BONGA</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign to receive verified garden $BONGA from the treasury. Only server-tracked progress
            counts toward payouts.
          </p>
          <Button
            variant="peace"
            className="mt-4 w-full"
            onClick={() => void handleClaim()}
            disabled={claiming || claimable <= 0}
          >
            {claiming ? "Sending on-chain…" : `Claim ${claimable} Garden $BONGA`}
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}