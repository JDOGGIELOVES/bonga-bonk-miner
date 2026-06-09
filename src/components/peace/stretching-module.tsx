"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  completedStretchToday,
  getTodaysStretch,
  loadStretchStreak,
  markStretchComplete,
  STRETCHING_SESSIONS,
  type StretchSession,
} from "@/lib/bonga-stretching";
import { SessionPlayer } from "@/components/peace/session-player";

function TodaysStretchCard({
  session,
  onStart,
  streak,
  doneToday,
}: {
  session: StretchSession;
  onStart: () => void;
  streak: number;
  doneToday: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bonga-card border-bonga-orange/30 bg-gradient-to-br from-bonga-orange/5 to-bonga-teal/5 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-bonga-orange">
            Today&apos;s stretch
          </p>
          <h3 className="mt-1 font-display text-xl font-bold">
            {session.emoji} {session.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{session.subtitle}</p>
          <p className="mt-2 text-xs text-bonga-purple">{session.bodyFocus}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-bonga-teal/10 px-3 py-1 text-xs font-semibold text-bonga-teal">
            {session.durationMin} min
          </span>
          {streak > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              {streak}-day streak
            </span>
          )}
          {doneToday && (
            <span className="text-xs font-semibold text-bonga-teal">✓ Done today</span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-4 w-full rounded-full bg-bonga-orange px-6 py-2.5 text-sm font-semibold text-white shadow-bonga transition-colors hover:bg-bonga-orange/90 sm:w-auto"
      >
        {doneToday ? "Stretch again" : "Start today's stretch"}
      </button>
    </motion.div>
  );
}

export function StretchingModule() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [doneToday, setDoneToday] = useState(false);
  const todays = getTodaysStretch();
  const active = STRETCHING_SESSIONS.find((s) => s.id === activeId);

  useEffect(() => {
    setStreak(loadStretchStreak());
    setDoneToday(completedStretchToday());
  }, []);

  const handleComplete = useCallback(() => {
    const newStreak = markStretchComplete();
    setStreak(newStreak);
    setDoneToday(true);
  }, []);

  const otherSessions = STRETCHING_SESSIONS.filter((s) => s.id !== todays.id);

  return (
    <div>
      <AnimatePresence mode="wait">
        {active ? (
          <div key={active.id}>
            <SessionPlayer
              session={active}
              onBack={() => setActiveId(null)}
              completeMessage="Body loosened, mind softer. That's the Bonga way."
              onComplete={handleComplete}
            />
          </div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <TodaysStretchCard
              session={todays}
              onStart={() => setActiveId(todays.id)}
              streak={streak}
              doneToday={doneToday}
            />

            <div>
              <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
                More routines
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {otherSessions.map((session, i) => (
                  <motion.button
                    key={session.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
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
                    <p className="mt-2 text-xs text-bonga-purple">
                      {session.bodyFocus}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}