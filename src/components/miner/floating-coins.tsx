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
          const isHit = coin.hit;

          return (
            <motion.div
              key={coin.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
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
                      rotate: [0, isHit ? 0 : (coin.id.includes('1') ? 3 : -2), 0],
                    }
              }
              exit={{ scale: 0, opacity: 0 }}
              transition={
                isHit
                  ? { duration: 0.52, ease: "easeOut" }
                  : { 
                      y: { duration: 2.1 + Math.random() * 0.6, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 3.8 + Math.random(), repeat: Infinity, ease: "easeInOut" }
                    }
              }
            >
              {/* Premium coin with actual logo icon (emoji as the recognizable meme logo) */}
              <div
                className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[4.5px] border-white/85 shadow-[0_10px_32px_rgba(0,0,0,0.32),inset_0_5px_12px_rgba(255,255,255,0.7),inset_0_-6px_14px_rgba(0,0,0,0.42)] backdrop-blur-lg sm:h-[70px] sm:w-[70px]"
                style={{
                  background: `linear-gradient(138deg, #fff 6%, ${meme.color} 18%, ${meme.color} 82%, #f8f1e3 94%)`,
                  borderColor: meme.color,
                  boxShadow: `0 12px 34px ${meme.color}38, inset 0 4px 9px rgba(255,255,255,0.8)`,
                }}
              >
                {/* Metallic rim layers for real coin / logo token look */}
                <div className="absolute inset-[1.5px] rounded-full border border-white/25" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_26%_24%,rgba(255,255,255,0.6)_0%,transparent_52%)]" />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />

                {/* The actual logo icon — emoji as the official meme logo for instant recognition */}
                <div 
                  className="relative z-10 text-4xl leading-none drop-shadow-md sm:text-5xl" 
                  style={{ filter: 'contrast(1.1) saturate(1.15)' }}
                >
                  {meme.emoji}
                </div>

                {/* LMAO blue tears overlay for classic laughing smiley with big blue tears */}
                {meme.id === "lmao" && (
                  <>
                    {/* left tear */}
                    <div
                      className="absolute left-[26%] top-[34%] z-20 h-3 w-[5px] -rotate-[28deg] rounded-full bg-[#3B82F6]"
                      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
                    />
                    {/* right tear */}
                    <div
                      className="absolute right-[26%] top-[34%] z-20 h-3 w-[5px] rotate-[28deg] rounded-full bg-[#3B82F6]"
                      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
                    />
                    {/* extra drip tips for bigger tears effect */}
                    <div className="absolute left-[29%] top-[46%] z-20 h-1.5 w-[3px] -rotate-[20deg] rounded-full bg-[#2563EB]" />
                    <div className="absolute right-[29%] top-[46%] z-20 h-1.5 w-[3px] rotate-[20deg] rounded-full bg-[#2563EB]" />
                  </>
                )}

                {/* Extra bevel for premium coin quality */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-black/10" />
              </div>

              {/* Logo-style label */}
              <div 
                className="mt-1.5 rounded-full px-2.5 py-px text-[8px] font-extrabold uppercase tracking-[1.1px] shadow-sm backdrop-blur-sm"
                style={{ 
                  backgroundColor: `${meme.color}dd`,
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)'
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