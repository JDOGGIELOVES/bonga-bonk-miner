"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BonkMinerGame } from "@/components/miner/bonk-miner-game";
import { GameModeTabs, type GameMode } from "@/components/miner/game-mode-tabs";
import { BongaHeader } from "@/components/layout/bonga-header";
import { BongaFooter } from "@/components/layout/bonga-footer";
import { BongaCaBanner } from "@/components/about/bonga-ca-banner";
import { AudioControls } from "@/components/miner/audio-controls";
import { Button } from "@/components/ui/button";
import { gameAudio } from "@/lib/audio/audio-manager";
import { Volume2, VolumeX, Music, Music2 } from "lucide-react";
import { PeacefulBackground } from "@/components/layout/peaceful-background";
import { useBongaNftHolder } from "@/hooks/use-bonga-nft-holder";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchGlobalClaimTally, fetchClaimStatus, fetchFlaggedWallets, fetchBlockedWallets, type GlobalClaimTally, type ClaimStatus, type FlaggedWallet, type BlockedWallet } from "@/lib/claim-client";

// Lazy load the garden only when the user switches to that tab.
// This keeps the initial page load (default "miner" tab) much lighter
// and reduces risk of heavy JS + animations + timers spiking CPU/GPU on open.
const VibesGardenGame = dynamic(
  () => import("@/components/garden/vibes-garden-game").then((m) => m.VibesGardenGame),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Growing the garden...
      </div>
    ),
  }
);

interface GameHubProps {
  onWalletConnect?: () => void;
}

