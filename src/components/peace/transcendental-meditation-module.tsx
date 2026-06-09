"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TM_CORE_INSTRUCTIONS,
  TM_MANTRAS,
  TM_SESSIONS,
  type TmSession,
} from "@/lib/bonga-transcendental-meditation";
import { SessionPlayer } from "@/components/peace/session-player";

function MantraPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (mantraId: string) => void;
}) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Choose your mantra
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TM_MANTRAS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              value === m.id
                ? "border-bonga-purple bg-bonga-purple/10 font-semibold text-bonga-purple"
                : "border-border hover:border-bonga-teal/40"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {TM_MANTRAS.find((m) => m.id === value)?.note}
      </p>
    </div>
  );
}

function TmPlayer({
  session,
  mantraId,
  onBack,
}: {
  session: TmSession;
  mantraId: string;
  onBack: () => void;
}) {
  const mantra = TM_MANTRAS.find((m) => m.id === mantraId);
  const mantraSound = mantra?.sound ?? session.defaultMantra;

  const guidedSession = {
    id: session.id,
    title: session.title,
    guideTraitId: 6,
    steps: session.steps.map((step) => ({
      ...step,
      instruction: `${step.instruction} Today's sound: ${mantraSound}.`,
    })),
  };

  return (
    <SessionPlayer
      session={guidedSession}
      onBack={onBack}
      completeMessage={`Beautiful sit. ${mantraSound} did its quiet work. That's the Bonga way.`}
      musicMode="ambient"
    />
  );
}

export function TranscendentalMeditationModule() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mantraId, setMantraId] = useState("bonga");
  const active = TM_SESSIONS.find((s) => s.id === activeId);

  return (
    <div>
      <div className="bonga-card mb-8 p-6">
        <h3 className="font-display text-lg font-bold">
          Transcendental meditation — the Bonga way
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Effortless mantra meditation inspired by transcendental practice: sit,
          close your eyes, repeat a soft sound silently, and gently return when
          the mind wanders. Not medical advice — just peaceful bonks for the
          inside.
        </p>
        <ol className="mt-5 space-y-3">
          {TM_CORE_INSTRUCTIONS.map((item, i) => (
            <li key={item.title} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bonga-purple/10 text-xs font-bold text-bonga-purple">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-0.5 leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <MantraPicker value={mantraId} onChange={setMantraId} />
      </div>

      <AnimatePresence mode="wait">
        {active ? (
          <TmPlayer
            key={active.id}
            session={active}
            mantraId={mantraId}
            onBack={() => setActiveId(null)}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {TM_SESSIONS.map((session, i) => (
              <motion.button
                key={session.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setActiveId(session.id)}
                className="bonga-card group p-5 text-left transition-colors hover:border-bonga-purple/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-3xl">{session.emoji}</span>
                  <span className="rounded-full bg-bonga-purple/10 px-2 py-0.5 text-xs font-semibold text-bonga-purple">
                    {session.durationMin} min
                  </span>
                </div>
                <h3 className="mt-3 font-display font-bold group-hover:text-bonga-orange">
                  {session.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {session.subtitle}
                </p>
                <p className="mt-2 text-xs text-bonga-teal">
                  Default mantra: {session.defaultMantra}
                </p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}