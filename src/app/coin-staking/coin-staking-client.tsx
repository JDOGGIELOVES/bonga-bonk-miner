"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Coins, Clock, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { BongaHeader } from "@/components/layout/bonga-header";
import { BongaFooter } from "@/components/layout/bonga-footer";
import { BongaWalletButton } from "@/components/miner/wallet-button";
import { BongaCaBanner } from "@/components/about/bonga-ca-banner";
import {
  fetchCoinStakeStatus,
  requestCoinStakeLock,
  requestCoinStakeUnlock,
  type CoinStakeStatus,
} from "@/lib/claim-client";
import {
  COIN_STAKE_APR_HIGH,
  COIN_STAKE_APR_LOW,
  COIN_STAKE_TIER_MAX,
  coinStakeApr,
  monthlyRewardForStake,
  aprPercentLabel,
} from "@/lib/coin-stake";

function formatMs(ms: number): string {
  if (ms <= 0) return "ending…";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function CoinStakingClient() {
  const { publicKey, connected, wallet, signMessage } = useWallet();
  const walletAddress = publicKey?.toBase58() || "";
  const [status, setStatus] = useState<CoinStakeStatus | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const refresh = useCallback(async () => {
    if (!walletAddress || !connected) {
      setStatus(null);
      return;
    }
    try {
      const s = await fetchCoinStakeStatus(walletAddress, {
        connectedWallet: wallet,
        signMessage: signMessage || undefined,
        // Coin Stake page never visited Miner → create session here (one sign)
        ensureSession: true,
      });
      setStatus(s);
      if (s.settleNote) setSuccess(s.settleNote);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    }
  }, [walletAddress, connected, wallet, signMessage]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const previewAmount = useMemo(() => {
    const n = Number(amountInput);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amountInput]);

  const previewApr = coinStakeApr(previewAmount || status?.stakedAmount || 0);
  const previewMonthly = monthlyRewardForStake(
    previewAmount || status?.stakedAmount || 0
  );

  const msLeft = status?.cycle
    ? Math.max(0, new Date(status.cycle.endsAtIso).getTime() - now)
    : 0;

  const onStake = async () => {
    if (!walletAddress || !connected) return;
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid $BONGA amount to stake.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await requestCoinStakeLock({
        wallet: walletAddress,
        amount,
        connectedWallet: wallet,
        signMessage: signMessage || undefined,
      });
      setSuccess(
        res.note ||
          `Staked ${res.stakedAmount.toLocaleString()} $BONGA at ${res.aprLabel} APR (~${res.monthlyPreview.toLocaleString()}/mo if held through month-end).`
      );
      setAmountInput("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stake failed");
    } finally {
      setLoading(false);
    }
  };

  const onUnstake = async () => {
    if (!walletAddress || !connected) return;
    if (
      !window.confirm(
        "Unstake now? You will forfeit this UTC month's rewards. Prior settled months stay in Bonga Bank."
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await requestCoinStakeUnlock({
        wallet: walletAddress,
        connectedWallet: wallet,
        signMessage: signMessage || undefined,
      });
      setSuccess(res.note || "Unstaked.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unstake failed");
    } finally {
      setLoading(false);
    }
  };

  const maxStake = () => {
    if (status?.walletBalance != null) {
      setAmountInput(String(Math.floor(status.walletBalance * 1000) / 1000));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BongaHeader />
      <main className="flex-1 px-[30px] py-10">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-bonga-teal/30 bg-bonga-teal/5 px-4 py-1 text-xs font-semibold tracking-[0.12em] text-bonga-teal mb-4">
              $BONGA COIN STAKE • MONTHLY CYCLES
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
              Stake <span className="text-gradient">$BONGA</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Soft-lock your coins (they stay in your wallet). ≤
              {COIN_STAKE_TIER_MAX.toLocaleString()} →{" "}
              {(COIN_STAKE_APR_HIGH * 100).toFixed(0)}% APR. Over{" "}
              {COIN_STAKE_TIER_MAX.toLocaleString()} →{" "}
              {(COIN_STAKE_APR_LOW * 100).toFixed(0)}% APR on the whole stake.
              Rewards pay <strong>once per UTC month</strong> into Bonga Bank —
              not daily. Stay staked through month-end to earn; unstake early
              forfeits that month.
            </p>
          </div>

          <BongaCaBanner />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="bonga-card p-5 text-center">
              <TrendingUp className="mx-auto h-5 w-5 text-bonga-orange mb-2" />
              <div className="text-xs text-muted-foreground">≤1M APR</div>
              <div className="font-display text-3xl font-bold text-bonga-orange">
                25%
              </div>
            </div>
            <div className="bonga-card p-5 text-center">
              <Shield className="mx-auto h-5 w-5 text-bonga-teal mb-2" />
              <div className="text-xs text-muted-foreground">&gt;1M APR</div>
              <div className="font-display text-3xl font-bold text-bonga-teal">
                7%
              </div>
            </div>
            <div className="bonga-card p-5 text-center">
              <Clock className="mx-auto h-5 w-5 text-bonga-purple mb-2" />
              <div className="text-xs text-muted-foreground">Payout</div>
              <div className="font-display text-xl font-bold">Monthly</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                UTC month-end → Bonga Bank
              </div>
            </div>
          </div>

          <div className="mt-8 bonga-card p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Connected Wallet</p>
                <p className="font-mono text-sm mt-1 break-all">
                  {walletAddress || "Not connected"}
                </p>
              </div>
              <BongaWalletButton />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-xl border border-bonga-teal/40 bg-bonga-teal/10 px-4 py-3 text-sm text-bonga-teal">
              {success}
            </div>
          )}

          {connected && status && (
            <div className="mt-8 space-y-6">
              <div className="bonga-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="h-5 w-5 text-bonga-orange" />
                  <h2 className="font-display font-bold text-lg">Your position</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Wallet $BONGA</div>
                    <div className="font-display text-2xl font-bold tabular-nums">
                      {status.walletBalance.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Staked</div>
                    <div className="font-display text-2xl font-bold tabular-nums text-bonga-orange">
                      {status.stakedAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Your APR</div>
                    <div className="font-display text-2xl font-bold">
                      {status.stakedAmount > 0 ? status.aprLabel : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Est. this month (if held to end)
                    </div>
                    <div className="font-display text-2xl font-bold text-bonga-teal">
                      {status.stakedAmount > 0
                        ? status.monthlyPreview.toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3 text-sm">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Cycle:{" "}
                      <strong>{status.cycle.monthLabel}</strong>
                    </span>
                    <span>
                      Ends in: <strong>{formatMs(msLeft)}</strong>
                    </span>
                    <span>
                      Lifetime rewarded:{" "}
                      <strong>
                        {status.lifetimeRewarded.toLocaleString()} $BONGA
                      </strong>
                    </span>
                  </div>
                  {!status.holdingOk && status.stakedAmount > 0 && (
                    <p className="mt-2 flex items-start gap-2 text-amber-700 dark:text-amber-300 text-xs">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      Wallet balance is below your stake. Monthly payouts pause
                      until you hold enough $BONGA again (or unstake).
                    </p>
                  )}
                </div>
              </div>

              <div className="bonga-card p-6">
                <h2 className="font-display font-bold text-lg mb-3">
                  {status.stakedAmount > 0 ? "Update stake" : "Stake $BONGA"}
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Soft-lock: coins stay in your wallet. You must keep at least
                  the staked amount through UTC month-end to earn. Preview APR
                  for amount below:{" "}
                  <strong>{aprPercentLabel(previewApr)}</strong> ≈{" "}
                  <strong>{previewMonthly.toLocaleString()}</strong> / month.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="Amount to stake"
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={maxStake}
                    className="rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    Max
                  </button>
                  <button
                    type="button"
                    disabled={loading || !amountInput}
                    onClick={() => void onStake()}
                    className="rounded-xl bg-bonga-orange px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {loading ? "Signing…" : "Stake / Update"}
                  </button>
                </div>
                {status.stakedAmount > 0 && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void onUnstake()}
                    className="mt-4 w-full rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300 disabled:opacity-50"
                  >
                    Unstake now (forfeit {status.cycle.month} rewards)
                  </button>
                )}
              </div>

              <div className="bonga-card p-6 text-sm text-muted-foreground space-y-2">
                <h3 className="font-display font-bold text-foreground text-base">
                  Rules
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    ≤ {COIN_STAKE_TIER_MAX.toLocaleString()} $BONGA staked →{" "}
                    {(COIN_STAKE_APR_HIGH * 100).toFixed(0)}% APR on the whole
                    position.
                  </li>
                  <li>
                    Over {COIN_STAKE_TIER_MAX.toLocaleString()} →{" "}
                    {(COIN_STAKE_APR_LOW * 100).toFixed(0)}% APR on the whole
                    position.
                  </li>
                  <li>
                    Each UTC calendar month is one cycle. Reward = stake × APR ÷
                    12, paid after the month ends.
                  </li>
                  <li>
                    Rewards auto-credit to your{" "}
                    <Link href="/bonga-bank" className="text-bonga-teal underline">
                      Bonga Bank Vault
                    </Link>
                    . Unstake before month-end →{" "}
                    <strong>no reward for that month</strong>.
                  </li>
                  <li>
                    Separate from{" "}
                    <Link href="/staking" className="text-bonga-orange underline">
                      NFT staking
                    </Link>
                    .
                  </li>
                </ul>
              </div>
            </div>
          )}

          {!connected && (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Connect a wallet holding $BONGA to stake.
            </p>
          )}
        </div>
      </main>
      <BongaFooter />
    </div>
  );
}
