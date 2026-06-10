"use client";

import { cn } from "@/lib/utils";
import { Hammer, Sprout } from "lucide-react";

export type GameMode = "miner" | "garden";

interface GameModeTabsProps {
  mode: GameMode;
  onChange: (mode: GameMode) => void;
}

export function GameModeTabs({ mode, onChange }: GameModeTabsProps) {
  return (
    <div className="mx-auto flex w-full max-w-md rounded-full border border-border/60 bg-card p-1 shadow-card">
      <button
        type="button"
        onClick={() => onChange("miner")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
          mode === "miner"
            ? "bg-bonga-orange text-white shadow-bonga"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Hammer className="h-4 w-4" />
        Bonk Miner
      </button>
      <button
        type="button"
        onClick={() => onChange("garden")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
          mode === "garden"
            ? "bg-bonga-teal text-white shadow-bonga"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sprout className="h-4 w-4" />
        Vibes Garden
      </button>
    </div>
  );
}