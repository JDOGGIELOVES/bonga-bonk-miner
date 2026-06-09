"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getSessionTotalSeconds,
  TAI_CHI_SESSIONS,
  type TaiChiSession,
} from "@/lib/bonga-tai-chi";
import { getTraitPose } from "@/lib/nft-trait-poses";
import { ChevronLeft, Pause, Play, RotateCcw } from "lucide-react";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SessionPlayer({
  session,
  onBack,
}: {
  session: TaiChiSession;
  onBack: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(session.steps[0]?.durationSec ?? 0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  const step = session.steps[stepIndex];
  const totalSec = getSessionTotalSeconds(session);
  const elapsedBefore =
    session.steps.slice(0, stepIndex).reduce((n, s) => n + s.durationSec, 0) +
    (step ? step.durationSec - remaining : 0);
  const progressPct = Math.min(100, (elapsedBefore / totalSec) * 100);

  const pose = getTraitPose(session.guideTraitId);
  const guideImage = pose?.image ?? "/bonga-character.png";

  const goNext = useCallback(() => {
    if (stepIndex >= session.steps.length - 1) {
      setPlaying(false);
      setFinished(true);
      return;
    }
    const next = stepIndex + 1;
    setStepIndex(next);
    setRemaining(session.steps[next].durationSec);
  }, [stepIndex, session.steps]);

  useEffect(() => {
    if (!playing || finished || !step) return;
    if (remaining <= 0) {
      goNext();
      return;
    }
    const id = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, remaining, finished, step, goNext]);

  const restart = () => {
    setStepIndex(0);
    setRemaining(session.steps[0].durationSec);
    setPlaying(false);
    setFinished(false);
  };

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bonga-card border-bonga-green/40 bg-bonga-green/5 p-6 text-center"
      >
        <p className="text-4xl">✌️</p>
        <h3 className="mt-2 font-display text-xl font-bold">Session complete</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You showed up for peace. That&apos;s the Bonga way.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="peace" onClick={restart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Again
          </Button>
          <Button variant="outline" onClick={onBack}>
            All sessions
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bonga-card overflow-hidden p-0"
    >
      <div className="grid gap-0 md:grid-cols-2">
        <div className="relative flex min-h-[220px] items-end justify-center bg-gradient-to-br from-bonga-orange/15 via-bonga-teal/10 to-bonga-purple/15 p-6">
          <div className="relative h-44 w-44 md:h-52 md:w-52">
            <Image
              src={guideImage}
              alt="Bonga guide"
              fill
              className="object-contain drop-shadow-lg"
              sizes="(max-width: 768px) 176px, 208px"
            />
          </div>
        </div>

        <div className="flex flex-col p-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-3 flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-3 w-3" />
            Back to sessions
          </button>

          <p className="text-xs font-semibold uppercase tracking-wide text-bonga-teal">
            Step {stepIndex + 1} of {session.steps.length}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold">{step?.title}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {step?.instruction}
          </p>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatTime(remaining)} left</span>
              <span>{session.title}</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="peace"
              className="flex-1"
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
                  {stepIndex === 0 && remaining === step?.durationSec
                    ? "Begin"
                    : "Resume"}
                </>
              )}
            </Button>
            {stepIndex < session.steps.length - 1 && (
              <Button variant="outline" onClick={goNext}>
                Skip
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TaiChiSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = TAI_CHI_SESSIONS.find((s) => s.id === activeId);

  return (
    <section id="peace" className="section-anchor bg-muted/20 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center font-display text-3xl font-bold">
          Bonga <span className="text-gradient">Tai Chi</span>
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Slow flows, deep breaths, zero stress — guided sessions in the Bonga way
        </p>
        <p className="mx-auto mt-2 max-w-xl text-center text-xs text-muted-foreground">
          Gentle movement for relaxation and focus. Not medical advice — listen to
          your body and move within your comfort.
        </p>

        <AnimatePresence mode="wait">
          {active ? (
            <div className="mt-10" key={active.id}>
              <SessionPlayer session={active} onBack={() => setActiveId(null)} />
            </div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10 grid gap-4 sm:grid-cols-2"
            >
              {TAI_CHI_SESSIONS.map((session, i) => (
                <motion.button
                  key={session.id}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setActiveId(session.id)}
                  className="bonga-card group p-5 text-left transition-colors hover:border-bonga-teal/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl">{session.emoji}</span>
                    <span className="rounded-full bg-bonga-teal/10 px-2 py-0.5 text-xs font-semibold text-bonga-teal">
                      {session.durationMin} min
                    </span>
                  </div>
                  <h3 className="mt-3 font-display font-bold group-hover:text-bonga-orange">
                    {session.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {session.subtitle}
                  </p>
                  <p className="mt-2 text-xs text-bonga-purple">{session.vibe}</p>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}