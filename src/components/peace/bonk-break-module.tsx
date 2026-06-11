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
      setEffects((prev) => [...prev.slice(-8), { id, x, y, type: "bonk" }]);
      window.setTimeout(() => {
        setEffects((prev) => prev.filter((ef) => ef.id !== id));
      }, 800);
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
        className="relative flex min-h-[320px] flex-col items-center justify-center bg-gradient-to-br from-bonga-orange/10 via-muted/30 to-bonga-purple/10 p-8"
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
            {/* Preview of the tap visual: BONK CLUB bonking Shiba head */}
            <div className="relative mx-auto mb-2 w-32 h-36 opacity-90">
              {/* Shiba Inu head (static preview) */}
              <div className="absolute left-1/2 top-6 -translate-x-1/2 w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-[#FF8C42] border-[4px] border-[#E65C00]" />
                <div className="absolute -top-1.5 -left-0.5 w-7 h-9 bg-[#FF8C42] border-2 border-[#E65C00] rounded-full -rotate-[30deg]" />
                <div className="absolute -top-1.5 -right-0.5 w-7 h-9 bg-[#FF8C42] border-2 border-[#E65C00] rounded-full rotate-[30deg]" />
                <div className="absolute top-5 left-1 right-1 h-2 bg-[#2DB8A8] rounded-sm" />
                <div className="absolute top-7 left-4 w-2 h-3 bg-[#2C3E50] rounded-full" />
                <div className="absolute top-7 right-4 w-2 h-3 bg-[#2C3E50] rounded-full" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-7 h-4 bg-[#FDEBD0] rounded-full border border-[#E65C00]" />
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-[#2C3E50] rounded" />
              </div>
              {/* Static BONK CLUB preview */}
              <div className="absolute right-1 top-1 w-3 origin-[35%_15%] -rotate-[40deg]">
                <div className="w-1 h-16 bg-[#5B2C6F] mx-auto rounded-full" />
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-[#E74C3C] rounded border border-[#C0392B]" />
              </div>
            </div>

            <h3 className="mt-2 font-display text-xl font-bold">Bonk Break</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              One minute. Tap to swing the BONK CLUB and bonk the Shiba Inu on the
              head. Playful stress release.
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
            {/* Visual: BONK CLUB bonking a Shiba Inu on the head — plays on every tap */}
            <div className="relative mx-auto mb-2 w-40 h-44">
              {/* Shiba Inu head */}
              <motion.div
                key={`shiba-${bonkTrigger}`}
                className="absolute left-1/2 top-8 -translate-x-1/2 w-28 h-28"
                animate={{
                  rotate: [0, -7, 5, 0],
                  scale: [1, 0.9, 1.03, 1],
                }}
                transition={{ duration: 0.32 }}
              >
                {/* Head */}
                <div className="absolute inset-0 rounded-full bg-[#FF8C42] border-[5px] border-[#E65C00]" />
                {/* Ears */}
                <div className="absolute -top-2 -left-1 w-9 h-12 bg-[#FF8C42] border-2 border-[#E65C00] rounded-full -rotate-[30deg]" />
                <div className="absolute -top-2 -right-1 w-9 h-12 bg-[#FF8C42] border-2 border-[#E65C00] rounded-full rotate-[30deg]" />
                {/* Headband (classic Bonga teal) */}
                <div className="absolute top-[22px] left-1 right-1 h-[9px] bg-[#2DB8A8] rounded-sm" />
                {/* Eyes */}
                <div className="absolute top-[32px] left-[22px] w-[7px] h-[9px] bg-[#2C3E50] rounded-full" />
                <div className="absolute top-[32px] right-[22px] w-[7px] h-[9px] bg-[#2C3E50] rounded-full" />
                {/* Snout */}
                <div className="absolute bottom-[18px] left-1/2 -translate-x-1/2 w-9 h-5 bg-[#FDEBD0] rounded-full border border-[#E65C00]" />
                {/* Nose */}
                <div className="absolute bottom-[22px] left-1/2 -translate-x-1/2 w-[5px] h-[3px] bg-[#2C3E50] rounded" />
              </motion.div>

              {/* BONK CLUB — swings down to bonk the head on each tap */}
              <motion.div
                key={`club-${bonkTrigger}`}
                className="absolute right-[2px] top-[2px] w-4 origin-[35%_15%]"
                initial={{ rotate: -48, y: -55, x: 38 }}
                animate={{ rotate: 18, y: 22, x: 8 }}
                transition={{ duration: 0.26, ease: "easeOut" }}
              >
                {/* Handle */}
                <div className="w-[5px] h-20 bg-[#5B2C6F] mx-auto rounded-full" />
                {/* Club head (striking part) */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-[13px] bg-[#E74C3C] rounded border-[1.5px] border-[#C0392B]" />
              </motion.div>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Tap to release · {bonkCount} bonks
            </p>
            <p className="mt-4 text-2xl font-bold tabular-nums">
              {remaining}s
            </p>
            <Progress value={progressPct} className="mt-4 h-2" />
          </div>
        )}
      </div>
    </div>
  );
}