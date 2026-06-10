"use client";

import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface BongaBonkCharacterProps {
  isBonking: boolean;
  bonkAngle: number;
  clubScale?: number;
}

const MAIN_SPRITE = "/bonga-character.png";
const SWING_SRC = "/characters/bonga-swing-impact.png";
const HAPPY_SRC = "/characters/bonga-bonk-happy.png";

export function BongaBonkCharacter({
  isBonking,
  bonkAngle: _bonkAngle,
  clubScale: _clubScale = 1,
}: BongaBonkCharacterProps) {
  const bodyControls = useAnimation();
  const [showHappy, setShowHappy] = useState(false);
  const [usePng, setUsePng] = useState(true);

  useEffect(() => {
    if (isBonking) {
      setShowHappy(false);
      void bodyControls.start({
        scale: [1, 1.1, 0.95, 1.04, 1],
        y: [0, -10, 6, -4, 0],
        rotate: [0, -4, 5, -2, 0],
        transition: { duration: 0.38, ease: "easeOut" },
      });
      const happyTimer = setTimeout(() => setShowHappy(true), 280);
      const resetTimer = setTimeout(() => setShowHappy(false), 520);
      return () => {
        clearTimeout(happyTimer);
        clearTimeout(resetTimer);
      };
    }
    setShowHappy(false);
  }, [isBonking, bodyControls]);

  const activeSrc = showHappy ? HAPPY_SRC : isBonking ? SWING_SRC : MAIN_SPRITE;

  if (!usePng) {
    return <BongaSvgFallback isBonking={isBonking} />;
  }

  return (
    <motion.div
      className="relative z-20 flex flex-col items-center"
      animate={isBonking ? bodyControls : { y: [0, -6, 0] }}
      transition={
        isBonking
          ? undefined
          : { repeat: Infinity, duration: 3.6, ease: "easeInOut" }
      }
    >
      <div className="absolute inset-0 -m-14 rounded-full bg-gradient-to-br from-bonga-orange/14 via-transparent to-emerald-400/10 blur-3xl" />

      <motion.div
        className="relative h-64 w-64 bg-transparent sm:h-80 sm:w-80 md:h-[22rem] md:w-[22rem]"
        animate={
          isBonking
            ? {
                rotate: [0, -4, 5, -1.5, 0],
                scale: [1, 1.08, 0.96, 1.03, 1],
              }
            : { y: [0, -6, 0], rotate: [0, 1.2, -0.8, 0] }
        }
        transition={
          isBonking
            ? { duration: 0.38, ease: "easeOut" }
            : { repeat: Infinity, duration: 3.8, ease: "easeInOut" }
        }
      >
        {isBonking && (
          <>
            {/* Enhanced club whoosh / impact lines */}
            <motion.span
              className="pointer-events-none absolute -right-3 top-6 h-1.5 w-14 rounded-full bg-bonga-orange"
              initial={{ opacity: 0, x: -12, rotate: -25 }}
              animate={{ opacity: [0, 1, 0], x: [0, 24, 38], rotate: [-25, 12, 32] }}
              transition={{ duration: 0.34 }}
            />
            <motion.span
              className="pointer-events-none absolute right-2 top-14 h-1 w-11 rounded-full bg-yellow-400"
              initial={{ opacity: 0, x: -6, rotate: -14 }}
              animate={{ opacity: [0, 0.95, 0], x: [0, 18, 30], rotate: [-14, 18, 26] }}
              transition={{ duration: 0.3, delay: 0.03 }}
            />
            <motion.span
              className="pointer-events-none absolute -left-2 top-18 h-1 w-9 rounded-full bg-bonga-orange/85"
              initial={{ opacity: 0, x: 8, rotate: 14 }}
              animate={{ opacity: [0, 0.85, 0], x: [-10, -24, -34], rotate: [14, -10, -20] }}
              transition={{ duration: 0.36, delay: 0.02 }}
            />
            {/* Extra impact burst */}
            <motion.span
              className="pointer-events-none absolute right-6 top-10 h-0.5 w-6 bg-white/70"
              initial={{ opacity: 0, scaleX: 0.2 }}
              animate={{ opacity: [0, 1, 0], scaleX: [0.2, 1.8, 0.6] }}
              transition={{ duration: 0.26, delay: 0.06 }}
            />
          </>
        )}

        <Image
          key={activeSrc}
          src={activeSrc}
          alt="Bonga — orange Shiba with dreadlocks, striped headband, bonk club, and $BONGA"
          fill
          priority
          unoptimized
          className="object-contain bg-transparent drop-shadow-2xl"
          sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 352px"
          onError={() => setUsePng(false)}
        />
      </motion.div>
    </motion.div>
  );
}

