"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { BongaHeader } from "@/components/layout/bonga-header";
import { BongaFooter } from "@/components/layout/bonga-footer";
import {
  fetchBongaBankStatus,
  depositPendingToBank,
  requestBankWithdraw,
  type BongaBankStatus,
} from "@/lib/claim-client";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function BongaBankPage() {
  // Vault door opening CSS (injected for the bank vault "opening up" feel)
  // The .vault-door uses 3D transform on the left hinge to swing open, revealing the interior "savings" content.
  // Strong metallic gradients, rivets, heavy lock, and dramatic shadows for authentic bank vault aesthetic.
  const { connected, publicKey, wallet: connectedWallet, signMessage } = useWallet();
  const { setVisible } = useWalletModal();

  const [status, setStatus] = useState<BongaBankStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vaultOpen, setVaultOpen] = useState(false);

  const walletAddress = publicKey?.toBase58() ?? null;

  const refreshStatus = useCallback(async () => {
    if (!walletAddress) {
      setStatus(null);
      // Do not force-close the visual if user already clicked to open the vault.
      // The under-door counter will show 0.00 + await-connect guidance until address arrives.
      return;
    }
    try {
      let s = await fetchBongaBankStatus(walletAddress);
      setStatus(s);

      // Always attempt to auto-flush any pending from miner/garden/staking/pet into banked balance on vault open/refresh.
      // This ensures staking earnings and miner taps (verified server side) show up in the visible vault total.
      // The call is idempotent if no pending.
      try {
        await depositPendingToBank({ wallet: walletAddress, source: "all" });
        s = await fetchBongaBankStatus(walletAddress); // re-fetch to reflect the moved amounts in bankedBonga
        setStatus(s);
      } catch (e) {
        // non-fatal — user can refresh again
      }

      // Ensure revealed state
      setVaultOpen(true);
    } catch (e) {
      setError("Failed to load Bonga Bank status.");
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      refreshStatus(); // fetch latest balance
      setVaultOpen(true); // auto open vault to show balance on connect
    } else {
      setStatus(null);
      setVaultOpen(false);
      setMessage(null);
      setError(null);
    }
  }, [walletAddress, refreshStatus]);

  const handleDeposit = async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await depositPendingToBank({ wallet: walletAddress, source: "all" });
      if (res.ok) {
        setMessage(`Deposited ${res.totalDeposited ?? 0} $BONGA to your bank.`);
        await refreshStatus();
      } else {
        setError(res.error || "Deposit failed.");
      }
    } catch (e: any) {
      setError(e?.message || "Deposit failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!walletAddress || !status || !connectedWallet || !signMessage) return;
    if (!status.canWithdraw) return;

    const amount = status.bankedBonga;
    if (amount < status.minWithdraw) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await requestBankWithdraw({
        wallet: walletAddress,
        amount,
        date: todayKey(),
        connectedWallet,
        signMessage,
      });
      setMessage(`Successfully withdrawn ${amount} $BONGA to your wallet!`);
      // show explorer in message or alert
      if ((res as any).explorerUrl) {
        window.open((res as any).explorerUrl, "_blank");
      }
      await refreshStatus();
    } catch (e: any) {
      setError(e?.message || "Bank withdraw failed. Make sure you have a pre-created $BONGA ATA and enough SOL for fees.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnterVault = () => {
    // Open the visual vault (door + reveal the balance area under it) immediately.
    // This ensures the big number counter appears with no blank space, even before wallet finishes connecting.
    setVaultOpen(true);
    if (!connected) {
      setVisible(true);
    }
    // Kick off status load (will auto-deposit pending + populate real number when address is known)
    refreshStatus();
  };

  return (
    <>
      <BongaHeader />
      <div className="min-h-screen bg-bonga-page">
        {/* BANK VAULT OPENING DESIGN */}
        <style>{`
          .vault-frame {
            background: linear-gradient(180deg, #18181b 0%, #111113 100%);
          }
          .vault-door {
            transition: transform 850ms cubic-bezier(0.23, 1.0, 0.32, 1), box-shadow 850ms;
            transform-origin: 0% 50%;
            will-change: transform;
            backface-visibility: hidden;
          }
          .vault-door.door-open {
            transform: rotateY(-72deg) translateX(-18px) !important;
            box-shadow: 35px 0 70px rgba(0,0,0,0.7), inset -40px 0 60px rgba(0,0,0,0.55) !important;
          }
          .vault-interior {
            transition: opacity 650ms ease, transform 650ms cubic-bezier(0.23,1,0.32,1);
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          .vault-interior.revealed {
            opacity: 1 !important;
            transform: translateY(0) scale(1);
          }
          .vault-rivet {
            box-shadow: 0 0 0 1px #3f3f46, inset 0 1px 0 #52525b;
          }
          .vault-plaque {
            background: linear-gradient(145deg, #27272a, #18181b);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 15px -3px rgb(0 0 0);
          }
        `}</style>

        <div className="mx-auto max-w-5xl px-[30px] py-10">
          {/* Dramatic Vault Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-bonga-orange/60" />
              <span className="font-mono uppercase tracking-[4px] text-xs text-bonga-orange/80">PRIVATE DEPOSITORY</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-bonga-orange/60" />
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-black tracking-[-1.5px] text-white">
              THE BONGA <span className="text-bonga-orange">VAULT</span>
            </h1>
            <p className="mt-2 text-xl text-zinc-400 max-w-md mx-auto">
              Your personal mined savings. Secure. Off-chain until you decide to withdraw.
            </p>
          </div>

          {/* VAULT DOOR OPENING HEADER - the "Bank Vault opening up" visual centerpiece */}
          <div className="relative mx-auto max-w-[820px] mb-8" style={{ perspective: '1200px' }}>
            <div className={`vault-door relative mx-auto w-full aspect-[16/5] rounded-2xl border-[10px] border-zinc-700 bg-[linear-gradient(135deg,#3f3f46,#27272a,#18181b)] flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-700 ${vaultOpen ? 'door-open' : ''}`} style={{ transform: vaultOpen ? 'rotateY(-55deg) translateX(-30px)' : 'rotateY(0deg)', transformOrigin: 'left center' }}>
              {/* Door surface details */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(120deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_3px,transparent_4px,transparent_18px)]" />
              {/* Large lock wheel - always on the door face */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="h-16 w-16 rounded-full border-8 border-zinc-300/80 bg-zinc-950 flex items-center justify-center mb-2 shadow-inner">
                  <div className="h-7 w-7 rounded-full border-[5px] border-bonga-orange/70" />
                </div>
                <div className="font-display text-white text-3xl tracking-[-1px] font-black">BONGA VAULT</div>
                <div className="text-xs text-white/50 tracking-[2px] mt-0.5">MINED SAVINGS • 10,000 BANK CAP</div>
              </div>

              {/* Hinge and rivets */}
              <div className="absolute left-0 top-0 bottom-0 w-3 bg-zinc-600/70" style={{ boxShadow: '2px 0 4px rgba(0,0,0,0.4)' }} />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="vault-rivet absolute left-1 bg-zinc-300/70 h-2 w-2 rounded-full" style={{ top: `${15 + i * 16}%` }} />
              ))}
            </div>

            {/* The "opened" interior glow / light from inside the vault */}
            <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-bonga-orange/10 via-transparent to-transparent transition-opacity ${vaultOpen ? 'opacity-70' : 'opacity-0'}`} style={{ filter: 'blur(20px)' }} />
          </div>

          {/* Revealed vault interior — ALWAYS appears under the swinging door as soon as you click ENTER THE VAULT (vaultOpen).
             This guarantees the big number counter / "holders" are visible and there is NEVER a blank area.
             Shows 0.00 immediately; updates to real banked balance once connected + data loads (auto-flush of pending too). */}
          {vaultOpen && (
            <div className={`vault-interior mx-auto max-w-[820px] mt-2 mb-8 p-6 bg-zinc-900 border-4 border-zinc-500 rounded-3xl text-center shadow-inner transition-all ${vaultOpen ? 'revealed' : ''}`}>
              <div className="text-[10px] uppercase tracking-[2px] text-bonga-orange/70 mb-1">YOUR PERSONAL BONGA BANK VAULT</div>
              <div className="mx-auto inline-block bg-black border-2 border-bonga-orange/70 p-4 rounded-xl min-w-[280px]">
                <div className="font-mono text-[3.5rem] md:text-[4rem] leading-none font-black tabular-nums tracking-[-2px] text-bonga-orange">
                  {((status?.bankedBonga ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-xl text-white/70 mt-2">$BONGA</div>
              <div className="text-xs text-white/60 mt-2">
                {walletAddress
                  ? "Your mined $BONGA auto-deposits here as you play. 0.00 until first earnings arrive."
                  : "Connect your wallet (popup should be open) — balance loads automatically after connect."}
              </div>
              {!walletAddress && (
                <button
                  onClick={() => setVisible(true)}
                  className="mt-3 px-5 py-1.5 text-sm rounded-full border border-bonga-orange/50 text-bonga-orange hover:bg-bonga-orange/10"
                >
                  Open Wallet Connect
                </button>
              )}
            </div>
          )}

          {!connected && (
            <div className="max-w-md mx-auto">
              {/* Closed Vault Prompt */}
              <div className="relative mx-auto w-full max-w-[420px] aspect-[4/3] rounded-2xl border-[12px] border-zinc-700 bg-zinc-950 shadow-2xl overflow-hidden"
                   style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.9), 0 25px 50px -12px rgb(0 0 0 / 0.4)' }}>
                {/* Vault door face - closed state */}
                <div className="absolute inset-0 bg-[linear-gradient(145deg,#27272a_0%,#18181b_50%,#27272a_100%)] flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-20 w-20 rounded-full border-[6px] border-zinc-400/70 bg-zinc-900 flex items-center justify-center">
                      <div className="h-9 w-9 rounded-full border-4 border-bonga-orange/70 flex items-center justify-center">
                        <div className="text-[10px] font-mono text-bonga-orange tracking-widest">LOCKED</div>
                      </div>
                    </div>
                    <div className="font-display text-3xl font-bold tracking-tight text-white mb-1">VAULT SEALED</div>
                    <div className="text-sm text-zinc-400 mb-6">Connect wallet to open the Bonga Bank Vault</div>
                    <button
                      onClick={handleEnterVault}
                      className="px-8 py-3 rounded-xl bg-bonga-orange text-black font-semibold text-sm tracking-wider hover:bg-amber-400 active:scale-[0.985] transition shadow-inner"
                    >
                      ENTER THE VAULT
                    </button>
                  </div>
                </div>
                {/* Rivets and frame details */}
                <div className="absolute inset-0 pointer-events-none border border-zinc-500/30" style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(161,161,170,0.15) 19px, rgba(161,161,170,0.15) 20px)' }} />
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground max-w-xs mx-auto">Your mined $BONGA savings are kept in a secure off-chain vault. <strong>$BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches 10,000 $BONGA.</strong> This keeps the economics sustainable for the whole community.</p>
            </div>
          )}

          {connected && walletAddress && (
            <div className="space-y-8">
              {/* Clear "My Mined Savings" View */}
              <div className="bonga-card p-8">
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="font-display text-2xl font-bold">My Mined Savings</h2>
                  {status && <div className="text-xs text-muted-foreground font-mono">Connected: {walletAddress.slice(0,6)}…{walletAddress.slice(-4)}</div>}
                </div>
                <p className="text-sm text-muted-foreground mb-6">All the $BONGA you've mined and saved in your personal off-chain Bonga Bank. Everything auto-deposits here as you tap, water, or earn from staking — no manual deposit or claim buttons needed in the games. Connect + open the vault to see it. This model keeps the ecosystem sustainable.</p>

                {/* Big current balance - the clear mined savings amount */}
                <div className="mb-6 text-center">
                  <div className="text-sm uppercase tracking-[2px] text-muted-foreground mb-1">Current Savings Balance</div>
                  <div className="text-7xl font-extrabold tabular-nums tracking-[-3px] text-bonga-orange">
                    {((status?.bankedBonga ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-2xl text-muted-foreground">$BONGA in your Bonga Bank</div>
                </div>

                {!status && <p className="text-muted-foreground text-sm">Loading your personal deposits…</p>}

                {status && (
                  <>

                    {/* Progress toward withdrawable threshold for clear goal */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span>Progress to on-chain withdrawal</span>
                        <span className="font-mono">{status.bankedBonga.toLocaleString()} / {status.minWithdraw.toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden border border-border/60">
                        <div 
                          className="h-full bg-bonga-orange transition-all" 
                          style={{ width: `${Math.min(100, Math.max(0, (status.bankedBonga / status.minWithdraw) * 100))}%` }}
                        />
                      </div>
                      {!status.canWithdraw && status.bankedBonga > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 text-center">
                          { (status.minWithdraw - status.bankedBonga).toLocaleString() } more $BONGA mined until you can withdraw your savings on-chain.
                        </div>
                      )}
                      {status.canWithdraw && (
                        <div className="text-xs text-bonga-teal mt-1 text-center font-medium">Ready to withdraw your mined savings!</div>
                      )}
                      <div className="text-[10px] text-muted-foreground mt-2 text-center">
                        $BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches {status.minWithdraw?.toLocaleString() || "10,000"} $BONGA.
                      </div>
                    </div>

                    {/* Lifetime mined savings stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-6">
                      <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                        <div className="text-muted-foreground text-xs">Total Mined &amp; Banked (all time)</div>
                        <div className="font-semibold text-2xl tabular-nums">{(status.lifetimeBanked || 0).toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">$BONGA you've earned into savings</div>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                        <div className="text-muted-foreground text-xs">Withdrawn On-Chain</div>
                        <div className="font-semibold text-2xl tabular-nums">{(status.lifetimeWithdrawn || 0).toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">$BONGA already in your wallet</div>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                        <div className="text-muted-foreground text-xs">Current Bank Balance</div>
                        <div className="font-semibold text-2xl tabular-nums">{((status?.bankedBonga ?? 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Your active mined savings</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {status.canWithdraw && (
                        <button
                          onClick={handleWithdraw}
                          disabled={loading}
                          className="rounded-lg bg-bonga-teal px-6 py-2.5 font-semibold text-black hover:bg-bonga-teal/90 disabled:opacity-50"
                        >
                          {loading ? "Signing &amp; Sending..." : `Withdraw ${status.bankedBonga.toLocaleString()} $BONGA to My Wallet`}
                        </button>
                      )}

                      {!status.canWithdraw && status.bankedBonga > 0 && (
                        <div className="text-sm text-muted-foreground self-center px-2">
                          Keep playing — bank more mined $BONGA to reach the withdrawal threshold.
                        </div>
                      )}

                      <button
                        onClick={() => refreshStatus()}
                        disabled={loading}
                        className="rounded-lg px-4 py-2 text-sm border border-border hover:bg-muted/30 disabled:opacity-50"
                      >
                        Refresh Savings
                      </button>
                      <button
                        onClick={async () => {
                          if (!walletAddress) return;
                          setLoading(true);
                          setError(null);
                          try {
                            await depositPendingToBank({ wallet: walletAddress, source: "all" });
                            await refreshStatus();
                          } catch (e: any) {
                            setError(e?.message || "Sync failed");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="rounded-lg px-4 py-2 text-sm bg-bonga-teal text-black hover:bg-bonga-teal/90 disabled:opacity-50"
                      >
                        Sync All Pending Earnings to Vault
                      </button>
                    </div>

                    {status.pending && (status.pending.total || 0) > 0 && (
                      <div className="mt-4 rounded bg-muted/40 p-3 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Pending from games (will be added to your bank balance on sync/open):</span> miner {status.pending.miner} + garden {status.pending.garden} + pet {status.pending.pet} + stake {status.pending.stake} ≈ {status.pending.total} $BONGA
                      </div>
                    )}

                    {/* Simple deposit history log - clear view of mining activity */}
                    {status.recentDeposits && status.recentDeposits.length > 0 && (
                      <div className="mt-6 border-t border-border/50 pt-4">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recent Deposits (your mined savings activity)</div>
                        <div className="max-h-48 overflow-auto text-xs space-y-1 font-mono">
                          {status.recentDeposits.slice().reverse().map((d, i) => (
                            <div key={i} className="flex justify-between bg-muted/30 px-2 py-0.5 rounded">
                              <span>{new Date(d.ts).toLocaleString()}</span>
                              <span className="text-bonga-orange">+{d.amount}</span>
                              <span className="text-muted-foreground">{d.source || "manual"} {d.date ? `(${d.date})` : ""}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">Last {Math.min(20, status.recentDeposits.length)} deposits shown.</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Global community stats - how many people are playing and mining */}
              {status && status.community && (
                <div className="bonga-card p-6 text-sm">
                  <div className="font-semibold mb-2 text-foreground">Community Mined &amp; Banked</div>
                  <div className="flex flex-wrap gap-x-8 gap-y-1">
                    <div>
                      <span className="text-muted-foreground">Total mined into banks:</span>{" "}
                      <span className="font-semibold tabular-nums">{(status.community.totalLifetimeBanked || 0).toLocaleString()} $BONGA</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Players who have mined &amp; banked:</span>{" "}
                      <span className="font-semibold tabular-nums">{(status.community.totalUniquePlayers || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    This shows real mining activity across the player base (off-chain savings + the sustainable withdrawal model).
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="bonga-card p-6 text-sm text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">How the Bonga Bank works</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Play the Bonk Miner (1 tap = 1 $BONGA, 1000/day), Vibes Garden (up to 1500/day), Pet Love (1000 per validated image), or stake NFTs — all earnings auto-deposit straight into your personal off-chain Bonga Bank Vault. No manual claim or "move" buttons in the games.</li>
                  <li>Open the Vault (connect wallet + ENTER) to see your balance and auto-flush any fresh pending earnings.</li>
                  <li><strong>$BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches 10,000 $BONGA.</strong></li>
                  <li>This keeps Solana fees tiny compared to the value distributed to the community while you still accumulate 100% of everything you mine.</li>
                </ul>
                <p className="mt-3">
                  On-chain withdrawals still require a pre-created $BONGA ATA on your wallet and go through all the usual safety checks (simulation, allow-lists, rate limits, nonces, anomaly detection).
                </p>
              </div>

              {message && <div className="rounded bg-green-500/10 border border-green-500/30 p-3 text-green-400 text-sm">{message}</div>}
              {error && <div className="rounded bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">{error}</div>}
            </div>
          )}

          <div className="mt-12 text-center text-xs text-muted-foreground">
            Bonga Bank is off-chain until you withdraw. All on-chain movements are publicly visible on Solana via the <Link href="/treasury" className="underline">Treasury page</Link>.
          </div>
        </div>
      </div>
      <BongaFooter />
    </>
  );
}
