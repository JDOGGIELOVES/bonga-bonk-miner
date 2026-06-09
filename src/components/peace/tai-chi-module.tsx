"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TAI_CHI_SESSIONS } from "@/lib/bonga-tai-chi";
import { SessionPlayer } from "@/components/peace/session-player";

export function TaiChiModule({ compact = false }: { compact?: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sessions = compact ? TAI_CHI_SESSIONS.slice(0, 2) : TAI_CHI_SESSIONS;
  const active = TAI_CHI_SESSIONS.find((s) => s.id === activeId);

  return (
    <div>
      <AnimatePresence mode="wait">
        {active ? (
          <div key={active.id}>
            <SessionPlayer
              session={active}
              onBack={() => setActiveId(null)}
              musicMode="flute"
            />
          </div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {sessions.map((session, i) => (
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
  );
}