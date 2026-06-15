"use client";

import { motion } from "framer-motion";
import { Hammer, Sprout } from "lucide-react";

export type GameMode = "miner" | "garden";

interface GameModeTabsProps {
  mode: GameMode;
  onChange: (mode: GameMode) => void;
}

export function GameModeTabs({ mode, onChange }: GameModeTabsProps) {
  const isMiner = mode === "miner";
  return (
    <div className="mx-auto flex w-full max-w-md rounded-full border border-border/60 bg-card p-1 shadow-card relative">
      {/* Smooth sliding active pill */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-full shadow-bonga"
        initial={false}
        animate={{
          left: isMiner ? "4px" : "50%",
          right: isMiner ? "50%" : "4px",
          backgroundColor: isMiner ? "#FF6200" : "#2DB8A8",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
      />

      <button
        type="button"
        onClick={() => onChange("miner")}
        className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${isMiner ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
      >
        <Hammer className="h-4 w-4" />
        Bonk Miner
      </button>
      <button
        type="button"
        onClick={() => onChange("garden")}
        className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${!isMiner ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
      >
        <Sprout className="h-4 w-4" />
        Vibes Garden
      </button>
    </div>
  );
}