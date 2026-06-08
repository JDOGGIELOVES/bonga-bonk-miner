"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MEME_COINS } from "@/lib/miner-game";

export interface FloatingCoin {
  id: string;
  coinId: string;
  x: number;
  y: number;
  scale: number;
  hit: boolean;
}

interface FloatingCoinsProps {
  coins: FloatingCoin[];
}

export function FloatingCoins({ coins }: FloatingCoinsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {coins.map((coin) => {
          const meme = MEME_COINS.find((m) => m.id === coin.coinId) ?? MEME_COINS[0];

          return (
            <motion.div
              key={coin.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                coin.hit
                  ? {
                      scale: [coin.scale, coin.scale * 1.4, 0],
                      opacity: [1, 1, 0],
                      rotate: [0, 360],
                      y: [0, -80, -160],
                      x: [0, Math.random() > 0.5 ? 40 : -40],
                    }
                  : {
                      scale: coin.scale,
                      opacity: 1,
                      y: [0, -8, 0],
                    }
              }
              exit={{ scale: 0, opacity: 0 }}
              transition={
                coin.hit
                  ? { duration: 0.5, ease: "easeOut" }
                  : { y: { duration: 2 + Math.random(), repeat: Infinity, ease: "easeInOut" } }
              }
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-card/90 text-xl shadow-card backdrop-blur-sm sm:h-14 sm:w-14 sm:text-2xl"
                style={{
                  boxShadow: `0 4px 16px ${meme.color}22`,
                }}
              >
                {meme.emoji}
              </div>
              <span className="mt-1.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                {meme.name}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function spawnCoins(count = 6): FloatingCoin[] {
  const positions = [
    { x: 12, y: 18 },
    { x: 78, y: 12 },
    { x: 85, y: 45 },
    { x: 8, y: 55 },
    { x: 72, y: 68 },
    { x: 18, y: 72 },
    { x: 50, y: 8 },
    { x: 88, y: 78 },
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `coin-${i}-${Date.now()}`,
    coinId: MEME_COINS[i % MEME_COINS.length].id,
    x: positions[i % positions.length].x + (Math.random() - 0.5) * 8,
    y: positions[i % positions.length].y + (Math.random() - 0.5) * 8,
    scale: 0.85 + Math.random() * 0.3,
    hit: false,
  }));
}