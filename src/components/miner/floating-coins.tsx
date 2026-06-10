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
              {/* Custom high-quality SVG coin face */}
              <div
                className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[4.5px] border-white/85 shadow-[0_10px_32px_rgba(0,0,0,0.32),inset_0_5px_12px_rgba(255,255,255,0.7),inset_0_-6px_14px_rgba(0,0,0,0.42)] backdrop-blur-lg sm:h-[70px] sm:w-[70px]"
                style={{
                  background: `linear-gradient(138deg, #fff 6%, ${meme.color} 18%, ${meme.color} 82%, #f8f1e3 94%)`,
                  borderColor: meme.color,
                  boxShadow: `0 12px 34px ${meme.color}38, inset 0 4px 9px rgba(255,255,255,0.8)`,
                }}
              >
                {/* Metallic rim layers */}
                <div className="absolute inset-[1.5px] rounded-full border border-white/25" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_26%_24%,rgba(255,255,255,0.6)_0%,transparent_52%)]" />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />

                {/* The custom drawn SVG face - fully custom, no emoji */}
                <div className="relative z-10" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }}>
                  {getCustomCoinFace(meme.id, isHit)}
                </div>

                {/* Extra bevel for premium coin quality */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-black/10" />
              </div>

              {/* Stylized label */}
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

/** Fully custom drawn SVG faces for each meme coin with unique personalities + hit reactions */
function getCustomCoinFace(coinId: string, isHit: boolean) {
  const hitScale = isHit ? 0.92 : 1;
  const hitRotate = isHit ? (coinId === 'wojak' ? -12 : 8) : 0;

  const baseProps = {
    width: 52,
    height: 52,
    viewBox: "0 0 52 52",
    style: { transform: `scale(${hitScale}) rotate(${hitRotate}deg)` },
  };

  switch (coinId) {
    case "doge":
      return (
        <svg {...baseProps} className="drop-shadow">
          <circle cx="26" cy="26" r="23" fill="#F4D03F" stroke="#B7950B" strokeWidth="2.5" />
          {/* Ears */}
          <path d="M12 14 Q8 6 16 8" fill="none" stroke="#B7950B" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M40 14 Q44 6 36 8" fill="none" stroke="#B7950B" strokeWidth="3.5" strokeLinecap="round" />
          {/* Face */}
          <circle cx="19" cy="22" r="4.5" fill="#2C3E50" />
          <circle cx="33" cy="22" r="4.5" fill="#2C3E50" />
          <circle cx="19.5" cy="21" r="1.8" fill="#F5B7B1" />
          <circle cx="33.5" cy="21" r="1.8" fill="#F5B7B1" />
          {/* Snout */}
          <ellipse cx="26" cy="32" rx="8" ry="5.5" fill="#FDFEFE" stroke="#B7950B" strokeWidth="1.5" />
          <circle cx="22" cy="31" r="1.4" fill="#2C3E50" />
          <circle cx="30" cy="31" r="1.4" fill="#2C3E50" />
          {isHit ? (
            <path d="M19 36 Q26 40 33 36" fill="none" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M20 35 Q26 38 32 35" fill="none" stroke="#2C3E50" strokeWidth="1.8" strokeLinecap="round" />
          )}
          {isHit && <text x="26" y="44" textAnchor="middle" fill="#2C3E50" fontSize="6" fontWeight="700">WOW</text>}
        </svg>
      );

    case "pepe":
      return (
        <svg {...baseProps} className="drop-shadow">
          <circle cx="26" cy="26" r="23" fill="#5DADE2" stroke="#1A5276" strokeWidth="2.5" />
          <ellipse cx="26" cy="27" rx="19" ry="17" fill="#27AE60" stroke="#1E8449" strokeWidth="2" />
          <ellipse cx="18" cy="21" rx="4" ry="5" fill="#2C3E50" transform={isHit ? "rotate(-15 18 21)" : ""} />
          <ellipse cx="34" cy="21" rx="4" ry="5" fill="#2C3E50" transform={isHit ? "rotate(15 34 21)" : ""} />
          <path d="M14 15 Q18 13 22 16" fill="none" stroke="#2C3E50" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M38 15 Q34 13 30 16" fill="none" stroke="#2C3E50" strokeWidth="2.2" strokeLinecap="round" />
          {isHit && (
            <>
              <path d="M14 14 Q19 11 23 15" fill="none" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" />
              <path d="M38 14 Q33 11 29 15" fill="none" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
          <path d={isHit ? "M18 35 Q26 42 34 35" : "M19 34 Q26 38 33 34"} fill="none" stroke="#2C3E50" strokeWidth="2.5" strokeLinecap="round" />
          {isHit && <path d="M22 38 L26 43 L30 38" fill="none" stroke="#2C3E50" strokeWidth="1.8" />}
        </svg>
      );

    case "shib":
      return (
        <svg {...baseProps} className="drop-shadow">
          <circle cx="26" cy="26" r="23" fill="#E67E22" stroke="#D35400" strokeWidth="2.5" />
          <polygon points="12,12 18,4 24,13" fill="#D35400" stroke="#B9770E" strokeWidth="1.5" />
          <polygon points="40,12 34,4 28,13" fill="#D35400" stroke="#B9770E" strokeWidth="1.5" />
          <ellipse cx="18" cy="22" rx="3.5" ry="5" fill="#2C3E50" />
          <ellipse cx="34" cy="22" rx="3.5" ry="5" fill="#2C3E50" />
          <circle cx="19" cy="20" r="1.2" fill="#F5B041" />
          <circle cx="35" cy="20" r="1.2" fill="#F5B041" />
          <circle cx="26" cy="30" r="2.5" fill="#2C3E50" />
          <path d={isHit ? "M20 35 Q26 39 32 35" : "M21 34 Q26 37 31 34"} fill="none" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" />
          {isHit && <path d="M23 38 Q26 41 29 38" fill="none" stroke="#E74C3C" strokeWidth="1.5" />}
        </svg>
      );

    case "wojak":
      return (
        <svg {...baseProps} className="drop-shadow">
          <circle cx="26" cy="26" r="23" fill="#AED6F1" stroke="#5DADE2" strokeWidth="2.5" />
          <ellipse cx="26" cy="27" rx="17" ry="18" fill="#FADBD8" stroke="#E74C3C" strokeWidth="1.8" />
          <ellipse cx="18" cy="22" rx="4" ry="3" fill="#2C3E50" />
          <ellipse cx="34" cy="22" rx="4" ry="3" fill="#2C3E50" />
          {isHit && (
            <>
              <path d="M17 26 Q16 32 18 34" fill="none" stroke="#5DADE2" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M35 26 Q36 32 34 34" fill="none" stroke="#5DADE2" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
          <path d={isHit ? "M19 35 Q26 38 33 35" : "M20 34 Q26 36 32 34"} fill="none" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 15 Q26 10 40 15" fill="none" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case "bonk":
      return (
        <svg {...baseProps} className="drop-shadow">
          <circle cx="26" cy="26" r="23" fill="#E67E22" stroke="#C0392B" strokeWidth="3" />
          <rect x="14" y="18" width="24" height="12" rx="2" fill="#7F8C8D" stroke="#2C3E50" strokeWidth="2" />
          <rect x="17" y="20" width="18" height="8" fill="#95A5A6" />
          <rect x="24" y="30" width="4" height="16" fill="#8E44AD" stroke="#5B2C6F" strokeWidth="1" />
          <text x="26" y="27" textAnchor="middle" fill="#C0392B" fontSize="11" fontWeight="900" fontFamily="monospace">
            {isHit ? "BONK" : "BONK"}
          </text>
          {isHit && <circle cx="26" cy="26" r="19" fill="none" stroke="#C0392B" strokeWidth="1.5" opacity="0.6" />}
        </svg>
      );

    case "moon":
      return (
        <svg {...baseProps} className="drop-shadow">
          <circle cx="26" cy="26" r="23" fill="#5B2C6F" stroke="#8E44AD" strokeWidth="2.5" />
          <path d="M18 14 Q32 18 32 32 Q26 28 18 32 Z" fill="#F4D03F" />
          <circle cx="35" cy="15" r="2.2" fill="#F4D03F" />
          <circle cx="38" cy="28" r="1.6" fill="#F4D03F" />
          {isHit && (
            <>
              <circle cx="40" cy="10" r="1.8" fill="#F4D03F" />
              <circle cx="42" cy="22" r="1.4" fill="#F4D03F" />
              <path d="M30 12 L33 8 L36 12" fill="none" stroke="#F4D03F" strokeWidth="1.2" />
            </>
          )}
          <circle cx="24" cy="24" r="2" fill="#2C3E50" />
          <circle cx="30" cy="24" r="2" fill="#2C3E50" />
          <path d={isHit ? "M23 30 Q27 33 31 30" : "M23 29 Q27 31 31 29"} fill="none" stroke="#2C3E50" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case "lmao":
      return (
        <svg {...baseProps} className="drop-shadow">
          <circle cx="26" cy="26" r="23" fill="#F1C40F" stroke="#D4AC0D" strokeWidth="2.5" />
          <circle cx="18" cy="20" r="4" fill="#2C3E50" />
          <circle cx="34" cy="20" r="4" fill="#2C3E50" />
          {isHit && (
            <>
              <circle cx="16" cy="27" r="1.8" fill="#3498DB" />
              <circle cx="36" cy="27" r="1.8" fill="#3498DB" />
              <path d="M16 29 Q15 33 17 34" fill="none" stroke="#3498DB" strokeWidth="1.2" />
              <path d="M36 29 Q37 33 35 34" fill="none" stroke="#3498DB" strokeWidth="1.2" />
            </>
          )}
          <path d={isHit ? "M15 32 Q26 42 37 32" : "M16 33 Q26 39 36 33"} fill="#2C3E50" />
          <path d="M18 34 Q26 37 34 34" fill="none" stroke="#F1C40F" strokeWidth="2" />
          {isHit && <text x="26" y="46" textAnchor="middle" fill="#E74C3C" fontSize="8" fontWeight="900">LMAO</text>}
        </svg>
      );

    default:
      return <div className="text-3xl">🪙</div>;
  }
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