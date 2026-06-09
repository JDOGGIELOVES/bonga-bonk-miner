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
  };

  const progressPct = ((DURATION_SEC - remaining) / DURATION_SEC) * 100;

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bonga-card border-bonga-orange/40 bg-bonga-orange/5 p-8 text-center"
      >
        <p className="text-4xl">🪵</p>
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
            }
          }
        }}
      >
        <BonkEffects effects={effects} />

        {!playing ? (
          <div className="relative z-10 text-center">
            <p className="text-5xl">🪵</p>
            <h3 className="mt-4 font-display text-xl font-bold">Bonk Break</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              One minute. Tap anywhere to bonk the stress out. Playful release —
              not punching walls.
            </p>
            <Button
              variant="peace"
              size="lg"
              className="mt-6"
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
            <motion.p
              className="font-display text-6xl font-extrabold text-bonga-orange"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              BONK!
            </motion.p>
            <p className="mt-2 text-sm text-muted-foreground">
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