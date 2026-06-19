"use client";

import { useEffect, useState, useRef } from "react";
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
  fetchGlobalClaimTally,
  requestStakeLock,
  requestStakeUnlock,
  depositPendingToBank,
  type StakeStatus,
} from "@/lib/claim-client";
import { STAKE_RATES } from "@/lib/nft-collection";
import type { RarityTier } from "@/lib/nft-collection";
import { Lock, Unlock, Coins, TrendingUp, Shield } from "lucide-react";

export function StakingClient() {
  const { publicKey, connected, wallet } = useWallet();
  const { count: heldFromHook, checking: holderChecking } = useBongaNftHolder();

  const [status, setStatus] = useState<StakeStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<null | "lock" | "unlock" | "claim">(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Per-tier target staked amounts (user editable targets)
  const [tierTargets, setTierTargets] = useState<Record<string, number>>({
    Common: 0,
    Rare: 0,
    Legendary: 0,
    "Cosmic Bonga": 0,
  });

  const [globalStakeTally, setGlobalStakeTally] = useState<{ bonga: number; claims: number } | null>(null);

  const walletAddress = publicKey?.toBase58() ?? null;

  const lastAutoClaimRef = useRef(0);

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
          // Initialize targets to current staked per tier
          const currentStaked = s.stakedByRarity || {};
          setTierTargets({
            Common: currentStaked.Common || 0,
            Rare: currentStaked.Rare || 0,
            Legendary: currentStaked.Legendary || 0,
            "Cosmic Bonga": currentStaked["Cosmic Bonga"] || 0,
          });
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

  // Load global staking community tally (running total of bonga claimed via staking)
  const loadGlobalStakeTally = () => {
    fetchGlobalClaimTally().then((t) => {
      setGlobalStakeTally(t.stake);
    }).catch(() => {
      // ignore, will show —
    });
  };

  useEffect(() => {
    loadGlobalStakeTally();
    const id = setInterval(loadGlobalStakeTally, 60000);
    return () => clearInterval(id);
  }, []);

  // Auto-deposit staking rewards to Bonga Bank Vault (no manual "claim" button, fully silent)
  // When pending >= min, automatically move to your personal vault (matches miner/garden behavior).
  // No signature prompt — uses the same deposit path as other games.
  useEffect(() => {
    const currentPending = status?.pendingBonga ?? 0;
    const min = status?.minClaim ?? 10;
    if (
      !walletAddress ||
      !connected ||
      !status?.canClaim ||
      currentPending < min ||
      actionLoading !== null
    ) {
      return;
    }
    const now = Date.now();
    if (now - lastAutoClaimRef.current < 15000) return; // debounce
    lastAutoClaimRef.current = now;

    setActionLoading("claim");
    depositPendingToBank({ wallet: walletAddress, source: "stake" })
      .then((res) => {
        if (res.ok) {
          const deposited = res.totalDeposited ?? currentPending;
          setSuccess(`Staking rewards auto-deposited ${deposited} $BONGA to your Bonga Bank Vault!`);
        }
        return refreshStatus();
      })
      .catch((e: any) => {
        setError(e?.message || "Auto deposit to bank failed");
      })
      .finally(() => setActionLoading(null));
  }, [walletAddress, connected, status?.pendingBonga, status?.canClaim, status?.minClaim, actionLoading]);

  const stakedCount = status?.stakedCount ?? 0;
  const heldCount = status?.heldCount ?? heldFromHook ?? 0;
  const pending = status?.pendingBonga ?? 0;
  const dailyRate = status?.dailyRate ?? 0;
  const canClaim = status?.canClaim ?? false;
  const totalClaimed = status?.totalClaimed ?? 0;

  const heldByRarity = status?.heldByRarity || {};
  const stakedByRarity = status?.stakedByRarity || {};

  const estimatedDaily = dailyRate;
  const projectedMonthly = Math.floor(estimatedDaily * 30);

  const isStaked = stakedCount > 0;

  // Current targets from state (clamped to held)
  const currentTargets = {
    Common: Math.min(tierTargets.Common || 0, heldByRarity.Common || 0),
    Rare: Math.min(tierTargets.Rare || 0, heldByRarity.Rare || 0),
    Legendary: Math.min(tierTargets.Legendary || 0, heldByRarity.Legendary || 0),
    "Cosmic Bonga": Math.min(tierTargets["Cosmic Bonga"] || 0, heldByRarity["Cosmic Bonga"] || 0),
  };

  const targetTotalStaked = Object.values(currentTargets).reduce((s, v) => s + v, 0);

  async function refreshStatus() {
    if (!walletAddress) return;
    try {
      const s = await fetchStakeStatus(walletAddress);
      setStatus(s);
    } catch {
      /* ignore */
    }
  }

  async function handleUpdateStake() {
    if (!walletAddress || !connected) return;
    setError(null);
    setSuccess(null);
    setActionLoading("lock");
    try {
      const at = new Date().toISOString();
      // Send the target staked per tier (absolute desired)
      const tiers = {
        Common: currentTargets.Common,
        Rare: currentTargets.Rare,
        Legendary: currentTargets.Legendary,
        "Cosmic Bonga": currentTargets["Cosmic Bonga"],
      };
      await requestStakeLock({
        wallet: walletAddress,
        tiers,
        at,
        connectedWallet: wallet ?? null,
      });
      const total = Object.values(tiers).reduce((s, v) => s + v, 0);
      setSuccess(`Stake position updated to ${total} Bonga NFT(s) (tiered rates applied).`);
      await refreshStatus();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Stake update failed";
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

  const hasChanges = JSON.stringify(currentTargets) !== JSON.stringify(stakedByRarity);
  const updateDisabled = actionLoading !== null || !connected || !hasChanges;

  return (
    <>
      <BongaHeader />
      <div className="min-h-screen bg-bonga-page">
        <div className="mx-auto max-w-3xl px-[30px] py-12">
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
              Tiered rewards: Common 1000 • Rare 1500 • Legendary 2000 • Cosmic 3500 $BONGA per day • Prorated • All earnings auto-deposited to Bonga Bank Vault. No vault minimum for on-chain (up to 20,001 $BONGA daily per wallet).
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Community has claimed <span className="font-medium text-foreground">{globalStakeTally ? globalStakeTally.bonga.toLocaleString() : '—'} $BONGA</span> from NFT staking across {globalStakeTally ? globalStakeTally.claims.toLocaleString() : '—'} claims.
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
                Connect your Solana wallet that holds Bonga NFTs to stake — rewards automatically deposit to your Bonga Bank Vault.
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

                {/* Pending rewards - auto to vault */}
                <div className="mt-6 rounded-2xl border border-bonga-teal/30 bg-bonga-teal/5 p-5">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Coins className="h-4 w-4 text-bonga-teal" /> Staking Rewards (auto-deposited to Bonga Bank Vault)
                    </div>
                    <div className="font-display text-5xl font-extrabold tracking-tighter mt-1 text-bonga-teal">
                      {pending.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">prorated $BONGA — current accrual since last deposit (min {status?.minClaim ?? 10} to auto-deposit to vault)</div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-bonga-teal">
                    Total staking rewards deposited to your Bonga Bank Vault: {totalClaimed.toLocaleString()} $BONGA
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Rewards automatically (and silently) deposit to your Bonga Bank Vault when they reach the minimum — the "pending" number above resets on each deposit because it is the current accrual timer. Your cumulative total from staking is shown above and also visible in the Bonga Bank (main balance + recent deposits).
                  </p>
                  {pending > 0 && (
                    <button
                      onClick={async () => {
                        if (!walletAddress) return;
                        setActionLoading("claim");
                        setError(null);
                        try {
                          const res = await depositPendingToBank({ wallet: walletAddress, source: "stake" });
                          if (res.ok) {
                            setSuccess(`Deposited ${res.totalDeposited ?? pending} $BONGA to Bonga Bank Vault.`);
                          }
                          await refreshStatus();
                        } catch (e: any) {
                          setError(e?.message || "Sync to bank failed");
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                      disabled={actionLoading !== null}
                      className="mt-3 text-xs underline text-bonga-teal hover:text-bonga-teal/80 disabled:opacity-50"
                    >
                      Deposit pending rewards to Bonga Bank now →
                    </button>
                  )}
                </div>

                {/* Community Staking Tally - running total of bonga claimed via staking */}
                <div className="mt-4 rounded-2xl bg-muted/30 p-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Community Staking Rewards Paid Out</p>
                  <p className="mt-1 font-display text-2xl font-bold text-bonga-orange">
                    {globalStakeTally ? globalStakeTally.bonga.toLocaleString() : '—'} $BONGA
                  </p>
                  <p className="text-xs text-muted-foreground">
                    across {globalStakeTally ? globalStakeTally.claims.toLocaleString() : '—'} claims
                  </p>
                </div>

                {/* Per-tier stake controls */}
                <div className="mt-8">
                  <p className="font-semibold mb-3">Set your staked amounts per rarity (targets)</p>

                  <div className="space-y-3">
                    {(["Common", "Rare", "Legendary", "Cosmic Bonga"] as const).map((tier) => {
                      const held = heldByRarity[tier] || 0;
                      const currentlyStaked = stakedByRarity[tier] || 0;
                      const target = tierTargets[tier] || 0;
                      return (
                        <div key={tier} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-muted/30 p-3">
                          <div className="w-40 text-sm font-medium">
                            {tier}
                            <span className="ml-2 text-[10px] text-muted-foreground">({(STAKE_RATES as any)[tier] || 0}/day)</span>
                          </div>
                          <div className="flex-1 text-xs text-muted-foreground">
                            Held: <span className="font-mono text-foreground">{held}</span> · Currently staked: <span className="font-mono text-foreground">{currentlyStaked}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Target staked:</span>
                            <input
                              type="number"
                              min={0}
                              max={held}
                              value={target}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(held, parseInt(e.target.value || "0", 10)));
                                setTierTargets((prev) => ({ ...prev, [tier]: val }));
                              }}
                              className="w-20 rounded-lg border border-border bg-background px-3 py-1 text-sm font-mono"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      onClick={handleUpdateStake}
                      disabled={updateDisabled}
                      className="bg-bonga-orange text-white hover:bg-bonga-orange/90 px-8"
                    >
                      {actionLoading === "lock" ? "Updating..." : "Update Stake Targets"}
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
                    Set the exact number you want staked of each rarity. Signature proves the request. You keep custody of the NFTs at all times.
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
                <li>• Choose how many to stake and sign the lock message (to update your position)</li>
                <li>• Earn tiered $BONGA per day (Common 1000 / Rare 1500 / Legendary 2000 / Cosmic 3500) prorated — all auto-deposited to Bonga Bank Vault</li>
                <li>• Rewards auto-deposit silently to vault when pending reaches min (no signature, no manual claim button)</li>
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
                Example: 1 Cosmic = 3500/day (~105,000/month). All staking $BONGA auto-deposits directly to your Bonga Bank Vault. On-chain withdrawals up to 20,001 $BONGA daily (no vault minimum). Rates are higher for rarer pieces.
              </p>
              <div className="mt-4 text-xs">
                <Link href="/treasury" className="text-bonga-teal hover:underline">
                  View Treasury transparency &amp; recent payouts →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            Staking rewards automatically (and silently) deposit to your Bonga Bank Vault when they reach the minimum — no signature prompts or manual claim button. Visit Bonga Bank to see the updated balance. High-velocity abuse will be auto-flagged and blocked.
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
