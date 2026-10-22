"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BonkMinerGame } from "@/components/miner/bonk-miner-game";
import { GameModeTabs, type GameMode } from "@/components/miner/game-mode-tabs";
import { BongaHeader } from "@/components/layout/bonga-header";
import { BongaFooter } from "@/components/layout/bonga-footer";
import { BongaCaBanner } from "@/components/about/bonga-ca-banner";
import { AudioControls } from "@/components/miner/audio-controls";
import { LiveRadioPlayer } from "@/components/audio/LiveRadioPlayer";
import { Button } from "@/components/ui/button";
import { gameAudio } from "@/lib/audio/audio-manager";
import { Volume2, VolumeX } from "lucide-react";
import { PeacefulBackground } from "@/components/layout/peaceful-background";
import { useBongaNftHolder } from "@/hooks/use-bonga-nft-holder";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchGlobalClaimTally, fetchClaimStatus, type GlobalClaimTally, type ClaimStatus } from "@/lib/claim-client";

interface GameHubProps {
  onWalletConnect?: () => void;
}

export function GameHub({ onWalletConnect }: GameHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Vibes Garden retired — keep miner-only play surface.
  const mode: GameMode = "miner";

  const handleModeChange = (newMode: GameMode) => {
    if (newMode !== "miner") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "miner");
    router.replace(`/?${params.toString()}`, { scroll: false });
  };

  const [muted, setMuted] = useState(false);
  const [tallyRefreshKey, setTallyRefreshKey] = useState(0);
  const bumpTally = () => setTallyRefreshKey((k) => k + 1);

  const { connected } = useWallet();
  const { isHolder, count, checking } = useBongaNftHolder();

  const [communityTally, setCommunityTally] = useState<GlobalClaimTally | null>(null);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | null>(null);

  useEffect(() => {
    const settings = gameAudio.getSettings();
    setMuted(settings.muted);
    return gameAudio.subscribe((s) => {
      setMuted(s.muted);
    });
  }, []);

  // Load live community claimed data for the treasury transparency section
  useEffect(() => {
    fetchGlobalClaimTally().then(setCommunityTally);
    fetchClaimStatus().then(setClaimStatus);
    // Blocked/flagged wallet lists are admin-only (no public scrape / dox).
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
            Tap to bonk. 100 taps = 1 $BONGA (max 10/day). House Attack Radio plays on interaction.
          </p>
          <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-bonga-orange/30 bg-bonga-orange/10 px-3 py-1 text-[11px] font-medium text-bonga-orange">
            Economy v2 · leaner rewards · sustainable treasury
          </div>

          <div className="mx-auto mt-4 w-full max-w-md">
            <LiveRadioPlayer />
          </div>
          {connected && isHolder && !checking && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-bonga-teal/50 bg-bonga-teal/15 px-4 py-1.5 text-sm font-semibold text-bonga-teal shadow-sm">
                ✨ You hold {count} Bonga NFT{count === 1 ? "" : "s"} — Miner boosts active
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
            Miner earn boosts · stake for daily $BONGA (see /nft &amp; /staking)
          </div>
        )}

        <BongaCaBanner prominent />

        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4"
        >
          <BonkMinerGame
            embedded
            onWalletConnect={onWalletConnect}
            tallyRefreshKey={tallyRefreshKey}
            onTallyRefresh={bumpTally}
          />
        </motion.div>

        <div className="mt-10 space-y-6 border-t border-border/40 pt-8">
          <div className="bonga-card p-5 text-center">
            <p className="bonga-section-label">Community Treasury</p>
            <p className="mt-2 text-sm font-medium">
              7% royalties from secondary NFT sales + verified player claims (miner, pet, staking) flow to the Bonga Community Treasury on Solana.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Cumulative lifetime total (never resets daily): <span className="font-semibold text-foreground">{(communityTally?.totalBonga ?? 0).toLocaleString()} $BONGA</span> across {(communityTally?.claimCount ?? 0).toLocaleString()} claims.
              <br />
              Miner: {(communityTally?.miner.bonga ?? 0).toLocaleString()} · Pet: {(communityTally?.pet.bonga ?? 0).toLocaleString()} · Staking: {(communityTally?.stake?.bonga ?? 0).toLocaleString()}
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