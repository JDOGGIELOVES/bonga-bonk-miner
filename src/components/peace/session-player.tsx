"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getTraitPose } from "@/lib/nft-trait-poses";
import { peaceAudio, type PeaceMusicMode } from "@/lib/audio/peace-audio";
import { peaceNarration } from "@/lib/audio/peace-narration";
import { PeaceAudioToggle } from "@/components/peace/peace-audio-toggle";
import { TaiChiPoseDiagram } from "@/components/peace/tai-chi-pose-diagram";
import { ChevronLeft, Pause, Play, RotateCcw } from "lucide-react";

export interface SessionStep {
  title: string;
  instruction: string;
  durationSec: number;
  poseStart?: string;
  poseMiddle?: string;
  poseEnd?: string;
}

export interface GuidedSession {
  id: string;
  title: string;
  guideTraitId: number;
  steps: SessionStep[];
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getTotalSeconds(steps: SessionStep[]): number {
  return steps.reduce((sum, step) => sum + step.durationSec, 0);
}

export function SessionPlayer({
  session,
  onBack,
  completeMessage = "You showed up for peace. That's the Bonga way.",
  onComplete,
  soundEnabled = true,
  musicMode = "ambient",
}: {
  session: GuidedSession;
  onBack: () => void;
  completeMessage?: string;
  onComplete?: () => void;
  soundEnabled?: boolean;
  musicMode?: PeaceMusicMode;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(session.steps[0]?.durationSec ?? 0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  const step = session.steps[stepIndex];
  const totalSec = getTotalSeconds(session.steps);
  const elapsedBefore =
    session.steps.slice(0, stepIndex).reduce((n, s) => n + s.durationSec, 0) +
    (step ? step.durationSec - remaining : 0);
  const progressPct = Math.min(100, (elapsedBefore / totalSec) * 100);

  const pose = getTraitPose(session.guideTraitId);
  const guideImage = pose?.image ?? "/bonga-character.png";

  const completedRef = useRef(false);
  const sessionStartedRef = useRef(false);
  const lastNarratedStepRef = useRef(-1);

  const narrateStep = useCallback(
    (index: number, withIntro = false) => {
      if (!soundEnabled) return;
      const s = session.steps[index];
      if (!s) return;
      const intro = withIntro
        ? `Hey there. Welcome to ${session.title}. Move slowly and gently with me.`
        : undefined;
      peaceNarration.speakStep(s.title, s.instruction, { intro });
      lastNarratedStepRef.current = index;
    },
    [soundEnabled, session]
  );

  useEffect(() => {
    return () => {
      if (soundEnabled) peaceAudio.stopSession();
      peaceNarration.cancel();
    };
  }, [soundEnabled]);

  useEffect(() => {
    if (finished && !completedRef.current) {
      completedRef.current = true;
      if (soundEnabled) {
        peaceAudio.endSession();
        peaceNarration.speakComplete(completeMessage);
      }
      onComplete?.();
    }
    if (!finished) completedRef.current = false;
  }, [finished, onComplete, soundEnabled, completeMessage]);

  useEffect(() => {
    if (!playing || finished || !soundEnabled || !sessionStartedRef.current) return;
    if (lastNarratedStepRef.current === stepIndex) return;

    const timer = window.setTimeout(() => {
      narrateStep(stepIndex);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [stepIndex, playing, finished, soundEnabled, narrateStep]);

  const goNext = useCallback(() => {
    if (stepIndex >= session.steps.length - 1) {
      setPlaying(false);
      setFinished(true);
      return;
    }
    peaceNarration.cancel();
    if (soundEnabled) peaceAudio.playStepChange();
    const next = stepIndex + 1;
    setStepIndex(next);
    setRemaining(session.steps[next].durationSec);
  }, [stepIndex, session.steps, soundEnabled]);

  const handleBack = () => {
    if (soundEnabled) peaceAudio.stopSession();
    peaceNarration.cancel();
    onBack();
  };

  const togglePlaying = () => {
    setPlaying((wasPlaying) => {
      const next = !wasPlaying;

      if (next) {
        if (!sessionStartedRef.current) {
          sessionStartedRef.current = true;
          if (soundEnabled) {
            void peaceAudio.resume().then(() => peaceAudio.startSession(musicMode));
            lastNarratedStepRef.current = stepIndex;
            window.setTimeout(() => narrateStep(stepIndex, true), 900);
          }
        } else if (soundEnabled) {
          void peaceAudio.resume().then(() => peaceAudio.resumeSession());
          if (peaceNarration.isPaused()) {
            peaceNarration.resume();
          } else if (!peaceNarration.isSpeaking()) {
            narrateStep(stepIndex);
          }
        }
      } else {
        if (soundEnabled) peaceAudio.pauseSession();
        peaceNarration.pause();
      }

      return next;
    });
  };

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
    if (soundEnabled) peaceAudio.stopSession();
    peaceNarration.cancel();
    sessionStartedRef.current = false;
    lastNarratedStepRef.current = -1;
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
        <p className="mt-1 text-sm text-muted-foreground">{completeMessage}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="peace" onClick={restart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Again
          </Button>
          <Button variant="outline" onClick={handleBack}>
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
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-1 h-3 w-3" />
              Back to sessions
            </button>
            {soundEnabled && <PeaceAudioToggle compact />}
          </div>

          <p className="text-xs font-semibold uppercase tracking-wide text-bonga-teal">
            Step {stepIndex + 1} of {session.steps.length}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold">{step?.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {step?.instruction}
          </p>

          {step?.poseStart && step?.poseMiddle && step?.poseEnd && (
            <TaiChiPoseDiagram
              poseStart={step.poseStart}
              poseMiddle={step.poseMiddle}
              poseEnd={step.poseEnd}
            />
          )}

          <div className="mt-6 flex-1">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatTime(remaining)} left</span>
              <span>{session.title}</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="peace" className="flex-1" onClick={togglePlaying}>
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