export function GameHub({ onWalletConnect }: GameHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode") as GameMode | null;

  const [mode, setMode] = useState<GameMode>(() => (urlMode === "garden" ? "garden" : "miner"));

  // Client-side mode change that ALSO keeps the URL (?mode=) in sync.
  // This makes header "Bonk Miner" / "Vibes Garden" navigation links (and the tabs)
  // behave like real navigation: address bar updates, refresh stays on the right mode,
  // browser back/forward works, and direct ?mode= links from other pages are consistent.
  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", newMode);
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  // Expose mode to header + tabs. handleModeChange keeps both the UI and the ?mode= URL in sync
  // so navigation feels like real links (address bar, refresh, history, direct links all agree).
  const [muted, setMuted] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [tallyRefreshKey, setTallyRefreshKey] = useState(0);
  const bumpTally = () => setTallyRefreshKey((k) => k + 1);

  const { connected } = useWallet();
  const { isHolder, count, checking } = useBongaNftHolder();

  // Live treasury/community data for transparency section
  const [communityTally, setCommunityTally] = useState<GlobalClaimTally | null>(null);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);
  const [flaggedWallets, setFlaggedWallets] = useState<Record<string, FlaggedWallet[]>>({});
  const [blockedWallets, setBlockedWallets] = useState<Record<string, BlockedWallet>>({});

  // Sync from URL on mount / param change (nav links use ?mode=)
  useEffect(() => {
    if (urlMode === "garden" || urlMode === "miner") {
      setMode(urlMode);
    }
  }, [urlMode]);

  useEffect(() => {
    const settings = gameAudio.getSettings();
    setMuted(settings.muted);
    setMusicEnabled((settings as any).musicEnabled ?? true);
    return gameAudio.subscribe((s) => {
      setMuted(s.muted);
      setMusicEnabled((s as any).musicEnabled ?? true);
    });
  }, []);

  // Load live community claimed data for the treasury transparency section
  useEffect(() => {
    fetchGlobalClaimTally().then(setCommunityTally);
    fetchClaimStatus().then(setClaimStatus);
    fetchFlaggedWallets().then(setFlaggedWallets);
    fetchBlockedWallets().then(setBlockedWallets);
  }, [tallyRefreshKey]);

  const soundControls = (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={() => gameAudio.toggleMute()}
        aria-label="Toggle mute"
      >
        {muted ? (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>
      {/* Prominent House Attack Radio toggle (live 24/7 house music via radio.garden) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={() => gameAudio.toggleMusic()}
        aria-label="Toggle House Attack Radio"
        title={musicEnabled ? "House Attack Radio on — live underground house / tech house 24/7 (radio.garden)" : "Radio off"}
      >
        {musicEnabled ? (
          <Music className="h-4 w-4 text-bonga-teal" />
        ) : (
          <Music2 className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-bonga-page">
      <PeacefulBackground />
      <BongaHeader 
        onWalletConnect={onWalletConnect} 
        soundSlot={soundControls} 
        currentMode={mode} 
        onModeChange={handleModeChange} 
      />

      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-[30px] py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <p className="bonga-section-label">Play & Mine</p>
          <h2 className="bonga-heading mt-2 text-2xl sm:text-3xl">
            Raise the Frequency
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {mode === "miner"
              ? "Tap to bonk. Mine $BONGA. House Attack Radio (live house music) plays automatically on interaction."
              : "Grow cosmic plants. Water with vibes. Earn garden $BONGA while you peace out. ✌️ House radio in background."}
          </p>
          {connected && isHolder && !checking && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-bonga-teal/50 bg-bonga-teal/15 px-4 py-1.5 text-sm font-semibold text-bonga-teal shadow-sm">
                ✨ You hold {count} Bonga NFT{count === 1 ? "" : "s"} — boosts active in Miner &amp; Garden
              </div>
              <a href="/nft" className="text-xs text-bonga-teal/80 underline hover:text-bonga-teal">View your NFTs in the gallery →</a>
            </div>
          )}
          {connected && !isHolder && !checking && (
            <p className="mt-1 text-xs text-muted-foreground">
              Connect a wallet holding Bonga NFTs to activate earnings boosts.
            </p>
          )}
        </motion.div>

        <div className="mb-6">
          <GameModeTabs mode={mode} onChange={handleModeChange} />
        </div>

        {connected && isHolder && !checking && (
          <div className="mb-4 rounded-xl border border-bonga-teal/30 bg-bonga-teal/5 p-3 text-center text-sm">
            <span className="font-medium text-bonga-teal">My NFT Boosts:</span>{" "}
            Garden idle earnings multiplier • Miner &amp; Garden progress support • Exclusive plants &amp; cosmetics (see /nft for full details)
          </div>
        )}

        <BongaCaBanner prominent />

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4"
          >
            {mode === "miner" ? (
              <BonkMinerGame
                embedded
                onWalletConnect={onWalletConnect}
                tallyRefreshKey={tallyRefreshKey}
                onTallyRefresh={bumpTally}
              />
            ) : (
              <VibesGardenGame onClaimSuccess={bumpTally} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Treasury transparency + Community leaderboard placeholder (enhanced) */}
        <div className="mt-10 space-y-6 border-t border-border/40 pt-8">
          <div className="bonga-card p-5 text-center">
            <p className="bonga-section-label">Community Treasury</p>
            <p className="mt-2 text-sm font-medium">
              7% royalties from secondary NFT sales + verified player claims (miner, garden, pet, staking) flow to the Bonga Community Treasury on Solana.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Cumulative lifetime total (never resets daily): <span className="font-semibold text-foreground">{(communityTally?.totalBonga ?? 0).toLocaleString()} $BONGA</span> across {(communityTally?.claimCount ?? 0).toLocaleString()} claims.
              <br />
              Miner: {(communityTally?.miner.bonga ?? 0).toLocaleString()} · Garden: {(communityTally?.garden.bonga ?? 0).toLocaleString()} · Pet: {(communityTally?.pet.bonga ?? 0).toLocaleString()} · Staking: {(communityTally?.stake?.bonga ?? 0).toLocaleString()}
              {(communityTally?.totalBonga ?? 0) === 0 && <span className="block text-[10px] text-amber-600">Tally will start populating after the first successful on-chain claims (storage now connected on Pro).</span>}
              {communityTally?.updatedAt && <span className="block text-[10px]">Last updated: {new Date(communityTally.updatedAt).toLocaleString()}</span>}
            </p>
            {claimStatus?.balances && (
              <p className="mt-1 text-xs text-muted-foreground">
                Treasury balance: {claimStatus.balances.bonga.toFixed(2)} $BONGA • {claimStatus.balances.sol.toFixed(2)} SOL
              </p>
            )}
            {claimStatus?.treasury && (
              <a
                href={`https://solscan.io/account/${claimStatus.treasury}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-bonga-teal underline hover:no-underline"
              >
                View Treasury on Solscan →
              </a>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Fully on-chain and transparent.
            </p>

            {(() => {
              const now = Date.now();
              const activeBlocked = Object.entries(blockedWallets).filter(([_, info]) => new Date(info.blockedUntil).getTime() > now);
              return activeBlocked.length > 0 ? (
                <div className="mt-3 text-left border-t border-border/40 pt-2">
                  <p className="text-xs font-semibold text-red-500">🚫 Currently blocked wallets (auto 3-day blocks)</p>
                  <ul className="mt-1 space-y-1 text-[10px] text-muted-foreground">
                    {activeBlocked.map(([wallet, info]) => {
                      const untilStr = new Date(info.blockedUntil).toLocaleString();
                      return (
                        <li key={wallet}>
                          <span className="font-mono">{wallet.slice(0, 6)}...{wallet.slice(-4)}</span> — blocked until {untilStr}
                          <div className="text-[9px] opacity-70">{info.reason}</div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null;
            })()}

            {Object.keys(flaggedWallets).length > 0 && (
              <div className="mt-2 text-left">
                <p className="text-xs font-semibold text-orange-500">⚠️ Recent flags (velocity violations)</p>
                <ul className="mt-1 space-y-1 text-[10px] text-muted-foreground">
                  {Object.entries(flaggedWallets).map(([wallet, flags]) => (
                    <li key={wallet} className="mb-1">
                      <div className="font-mono">
                        {wallet.slice(0, 6)}...{wallet.slice(-4)}
                      </div>
                      {flags.map((info, idx) => (
                        <div key={idx} className="ml-2 text-[9px] opacity-80">
                          • {info.windowLabel || '1h'}: {info.amountInWindow} $BONGA @ {new Date(info.flaggedAt).toLocaleTimeString()}
                          <div className="text-[8px] opacity-60">{info.reason}</div>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bonga-card p-5 text-center">
            <p className="bonga-section-label">Community Vibes</p>
            <p className="mt-1 text-sm">
              Leaderboard &amp; global ranks (on-chain + cross-game) coming soon.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use the Ranks button in Bonk Miner for current session standings. Peace &amp; love to the whole fam.
            </p>
          </div>
        </div>
      </main>

      <BongaFooter />
      <AudioControls />
    </div>
  );
}