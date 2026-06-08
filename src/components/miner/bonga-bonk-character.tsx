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
                rotate: [0, -3, 4, -1, 0],
                scale: [1, 1.06, 0.98, 1.02, 1],
              }
            : undefined
        }
        transition={{ duration: 0.38, ease: "easeOut" }}
      >
        {isBonking && (
          <>
            <motion.span
              className="pointer-events-none absolute -right-2 top-8 h-1 w-10 rounded-full bg-bonga-orange"
              initial={{ opacity: 0, x: -8, rotate: -20 }}
              animate={{ opacity: [0, 1, 0], x: [0, 18, 28], rotate: [-20, 10, 25] }}
              transition={{ duration: 0.32 }}
            />
            <motion.span
              className="pointer-events-none absolute right-4 top-16 h-1 w-8 rounded-full bg-yellow-400"
              initial={{ opacity: 0, x: -4, rotate: -10 }}
              animate={{ opacity: [0, 0.9, 0], x: [0, 14, 22], rotate: [-10, 15, 20] }}
              transition={{ duration: 0.3, delay: 0.04 }}
            />
            <motion.span
              className="pointer-events-none absolute -left-1 top-20 h-1 w-7 rounded-full bg-bonga-orange/80"
              initial={{ opacity: 0, x: 6, rotate: 12 }}
              animate={{ opacity: [0, 0.8, 0], x: [-8, -18, -26], rotate: [12, -8, -15] }}
              transition={{ duration: 0.34, delay: 0.02 }}
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

/** SVG fallback if PNG assets are missing */
function BongaSvgFallback({ isBonking }: { isBonking: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 320 400"
      className="relative h-64 w-64 drop-shadow-2xl sm:h-80 sm:w-80"
      aria-hidden
      animate={
        isBonking
          ? { scale: [1, 1.08, 1], rotate: [0, -3, 0] }
          : { y: [0, -5, 0] }
      }
      transition={
        isBonking
          ? { duration: 0.38 }
          : { repeat: Infinity, duration: 3.6, ease: "easeInOut" }
      }
    >
      <text x="160" y="200" textAnchor="middle" fill="#FF6200" fontSize="18" fontWeight="700">
        Bonga
      </text>
    </motion.svg>
  );
}