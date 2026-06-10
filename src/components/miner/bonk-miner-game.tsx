"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { ClaimBonga } from "@/components/miner/claim-bonga";

import { BongaBonkCharacter } from "@/components/miner/bonga-bonk-character";
import { FloatingCoins, spawnCoins, type FloatingCoin } from "@/components/miner/floating-coins";
import {
  BonkEffects,
  Particles,
  type BonkEffect,
  type Particle,
} from "@/components/miner/bonk-effects";
import { GameStats } from "@/components/miner/game-stats";
import { GlobalClaimTally } from "@/components/miner/global-claim-tally";
import { UpgradeShop } from "@/components/miner/upgrade-shop";
import { LeaderboardPanel } from "@/components/miner/leaderboard-panel";
import { BongaCaBanner } from "@/components/about/bonga-ca-banner";
import { BongaHeader } from "@/components/layout/bonga-header";
import { BongaFooter } from "@/components/layout/bonga-footer";
import {
  loadGameState,
  saveGameState,
  processTap,
  getShareText,
  getClaimableBonga,
  type GameState,
} from "@/lib/miner-game";
import { gameAudio } from "@/lib/audio/audio-manager";
import { AudioControls } from "@/components/miner/audio-controls";
import { Share2, ShoppingBag, Trophy, Volume2, VolumeX } from "lucide-react";

const PARTICLE_COLORS = ["#FF6200", "#2DB8A8", "#8B5CF6", "#4ADE80"];

interface BonkMinerGameProps {
  onWalletConnect?: () => void;
  /** When true, renders only game content (no page chrome — used inside GameHub). */
  embedded?: boolean;
}

