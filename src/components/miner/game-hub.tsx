"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { BonkMinerGame } from "@/components/miner/bonk-miner-game";
import { GameModeTabs, type GameMode } from "@/components/miner/game-mode-tabs";
import { BongaHeader } from "@/components/layout/bonga-header";
import { BongaFooter } from "@/components/layout/bonga-footer";
import { BongaCaBanner } from "@/components/about/bonga-ca-banner";
import { AudioControls } from "@/components/miner/audio-controls";
import { Button } from "@/components/ui/button";
import { gameAudio } from "@/lib/audio/audio-manager";
import { Volume2, VolumeX } from "lucide-react";

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
  const [mode, setMode] = useState<GameMode>("miner");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(gameAudio.getSettings().muted);
    return gameAudio.subscribe((s) => setMuted(s.muted));
  }, []);

  const soundButton = (
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
  );

  return (
    <div className="flex min-h-screen flex-col bg-bonga-page">
      <BongaHeader onWalletConnect={onWalletConnect} soundSlot={soundButton} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
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
              ? "Tap to bonk. Mine $BONGA. Spread positive energy with Bonk's Sister."
              : "Grow cosmic plants. Water with vibes. Earn garden $BONGA while you peace out."}
          </p>
        </motion.div>

        <div className="mb-6">
          <GameModeTabs mode={mode} onChange={setMode} />
        </div>

        <BongaCaBanner prominent />

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === "miner" ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "miner" ? 12 : -12 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            {mode === "miner" ? (
              <BonkMinerGame embedded onWalletConnect={onWalletConnect} />
            ) : (
              <VibesGardenGame />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BongaFooter />
      <AudioControls />
    </div>
  );
}