"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { peaceNarration } from "@/lib/audio/peace-narration";
import {
  BongaAffirmation,
  CATEGORY_LABELS,
  claimAffirmation,
  getAffirmationById,
  getRandomAffirmation,
  getTodaysAffirmation,
  loadAffirmationStreak,
  loadClaimedAffirmation,
} from "@/lib/bonga-affirmations";

export function DailyAffirmations() {
  const todaysPick = getTodaysAffirmation();
  const [affirmation, setAffirmation] = useState<BongaAffirmation>(todaysPick);
  const [claimed, setClaimed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const existing = loadClaimedAffirmation();
    if (existing) {
      const saved = getAffirmationById(existing.affirmationId);
      if (saved) setAffirmation(saved);
      setClaimed(true);
    }
    setStreak(loadAffirmationStreak());
  }, []);

  useEffect(() => {
    if (!isSpeaking) return;
    const id = window.setInterval(() => {
      if (!peaceNarration.isSpeaking()) setIsSpeaking(false);
    }, 300);
    return () => window.clearInterval(id);
  }, [isSpeaking]);

  const handleClaim = () => {
    claimAffirmation(affirmation.id);
    setClaimed(true);
    setStreak(loadAffirmationStreak());
  };

  const handleAnother = () => {
    const next = getRandomAffirmation(affirmation.id);
    setAffirmation(next);
    setClaimed(false);
    peaceNarration.cancel();
    setIsSpeaking(false);
  };

  const handleSpeak = () => {
    peaceNarration.warmUp();
    if (isSpeaking) {
      peaceNarration.cancel();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    void peaceNarration.speak(
      `${affirmation.text} Peace, love, good bonks.`,
      { rate: 0.78 }
    );
  };

  const categoryLabel = CATEGORY_LABELS[affirmation.category];
  const isTodaysRotation = affirmation.id === todaysPick.id;

  return (
    <div className="bonga-card overflow-hidden p-0">
      <div className="flex flex-col sm:flex-row">
        <div className="relative flex shrink-0 items-center justify-center bg-gradient-to-br from-bonga-purple/10 via-bonga-teal/5 to-bonga-orange/10 px-6 py-8 sm:w-40">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28">
            <Image
              src="/nft/traits/bonga-01-peaceful.png"
              alt="Peaceful Bonga"
              fill
              className="object-contain drop-shadow-md"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-bold">Today&apos;s Affirmation</h3>
              {streak > 0 && (
                <span className="rounded-full bg-bonga-orange/10 px-3 py-1 text-xs font-semibold text-bonga-orange">
                  {streak}-day streak ✨
                </span>
              )}
            </div>
            <span className="rounded-full border border-bonga-teal/30 bg-bonga-teal/5 px-3 py-1 text-xs font-medium text-bonga-teal">
              {affirmation.emoji} {categoryLabel}
            </span>
          </div>

          {!isTodaysRotation && (
            <p className="mt-2 text-xs text-muted-foreground">
              Bonus pick — today&apos;s rotation is still waiting when you&apos;re ready.
            </p>
          )}

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={affirmation.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-4 font-display text-xl font-semibold leading-snug md:text-2xl"
            >
              &ldquo;{affirmation.text}&rdquo;
            </motion.blockquote>
          </AnimatePresence>

          <p className="mt-3 text-xs text-muted-foreground">
            Say it slow. Mean it soft. Peace, love, good bonks.
          </p>

          {claimed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-5 rounded-bonga-lg border border-bonga-purple/30 bg-bonga-purple/5 px-4 py-3 text-center"
            >
              <p className="text-sm font-medium">Frequency raised for today ✌️</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setClaimed(false)}
              >
                Reflect again
              </Button>
            </motion.div>
          ) : (
            <Button
              variant="peace"
              className="mt-5 w-full"
              onClick={handleClaim}
            >
              I receive this
            </Button>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleAnother}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Another one
            </Button>
            {peaceNarration.isSupported() && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={handleSpeak}
              >
                <Volume2 className="h-3.5 w-3.5" />
                {isSpeaking ? "Stop" : "Hear it"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}