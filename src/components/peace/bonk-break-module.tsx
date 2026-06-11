"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { playBonkSound } from "@/lib/bonk-sound";
import { BonkEffects, type BonkEffect } from "@/components/miner/bonk-effects";
import { RotateCcw } from "lucide-react";

const DURATION_SEC = 60;

export function BonkBreakModule() {
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState(DURATION_SEC);
  const [bonkCount, setBonkCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [effects, setEffects] = useState<BonkEffect[]>([]);
  const [bonkTrigger, setBonkTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing || finished) return;
    if (remaining <= 0) {
      setPlaying(false);
      setFinished(true);
      return;
    }
    const id = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, remaining, finished]);

  const handleBonk = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!playing) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      let clientX: number;
      let clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0]?.clientX ?? rect.width / 2;
        clientY = e.touches[0]?.clientY ?? rect.height / 2;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      playBonkSound(1 + Math.min(bonkCount * 0.02, 0.5));
      setBonkCount((c) => c + 1);
      setBonkTrigger((t) => t + 1);

      const id = `bonk-${Date.now()}`;
      const star1Id = `star1-${Date.now()}`;
      const star2Id = `star2-${Date.now()}`;

      // Position extra stars at the head area
      const headCenterX = rect.width * 0.5;
      const headCenterY = rect.height * 0.42;

      setEffects((prev) => [
        ...prev.slice(-6),
        { id, x, y, type: "bonk" },
        { id: star1Id, x: headCenterX - 18, y: headCenterY - 12, type: "star" },
        { id: star2Id, x: headCenterX + 22, y: headCenterY - 8, type: "star" },
      ]);

      window.setTimeout(() => {
        setEffects((prev) => prev.filter((ef) => ef.id !== id && ef.id !== star1Id && ef.id !== star2Id));
      }, 820);
    },
    [playing, bonkCount]
  );

  const restart = () => {
    setPlaying(false);
    setRemaining(DURATION_SEC);
    setBonkCount(0);
    setFinished(false);
    setEffects([]);
    setBonkTrigger(0);
  };

  const progressPct = ((DURATION_SEC - remaining) / DURATION_SEC) * 100;

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bonga-card border-bonga-orange/40 bg-bonga-orange/5 p-8 text-center"
      >
        <p className="text-4xl">🐕</p>
        <h3 className="mt-2 font-display text-xl font-bold">Bonk break complete</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You released {bonkCount} bonk{bonkCount === 1 ? "" : "s"} of stress.
          Go be peaceful out there.
        </p>
        <Button variant="peace" className="mt-6" onClick={restart}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="bonga-card overflow-hidden p-0">
      <div
        ref={containerRef}
        className="relative flex min-h-[420px] flex-col items-center justify-center bg-gradient-to-br from-bonga-orange/10 via-muted/30 to-bonga-purple/10 p-8"
        onClick={handleBonk}
        onTouchStart={handleBonk}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (playing) {
              playBonkSound(1);
              setBonkCount((c) => c + 1);
              setBonkTrigger((t) => t + 1);
            }
          }
        }}
      >
        <BonkEffects effects={effects} />

        {!playing ? (
          <div className="relative z-10 text-center">
            {/* Preview using the exact BONK meme style Shiba Inu image you referenced.
                The wooden club is overlaid in raised position.
                Download the image from the link you provided and save it as /public/bonk-shiba.jpg */}
            <div className="relative mx-auto mb-3 w-48 h-40">
              <img 
                src="/bonk-shiba.jpg" 
                alt="Shiba Inu getting bonked with wooden club" 
                className="w-full h-full object-contain" 
              />
              {/* Static wooden club for preview (raised) */}
              <div className="absolute right-[-5px] top-[-8px] w-12 h-20 opacity-80">
                <svg viewBox="0 0 48 80" className="w-full h-full">
                  <rect x="20" y="5" width="8" height="55" fill="#8B5A2B" rx="2" />
                  <rect x="12" y="0" width="24" height="16" rx="4" fill="#6B4423" />
                  <text x="24" y="11" textAnchor="middle" fill="#3F2A1A" fontSize="7" fontWeight="bold">BONK</text>
                </svg>
              </div>
            </div>

            <h3 className="mt-2 font-display text-xl font-bold">Bonk Break</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              One minute. Tap the Shiba Inu with the wooden BONK club to release stress.
              Uses the exact meme style image you wanted + wood club.
            </p>
            <Button
              variant="peace"
              size="lg"
              className="mt-4"
              onClick={(e) => {
                e.stopPropagation();
                setPlaying(true);
              }}
            >
              Start 1-min break
            </Button>
          </div>
        ) : (
          <div className="relative z-10 w-full max-w-sm text-center">
            {/* The dog uses the exact BONK meme Shiba Inu image you linked (save as /public/bonk-shiba.jpg).
                A wooden club bonker swings down from the right to hit the head on every tap.
                X eyes, tongue, and stars appear on the hit as requested. */}
            <div className="relative mx-auto mb-3 w-56 h-48">
              <img 
                src="/bonk-shiba.jpg" 
                alt="Shiba Inu getting bonked" 
                className="w-full h-full object-contain" 
              />

              {/* Animated wooden club (pure wood bonker style, no hammer/red pad) */}
              <motion.div
                key={`club-${bonkTrigger}`}
                className="absolute right-[-8px] top-[-5px] w-14 h-24 pointer-events-none"
                initial={{ rotate: -55, x: 25, y: -12 }}
                animate={{ rotate: 18, x: -2, y: 22 }}
                transition={{ duration: 0.26, ease: "easeOut" }}
              >
                <svg viewBox="0 0 56 96" className="w-full h-full drop-shadow">
                  {/* Wooden handle */}
                  <rect x="24" y="8" width="8" height="65" fill="#8B5A2B" rx="2" />
                  <line x1="26" y1="12" x2="26" y2="68" stroke="#5C3A1E" strokeWidth="1.2" opacity="0.5" />
                  {/* Wooden club head (traditional bonker style) */}
                  <rect x="14" y="0" width="28" height="18" rx="5" fill="#6B4423" />
                  {/* BONK text on the wood */}
                  <text x="28" y="13" textAnchor="middle" fill="#3F2A1A" fontSize="8" fontWeight="bold">BONK</text>
                </svg>
              </motion.div>

              {/* X eyes overlay - shows upon bonking */}
              <motion.div
                key={`xeyes-${bonkTrigger}`}
                className="absolute left-[26%] top-[30%] text-white text-3xl font-black pointer-events-none drop-shadow"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: [0, 1, 1, 0.85], scale: [0.7, 1.1, 1, 0.95] }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                X   X
              </motion.div>

              {/* Tongue sticks out on bonk */}
              <motion.div
                key={`tongue-${bonkTrigger}`}
                className="absolute left-[38%] top-[52%] text-pink-500 text-2xl pointer-events-none"
                initial={{ opacity: 0, y: 0, scaleY: 0.4 }}
                animate={{ opacity: [0, 1, 1, 0.75], y: [0, 6, 3], scaleY: [0.4, 1.2, 1] }}
                transition={{ duration: 0.65, ease: "easeOut" }}
              >
                👅
              </motion.div>

              {/* Stars above the head on bonk */}
              <motion.div
                key={`stars-${bonkTrigger}`}
                className="absolute left-[32%] top-[12%] text-yellow-400 text-xl pointer-events-none"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: [0, 1, 0], y: [5, -8, -18] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                ✦ ✦ ✦
              </motion.div>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Tap Bonga to bonk the stress away · {bonkCount} bonks
            </p>
            <p className="mt-4 text-3xl font-bold tabular-nums">
              {remaining}s
            </p>
            <Progress value={progressPct} className="mt-4 h-2" />
          </div>
        )}
      </div>
    </div>
  );
}
