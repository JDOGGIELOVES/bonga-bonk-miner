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
  DAILY_BONGA_LIMIT,
  BONGA_CLAIM_BATCH,
  type GameState,
} from "@/lib/miner-game";
import { gameAudio } from "@/lib/audio/audio-manager";
import {
  fetchClaimStatus,
  requestOnChainClaim,
  depositPendingToBank,
  type ClaimStatus,
} from "@/lib/claim-client";
import { fetchMinerEarned, type MinerEarnedStatus } from "@/lib/miner-tap-client";
import { TAPS_PER_BONGA } from "@/lib/miner-game";
import { Wallet, ExternalLink } from "lucide-react";

interface ClaimBongaProps {
  state: GameState;
  onStateChange: (state: GameState) => void;
  onClaimSuccess?: () => void;
  onChainEnabled?: boolean;
  serverEarnRefreshKey?: number;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function ClaimBonga({
  state,
  onStateChange,
  onClaimSuccess,
  onChainEnabled: onChainEnabledProp,
  serverEarnRefreshKey = 0,
}: ClaimBongaProps) {
  const { connected, publicKey, signMessage, wallet: connectedWallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [claiming, setClaiming] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);
  const [serverEarned, setServerEarned] = useState<MinerEarnedStatus | null>(null);
  const [serverEarnedLoading, setServerEarnedLoading] = useState(false);

  const onChainEnabled =
    onChainEnabledProp ?? claimStatus?.enabled === true;
  const localClaimable = getClaimableBonga(state);
  const serverClaimable =
    onChainEnabled && connected ? (serverEarned?.claimable ?? null) : null;
  const claimable =
    onChainEnabled && serverClaimable !== null ? serverClaimable : localClaimable;

  // For on-chain, claim in batches (now 5 for easier testing). For local/sim, allow any positive amount.
  const isOnChain = onChainEnabled && connected;
  const claimBatchAmount = isOnChain
    ? Math.max(0, Math.floor(claimable / BONGA_CLAIM_BATCH) * BONGA_CLAIM_BATCH)
    : Math.max(0, Math.floor(claimable));  // easier: claim everything possible locally/sim


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
    if (!onChainEnabled || !publicKey) {
      setServerEarned(null);
      setServerEarnedLoading(false);
      return;
    }

    let cancelled = false;
    setServerEarnedLoading(true);
    void fetchMinerEarned(publicKey.toBase58()).then((earned) => {
      if (!cancelled) {
        setServerEarned(earned);
        setServerEarnedLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [onChainEnabled, publicKey, serverEarnRefreshKey]);

  const handleClaim = async () => {
    if (!connected || !publicKey || claimBatchAmount <= 0) return;

    setClaiming(true);
    setErrorMsg("");
    setExplorerUrl(null);

    try {
      const wallet = publicKey.toBase58();

      // For the tap miner game: daily mined Bonga (max 1000) goes right into the BONGA BANK
      // Use the bank deposit (no signature needed for verified miner earnings; server uses the earn record)
      const amountToDeposit = Math.max(0, serverEarned?.claimable ?? claimable);
      if (amountToDeposit <= 0) return;

      const depositRes = await depositPendingToBank({
        wallet,
        source: "miner",
      });

      const next = processClaim(state, wallet, amountToDeposit);
      onStateChange(next);
      setServerEarned((prev) =>
        prev
          ? {
              ...prev,
              claimed: prev.claimed + amountToDeposit,
              claimable: Math.max(0, (prev.claimable ?? 0) - amountToDeposit),
            }
          : prev
      );
      gameAudio.playCoinCollect();

      if (depositRes.ok) {
        setSuccessMsg(
          `Deposited ${amountToDeposit} $BONGA directly into your Bonga Bank! (Total banked now: ${depositRes.newBankBalance ?? "?"} )`
        );
      } else {
        setSuccessMsg(`Mined ${amountToDeposit} $BONGA recorded for bank deposit.`);
      }
      onClaimSuccess?.();

      // Note: $BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches 10,000 $BONGA. On-chain withdrawal from bank is done via the Bonga Bank page.
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Deposit to Bank failed.");
    } finally {
      setClaiming(false);
      setTimeout(() => {
        setSuccessMsg("");
        setExplorerUrl(null);
        setErrorMsg("");
      }, 8000);
    }
  };

  const waitingForServer =
    onChainEnabled &&
    connected &&
    (serverEarnedLoading || serverEarned === null) &&
    !successMsg &&
    !errorMsg;

  const showOnChainStatus =
    onChainEnabled &&
    connected &&
    !waitingForServer &&
    claimBatchAmount <= 0 &&
    !successMsg &&
    !errorMsg;

  const tapsToNextBonga =
    serverEarned && serverEarned.taps % TAPS_PER_BONGA !== 0
      ? TAPS_PER_BONGA - (serverEarned.taps % TAPS_PER_BONGA)
      : serverEarned && serverEarned.earned < serverEarned.claimed + 1
        ? TAPS_PER_BONGA
        : 0;

  const hideClaimCard =
    !successMsg &&
    !errorMsg &&
    !waitingForServer &&
    !showOnChainStatus &&
    claimBatchAmount <= 0 &&
    !(onChainEnabled && !connected && localClaimable > 0);

  if (hideClaimCard) return null;

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
      ) : showOnChainStatus ? (
        <motion.div
          key="onchain-status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bonga-card border-amber-300/40 bg-amber-50/50 p-5 dark:bg-amber-950/20"
        >
          <Badge variant="default" className="mb-3">
            Bonga Bank deposits live
          </Badge>
          <p className="font-display text-lg font-bold tracking-tight">
            {serverEarned && serverEarned.claimed > 0
              ? "Today\u2019s mined $BONGA deposited to Bank"
              : "Keep bonking to mine more for the Bank"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {serverEarned && serverEarned.claimed > 0
              ? "Today\u2019s verified taps have been deposited to your Bonga Bank. Come back tomorrow UTC for more."
              : localClaimable > 0
                ? "Local progress doesn\u2019t count. With your wallet connected, keep tapping — 1 tap = 1 $BONGA mined directly into your Bonga Bank (up to 1000/day)."
                : `With your wallet connected, tap to mine. 1 tap = 1 $BONGA mined (up to ${DAILY_BONGA_LIMIT}/day) — goes directly into your Bonga Bank. $BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches 10,000 $BONGA.`}
          </p>
          {serverEarned && (
            <p className="mt-2 text-xs text-muted-foreground">
              Verified today: {serverEarned.taps} bonks
              {serverEarned.earned > 0 ? ` · ${serverEarned.earned} $BONGA earned` : ""}
              {tapsToNextBonga > 0 ? ` · ${tapsToNextBonga} bonks until next $BONGA` : ""}
            </p>
          )}

          {serverEarned?.dailyLimitReached && serverEarned.nextDailyReset && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <p className="font-medium">
                {serverEarned.limitMessage || `Daily limit reached of ${DAILY_BONGA_LIMIT} Bonga. Come back tomorrow to mine more $Bonga!`}
              </p>
              <p className="text-xs mt-1 text-amber-600">
                The daily timer resets at{" "}
                {new Date(serverEarned.nextDailyReset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} UTC tomorrow.
              </p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="claim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bonga-card p-5"
        >
          <Badge variant="default" className="mb-3">
            {claimStatus === null || waitingForServer
              ? "Checking treasury..."
              : onChainEnabled
                ? "On-chain claim ready"
                : "Ready to claim"}
          </Badge>
          <p className="font-display text-xl font-bold tracking-tight">
            {waitingForServer ? "…" : `${claimable} $BONGA`}
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
              disabled={
                claiming ||
                claimStatus === null ||
                waitingForServer ||
                claimBatchAmount <= 0
              }
            >
              {claiming
                ? "Depositing to Bonga Bank..."
                : claimStatus === null
                  ? "Loading..."
                  : `Deposit ${claimBatchAmount || claimable} $BONGA to Bank`}
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