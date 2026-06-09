"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BREATHING_PATTERNS,
  getCycleDurationSec,
  PHASE_COLORS,
  type BreathingPattern,
  type BreathPhaseStep,
} from "@/lib/bonga-breathing";
import { ChevronLeft, Pause, Play } from "lucide-react";

function BreathingPlayer({
  pattern,
  onBack,
}: {
  pattern: BreathingPattern;
  onBack: () => void;
}) {
  const sessionSec = pattern.durationMin * 60;
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(
    pattern.cycle[0].durationSec
  );
  const [finished, setFinished] = useState(false);

  const step: BreathPhaseStep = pattern.cycle[cycleIndex];
  const cycleSec = getCycleDurationSec(pattern);

  const advancePhase = useCallback(() => {
    if (cycleIndex >= pattern.cycle.length - 1) {
      setCycleIndex(0);
      setPhaseRemaining(pattern.cycle[0].durationSec);
      return;
    }
    const next = cycleIndex + 1;
    setCycleIndex(next);
    setPhaseRemaining(pattern.cycle[next].durationSec);
  }, [cycleIndex, pattern.cycle]);

  useEffect(() => {
    if (!playing || finished) return;
    if (elapsed >= sessionSec) {
      setPlaying(false);
      setFinished(true);
      return;
    }
    if (phaseRemaining <= 0) {
      advancePhase();
      return;
    }
    const id = window.setInterval(() => {
      setElapsed((e) => e + 1);
      setPhaseRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, finished, elapsed, sessionSec, phaseRemaining, advancePhase]);

  const scale =
    step.phase === "inhale"
      ? 1 + (1 - phaseRemaining / step.durationSec) * 0.35
      : step.phase === "exhale"
        ? 1.35 - (1 - phaseRemaining / step.durationSec) * 0.35
        : 1.2;

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bonga-card border-bonga-teal/40 bg-bonga-teal/5 p-8 text-center"
      >
        <p className="text-4xl">🌬️</p>
        <h3 className="mt-2 font-display text-xl font-bold">Breath complete</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {Math.floor(sessionSec / cycleSec)} cycles of calm. The timeline can wait.
        </p>
        <Button variant="peace" className="mt-6" onClick={onBack}>
          Done
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bonga-card p-6"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="mr-1 h-3 w-3" />
        Back to patterns
      </button>

      <div className="flex flex-col items-center py-6">
        <div
          className={`relative flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br ${PHASE_COLORS[step.phase]} transition-colors duration-700`}
        >
          <motion.div
            className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-white/30 bg-card/40 backdrop-blur-sm"
            animate={{ scale }}
            transition={{ duration: step.durationSec, ease: "easeInOut" }}
          >
            <div className="text-center">
              <p className="font-display text-lg font-bold">{step.label}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-bonga-orange">
                {phaseRemaining}
              </p>
            </div>
          </motion.div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {pattern.title} · {Math.max(0, sessionSec - elapsed)}s left
        </p>
      </div>

      <Button
        variant="peace"
        className="w-full"
        onClick={() => setPlaying((p) => !p)}
      >
        {playing ? (
          <>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            {elapsed === 0 ? "Begin" : "Resume"}
          </>
        )}
      </Button>
    </motion.div>
  );
}

export function BreathingModule() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = BREATHING_PATTERNS.find((p) => p.id === activeId);

  return (
    <AnimatePresence mode="wait">
      {active ? (
        <BreathingPlayer
          key={active.id}
          pattern={active}
          onBack={() => setActiveId(null)}
        />
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          {BREATHING_PATTERNS.map((pattern, i) => (
            <motion.button
              key={pattern.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActiveId(pattern.id)}
              className="bonga-card group p-5 text-left transition-colors hover:border-bonga-teal/40"
            >
              <span className="text-3xl">{pattern.emoji}</span>
              <h3 className="mt-3 font-display font-bold group-hover:text-bonga-orange">
                {pattern.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {pattern.subtitle}
              </p>
              <p className="mt-2 text-xs font-semibold text-bonga-teal">
                {pattern.durationMin} min
              </p>
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}