/** Much nicer full custom SVG Bonga as fallback (with club and personality) */
function BongaSvgFallback({ isBonking }: { isBonking: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 320 400"
      className="relative h-64 w-64 drop-shadow-2xl sm:h-80 sm:w-80"
      aria-hidden
      animate={
        isBonking
          ? { scale: [1, 1.09, 0.96, 1.02, 1], rotate: [0, -4, 4.5, -1.2, 0] }
          : { y: [0, -6, 0], rotate: [0, 1.4, -1, 0] }
      }
      transition={
        isBonking
          ? { duration: 0.4, ease: "easeOut" }
          : { repeat: Infinity, duration: 3.9, ease: "easeInOut" }
      }
    >
      {/* Body / fluff */}
      <ellipse cx="160" cy="260" rx="78" ry="92" fill="#FF8C42" stroke="#E65C00" strokeWidth="8" />
      {/* Head */}
      <circle cx="160" cy="148" r="68" fill="#FF8C42" stroke="#E65C00" strokeWidth="7" />
      {/* Ears */}
      <ellipse cx="102" cy="92" rx="22" ry="32" fill="#FF8C42" stroke="#E65C00" strokeWidth="6" transform="rotate(-28 102 92)" />
      <ellipse cx="218" cy="92" rx="22" ry="32" fill="#FF8C42" stroke="#E65C00" strokeWidth="6" transform="rotate(28 218 92)" />
      {/* Headband */}
      <rect x="92" y="118" width="136" height="18" rx="4" fill="#2DB8A8" />
      {/* Eyes */}
      <ellipse cx="128" cy="142" rx="11" ry="15" fill="#2C3E50" />
      <ellipse cx="192" cy="142" rx="11" ry="15" fill="#2C3E50" />
      {/* Eye shine */}
      <ellipse cx="132" cy="136" rx="3.5" ry="4" fill="#fff" />
      <ellipse cx="196" cy="136" rx="3.5" ry="4" fill="#fff" />
      {/* Snout */}
      <ellipse cx="160" cy="172" rx="22" ry="14" fill="#FFF" stroke="#E65C00" strokeWidth="3" />
      <circle cx="148" cy="170" r="3.5" fill="#2C3E50" />
      <circle cx="172" cy="170" r="3.5" fill="#2C3E50" />
      {/* Dreadlocks */}
      <path d="M108 168 Q98 210 112 248" fill="none" stroke="#8B5CF6" strokeWidth="7" strokeLinecap="round" />
      <path d="M212 168 Q222 210 208 248" fill="none" stroke="#8B5CF6" strokeWidth="7" strokeLinecap="round" />
      {/* Bonk Club */}
      <g transform={isBonking ? "rotate(-28 210 210)" : "rotate(-12 210 210)"}>
        <rect x="198" y="148" width="14" height="92" rx="3" fill="#5B2C6F" stroke="#3D1F4D" strokeWidth="3" />
        <rect x="188" y="142" width="34" height="18" rx="4" fill="#E74C3C" stroke="#C0392B" strokeWidth="3" />
      </g>
      {/* Subtle breathing / idle fluff lines */}
      {!isBonking && (
        <g opacity="0.25">
          <ellipse cx="160" cy="258" rx="52" ry="14" fill="none" stroke="#fff" strokeWidth="3" />
        </g>
      )}
    </motion.svg>
  );
}