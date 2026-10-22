"use client";

import Image from "next/image";
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
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {coins.map((coin) => {
          const meme = MEME_COINS.find((m) => m.id === coin.coinId) ?? MEME_COINS[0];
          const isHit = coin.hit;

          return (
            <motion.div
              key={coin.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${coin.x}%`, top: `${coin.y}%`, zIndex: 30 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                isHit
                  ? {
                      scale: [coin.scale, coin.scale * 0.55, coin.scale * 1.55, 0],
                      opacity: [1, 1, 0.5, 0],
                      rotate: [0, -30, 200, 480],
                      y: [0, 15, -65, -190],
                      x: [0, Math.random() > 0.5 ? 58 : -58],
                    }
                  : {
                      scale: coin.scale,
                      opacity: 1,
                      y: [0, -11, 0],
                      rotate: [0, coin.id.includes("1") ? 3 : -2, 0],
                    }
              }
              exit={{ scale: 0, opacity: 0 }}
              transition={
                isHit
                  ? { duration: 0.52, ease: "easeOut" }
                  : {
                      y: { duration: 2.1 + Math.random() * 0.6, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 3.8 + Math.random(), repeat: Infinity, ease: "easeInOut" },
                    }
              }
            >
              <div
                className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[3px] border-white/90 shadow-[0_10px_32px_rgba(0,0,0,0.32)] sm:h-[70px] sm:w-[70px]"
                style={{
                  background: "#fff",
                  borderColor: meme.color,
                  boxShadow: `0 12px 34px ${meme.color}38`,
                }}
              >
                <Image
                  src={meme.logo}
                  alt={`${meme.name} token logo`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="70px"
                />
              </div>

              <div
                className="mt-1.5 rounded-full px-2.5 py-px text-[8px] font-extrabold uppercase tracking-[1.1px] shadow-sm"
                style={{
                  backgroundColor: `${meme.color}dd`,
                  color: "#fff",
                  textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                {meme.name}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function spawnCoins(count = 8): FloatingCoin[] {
  // Keep spawns near the edges so they clear the center Bonga logo.
  const positions = [
    { x: 8, y: 14 },
    { x: 82, y: 10 },
    { x: 88, y: 38 },
    { x: 6, y: 48 },
    { x: 78, y: 66 },
    { x: 12, y: 70 },
    { x: 48, y: 6 },
    { x: 90, y: 72 },
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