export function BonkMinerGame({ onWalletConnect, embedded = false }: BonkMinerGameProps) {
  const { connected } = useWallet();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [coins, setCoins] = useState<FloatingCoin[]>([]);
  const [effects, setEffects] = useState<BonkEffect[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isBonking, setIsBonking] = useState(false);
  const [bonkAngle, setBonkAngle] = useState(-80);
  const [combo, setCombo] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [tallyRefreshKey, setTallyRefreshKey] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectIdRef = useRef(0);

  useEffect(() => {
    const state = loadGameState();
    setGameState(state);
    setCoins(spawnCoins(5));
    setMuted(gameAudio.getSettings().muted);
    return gameAudio.subscribe((s) => setMuted(s.muted));
  }, []);

  useEffect(() => {
    if (gameState) saveGameState(gameState);
  }, [gameState]);

  const respawnCoin = useCallback((hitId: string) => {
    setTimeout(() => {
      setCoins((prev) =>
        prev.map((c) =>
          c.id === hitId
            ? {
                ...c,
                hit: false,
                x: 10 + Math.random() * 80,
                y: 10 + Math.random() * 70,
                coinId:
                  ["doge", "pepe", "shib", "wojak", "bonk", "moon"][
                    Math.floor(Math.random() * 6)
                  ],
              }
            : c
        )
      );
    }, 600);
  }, []);

  const addEffect = useCallback((x: number, y: number, type: BonkEffect["type"]) => {
    const id = `effect-${++effectIdRef.current}`;
    setEffects((prev) => [...prev.slice(-20), { id, x, y, type }]);
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== id));
    }, 800);
  }, []);

  const addParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = Array.from({ length: 6 }, (_, i) => ({
      id: `particle-${++effectIdRef.current}-${i}`,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      size: 4 + Math.random() * 6,
    }));
    setParticles((prev) => [...prev.slice(-30), ...newParticles]);
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 600);
  }, []);

  const handleTap = useCallback(
    (clientX: number, clientY: number) => {
      if (!gameState || !gameAreaRef.current) return;

      void gameAudio.resume();

      const rect = gameAreaRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const centerX = rect.width / 2;
      const angle = Math.atan2(y - centerX, x - centerX) * (180 / Math.PI);
      setBonkAngle(angle + 15);
      setIsBonking(true);
      setTimeout(() => setIsBonking(false), 380);

      const nearestCoin = coins
        .filter((c) => !c.hit)
        .sort((a, b) => {
          const ax = (a.x / 100) * rect.width;
          const ay = (a.y / 100) * rect.height;
          const bx = (b.x / 100) * rect.width;
          const by = (b.y / 100) * rect.height;
          return Math.hypot(ax - x, ay - y) - Math.hypot(bx - x, by - y);
        })[0];

      const hitCoin = nearestCoin ?? coins[0];
      if (!hitCoin) return;

      setCoins((prev) =>
        prev.map((c) => (c.id === hitCoin.id ? { ...c, hit: true } : c))
      );
      respawnCoin(hitCoin.id);

      const result = processTap(gameState, hitCoin.coinId);
      setGameState(result.state);

      setCombo((c) => c + 1);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => setCombo(0), 1500);

      addEffect(x - 30, y - 40, "bonk");
      addEffect(x + 20, y - 60, "star");
      addParticles(x, y);

      gameAudio.playBonk(combo);

      if (result.bongaEarned > 0) {
        addEffect(x, y - 80, "bonga");
        gameAudio.playCoinCollect();
      }
    },
    [gameState, coins, combo, respawnCoin, addEffect, addParticles]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    handleTap(e.clientX, e.clientY);
  };

  const handleShare = async () => {
    if (!gameState) return;
    const text = getShareText(gameState);

    if (navigator.share) {
      try {
        await navigator.share({ title: "Bonga Bonk Miner", text });
        return;
      } catch {
        /* fall through */
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setShareMsg("Copied");
    } catch {
      setShareMsg("Share failed");
    }
    setTimeout(() => setShareMsg(""), 3000);
  };

  const updatePlayerName = (name: string) => {
    if (!gameState) return;
    setGameState({ ...gameState, playerName: name || "Bonker" });
  };

  const soundButton = embedded ? null : (
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

  const gameContent = (
    <>
        {!gameState ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="font-display text-sm font-semibold text-muted-foreground"
            >
              Loading...
            </motion.div>
          </div>
        ) : (
          <>
        <div className="mt-4 space-y-4">
          <GlobalClaimTally refreshKey={tallyRefreshKey} />
          <GameStats state={gameState} combo={combo} connected={connected} />
          <ClaimBonga
            state={gameState}
            onStateChange={setGameState}
            onClaimSuccess={() => setTallyRefreshKey((key) => key + 1)}
          />
        </div>

        {/* Game arena */}
        <div
          ref={gameAreaRef}
          className="bonga-card relative mt-6 flex min-h-[58vh] cursor-pointer select-none flex-col items-center justify-center overflow-hidden touch-manipulation active:ring-2 active:ring-bonga-orange/20 sm:min-h-[60vh]"
          onPointerDown={handlePointerDown}
          role="button"
          tabIndex={0}
          aria-label="Tap to bonk meme coins"
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              const rect = gameAreaRef.current?.getBoundingClientRect();
              if (rect) {
                handleTap(rect.left + rect.width / 2, rect.top + rect.height / 2);
              }
            }
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-bonga-subtle opacity-60" />
          <FloatingCoins coins={coins} />
          <Particles particles={particles} />
          <BonkEffects effects={effects} />

          <p className="absolute top-5 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Tap anywhere
          </p>

          <BongaBonkCharacter isBonking={isBonking} bonkAngle={bonkAngle} />

          <p className="absolute bottom-5 px-4 text-center text-xs text-muted-foreground">
            {connected && getClaimableBonga(gameState) > 0
              ? "Claim your mined $BONGA above"
              : "100 bonks = 1 $BONGA · 10 max per day"}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full px-5"
            onClick={() => setShopOpen(true)}
          >
            <ShoppingBag className="h-4 w-4" />
            Shop
          </Button>
          <Button
            variant="peace"
            size="sm"
            className="gap-2 rounded-full px-5"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            {shareMsg || "Share"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full px-5"
            onClick={() => setLeaderboardOpen(true)}
          >
            <Trophy className="h-4 w-4" />
            Ranks
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Lifetime · {gameState.totalBonga} $BONGA · {gameState.totalTaps.toLocaleString()} bonks
        </p>

        {gameState && (
          <>
            <UpgradeShop
              open={shopOpen}
              onClose={() => setShopOpen(false)}
              totalBonga={gameState.totalBonga}
            />
            <LeaderboardPanel
              open={leaderboardOpen}
              onClose={() => setLeaderboardOpen(false)}
              entries={gameState.leaderboard}
              playerName={gameState.playerName}
              onNameChange={updatePlayerName}
            />
          </>
        )}
      </> 
    )}
  </>
);

  if (embedded) {
    return <div>{gameContent}</div>;
  }

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
            Tap to bonk. Mine $BONGA. Spread positive energy with Bonk&apos;s Sister.
          </p>
        </motion.div>

        <BongaCaBanner prominent />
        {gameContent}
      </main>

      <BongaFooter />
      <AudioControls />
    </div>
  );
}