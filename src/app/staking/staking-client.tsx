"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { BongaHeader } from "@/components/layout/bonga-header";
import { BongaFooter } from "@/components/layout/bonga-footer";
import { BongaWalletButton } from "@/components/miner/wallet-button";
import { BongaCaBanner } from "@/components/about/bonga-ca-banner";
import { Button } from "@/components/ui/button";
import { useBongaNftHolder } from "@/hooks/use-bonga-nft-holder";
import {
  fetchStakeStatus,
  requestStakeLock,
  requestStakeUnlock,
  requestStakeClaim,
  type StakeStatus,
} from "@/lib/claim-client";
import { Lock, Unlock, Coins, TrendingUp, Shield } from "lucide-react";

export function StakingClient() {
  const { publicKey, connected, wallet } = useWallet();
  const { count: heldFromHook, checking: holderChecking } = useBongaNftHolder();

  const [status, setStatus] = useState<StakeStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<null | "lock" | "unlock" | "claim">(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [stakeAmount, setStakeAmount] = useState<number>(1);

  const walletAddress = publicKey?.toBase58() ?? null;

  // Load stake status when wallet changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!walletAddress) {
        setStatus(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const s = await fetchStakeStatus(walletAddress);
        if (!cancelled) {
          setStatus(s);
          const avail = Math.max(0, (s.heldCount || 0) - (s.stakedCount || 0));
          setStakeAmount(avail > 0 ? Math.min(avail, s.stakedCount > 0 ? 1 : avail) : 1);
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load staking status.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  const stakedCount = status?.stakedCount ?? 0;
  const heldCount = status?.heldCount ?? heldFromHook ?? 0;
  const pending = status?.pendingBonga ?? 0;
  const dailyRate = status?.dailyRate ?? 0;
  const canClaim = status?.canClaim ?? false;
  const ratePerNft = status?.ratePerNft ?? 75;

  const availableToStake = Math.max(0, heldCount - stakedCount);

  const estimatedDaily = dailyRate;
  const projectedMonthly = Math.floor(estimatedDaily * 30);

  const canIncreaseStake = availableToStake > 0;
  const isStaked = stakedCount > 0;

  async function refreshStatus() {
    if (!walletAddress) return;
    try {
      const s = await fetchStakeStatus(walletAddress);
      setStatus(s);
    } catch {
      /* ignore */
    }
  }

  async function handleLock() {
    if (!walletAddress || !connected) return;
    setError(null);
    setSuccess(null);
    setActionLoading("lock");
    try {
      const at = new Date().toISOString();
      const countToLock = Math.max(1, Math.min(stakeAmount, availableToStake));
      await requestStakeLock({
        wallet: walletAddress,
        count: countToLock,
        at,
        connectedWallet: wallet ?? null,
      });
      setSuccess(`Locked ${countToLock} Bonga NFT(s) for staking. Enjoy the rewards!`);
      await refreshStatus();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Lock failed";
      setError(msg);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnlock() {
    if (!walletAddress || !connected || !isStaked) return;
    setError(null);
    setSuccess(null);
    setActionLoading("unlock");
    try {
      const at = new Date().toISOString();
      await requestStakeUnlock({
        wallet: walletAddress,
        at,
        connectedWallet: wallet ?? null,
      });
      setSuccess("Unstaked. Your NFTs are free — stake again anytime to keep earning.");
      await refreshStatus();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unlock failed";
      setError(msg);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleClaim() {
    if (!walletAddress || !connected || !canClaim) return;
    setError(null);
    setSuccess(null);
    setActionLoading("claim");
    try {
      const date = new Date().toISOString().slice(0, 10);
      const claimAmt = Math.max(status?.minClaim ?? 10, Math.floor(pending));
      const res = await requestStakeClaim({
        wallet: walletAddress,
        amount: claimAmt,
        date,
        connectedWallet: wallet ?? null,
      });
      setSuccess(`Claimed ${claimAmt} $BONGA from staking rewards! ${res.explorerUrl ? "View on Solscan." : ""}`);
      await refreshStatus();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Claim failed";
      setError(msg);
    } finally {
      setActionLoading(null);
    }
  }

  const lockDisabled = actionLoading !== null || !connected || availableToStake <= 0 || stakeAmount < 1;

  return (
    <>
      <BongaHeader />
      <div className="min-h-screen bg-bonga-page">
        <div className="mx-auto max-w-3xl px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-bonga-orange/30 bg-bonga-orange/5 px-4 py-1 text-xs font-semibold tracking-[0.12em] text-bonga-orange mb-4">
              NFT UTILITY • LIVE
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
              Stake Your <span className="text-gradient">Bonga NFTs</span>
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
              Lock them up. Earn a lot of $BONGA. High-yield passive rewards from the community treasury while you keep custody of your NFTs.
            </p>
            <div className="mt-3 text-sm text-bonga-teal">
              {ratePerNft} $BONGA per NFT per day • Prorated • Claim anytime (min {status?.minClaim ?? 10})
            </div>
          </div>

          <BongaCaBanner />

          {/* Wallet / Connect */}
          <div className="mt-8 bonga-card p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Connected Wallet</p>
                <p className="font-mono text-sm mt-1 break-all">
                  {walletAddress ? walletAddress : "Not connected"}
                </p>
              </div>
              <BongaWalletButton />
            </div>
            {!connected && (
              <p className="mt-4 text-sm text-muted-foreground">
                Connect your Solana wallet that holds Bonga NFTs to stake and claim rewards.
              </p>
            )}
          </div>

          {/* Main staking panel */}
          <div className="mt-6 bonga-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-6 w-6 text-bonga-orange" />
              <h2 className="font-display text-2xl font-bold">Your Staking Position</h2>
            </div>

            {!connected ? (
              <div className="text-center py-10 text-muted-foreground">
                Connect a wallet holding Bonga NFTs to begin.
              </div>
            ) : loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading your stake status…</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-muted/40 p-5">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Held (verified)</div>
                    <div className="mt-2 font-display text-4xl font-extrabold">{heldCount}</div>
                    <div className="text-xs text-muted-foreground mt-1">Bonga NFTs in this wallet</div>
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-5">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Currently Staked</div>
                    <div className="mt-2 font-display text-4xl font-extrabold text-bonga-orange">{stakedCount}</div>
                    <div className="text-xs text-muted-foreground mt-1">Locked for rewards</div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-bonga-orange/10 to-transparent p-5">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Daily Rate</div>
                    <div className="mt-2 font-display text-4xl font-extrabold">{estimatedDaily.toLocaleString()}</div>
                    <div className="text-xs text-bonga-teal mt-1">$BONGA / day while staked</div>
                  </div>
                </div>

                {/* Pending rewards */}
                <div className="mt-6 rounded-2xl border border-bonga-teal/30 bg-bonga-teal/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Coins className="h-4 w-4 text-bonga-teal" /> Unclaimed Staking Rewards
                      </div>
                      <div className="font-display text-5xl font-extrabold tracking-tighter mt-1 text-bonga-teal">
                        {pending.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">prorated $BONGA</div>
                    </div>
                    <Button
                      onClick={handleClaim}
                      disabled={!canClaim || actionLoading !== null}
                      className="bg-bonga-teal text-white hover:bg-bonga-teal/90 px-6"
                    >
                      {actionLoading === "claim" ? "Claiming..." : canClaim ? `Claim ${Math.floor(pending)} $BONGA` : "Not enough yet"}
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Rewards accrue the longer you keep your NFTs locked. Claim in chunks of {status?.minClaim ?? 10}+ to keep fees low.
                  </p>
                </div>

                {/* Stake controls */}
                <div className="mt-8">
                  <p className="font-semibold mb-2">Stake / Increase Lock</p>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground">How many to lock (you keep the NFTs)</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, availableToStake)}
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(Math.max(1, Math.min(availableToStake, parseInt(e.target.value || "1", 10))))}
                          className="w-28 rounded-xl border border-border bg-background px-4 py-2 text-lg font-mono"
                          disabled={!canIncreaseStake}
                        />
                        <span className="text-sm text-muted-foreground">of {availableToStake} available</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleLock}
                      disabled={lockDisabled}
                      className="bg-bonga-orange text-white hover:bg-bonga-orange/90 px-8"
                    >
                      {actionLoading === "lock" ? "Locking..." : "Lock & Stake"}
                    </Button>
                    <Button
                      onClick={handleUnlock}
                      disabled={!isStaked || actionLoading !== null}
                      variant="outline"
                      className="border-bonga-orange/40 hover:bg-bonga-orange/5"
                    >
                      <Unlock className="mr-2 h-4 w-4" /> Unstake All
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Staking is a virtual lock tracked with your signature. You always retain full on-chain ownership of the NFTs.
                  </p>
                </div>

                {/* Status messages */}
                <AnimatePresence>
                  {(error || success) && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-6 rounded-xl p-4 text-sm ${error ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}
                    >
                      {error || success}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* How it works + benefits */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="bonga-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-bonga-orange" />
                <h3 className="font-display font-bold text-lg">How Staking Works</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Connect wallet holding Bonga NFTs</li>
                <li>• Choose how many to stake and sign the lock message</li>
                <li>• Earn ~{ratePerNft} $BONGA per NFT per day (prorated)</li>
                <li>• Claim rewards anytime (min {status?.minClaim ?? 10}) — paid from treasury</li>
                <li>• Unstake with a signature whenever you want</li>
                <li>• Your NFTs never leave your wallet</li>
              </ul>
            </div>

            <div className="bonga-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-bonga-teal" />
                <h3 className="font-display font-bold text-lg">Why Lock Them Up?</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Dedicated stakers get outsized rewards because they commit their precious Bonga pieces to the ecosystem long-term.
                All payouts are transparent on-chain from the community treasury (funded by 7% royalties + love).
              </p>
              <p className="mt-3 text-xs text-bonga-teal">
                Projected monthly on a single staked NFT: ~{Math.floor(ratePerNft * 30)} $BONGA
              </p>
              <div className="mt-4 text-xs">
                <Link href="/treasury" className="text-bonga-teal hover:underline">
                  View Treasury transparency &amp; recent payouts →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            Rewards are subject to treasury balance and claim rules. High-velocity abuse will be auto-flagged and blocked (same system as game claims).
            Staking boosts are in addition to normal NFT holder game multipliers.
          </div>

          <div className="mt-12">
            <BongaCaBanner />
          </div>
        </div>
      </div>
      <BongaFooter />
    </>
  );
}
