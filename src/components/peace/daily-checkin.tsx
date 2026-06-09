"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  getTodayPrompt,
  loadCheckIn,
  loadStreak,
  MOOD_OPTIONS,
  saveCheckIn,
} from "@/lib/bonga-peace-checkin";

export function DailyCheckIn() {
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [streak, setStreak] = useState(0);
  const prompt = getTodayPrompt();

  useEffect(() => {
    const existing = loadCheckIn();
    if (existing) {
      setMood(existing.mood);
      setNote(existing.note ?? "");
      setSaved(true);
    }
    setStreak(loadStreak());
  }, []);

  const handleSave = () => {
    if (!mood) return;
    saveCheckIn(mood, note.trim() || undefined);
    setSaved(true);
    setStreak(loadStreak());
  };

  return (
    <div className="bonga-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold">Daily Peace Check-in</h3>
        {streak > 0 && (
          <span className="rounded-full bg-bonga-purple/10 px-3 py-1 text-xs font-semibold text-bonga-purple">
            {streak}-day streak ✌️
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {prompt}
      </p>

      {saved ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 rounded-bonga-lg border border-bonga-teal/30 bg-bonga-teal/5 p-4 text-center"
        >
          <p className="text-3xl">{mood}</p>
          <p className="mt-2 text-sm font-medium">Checked in for today</p>
          {note && (
            <p className="mt-2 text-xs italic text-muted-foreground">
              &ldquo;{note}&rdquo;
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => setSaved(false)}
          >
            Edit
          </Button>
        </motion.div>
      ) : (
        <>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            How are you vibing?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setMood(opt.emoji)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  mood === opt.emoji
                    ? "border-bonga-orange bg-bonga-orange/10 font-semibold"
                    : "border-border hover:border-bonga-teal/40"
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional — one line of peace (stored locally only)"
            rows={2}
            className="mt-4 w-full resize-none rounded-bonga-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-bonga-teal/50 focus:outline-none focus:ring-1 focus:ring-bonga-teal/30"
          />

          <Button
            variant="peace"
            className="mt-4 w-full"
            disabled={!mood}
            onClick={handleSave}
          >
            Save check-in
          </Button>
        </>
      )}
    </div>
  );
}