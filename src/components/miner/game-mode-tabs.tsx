"use client";

import Link from "next/link";
import { Coins, Hammer } from "lucide-react";

export type GameMode = "miner" | "garden";

interface GameModeTabsProps {
  mode: GameMode;
  onChange: (mode: GameMode) => void;
}

/** Miner play strip + Coin Stake CTA. Vibes Garden retired from UI. */
export function GameModeTabs({ mode }: GameModeTabsProps) {
  void mode;
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
      <div className="flex w-full items-center justify-center gap-2 rounded-full border border-bonga-orange/40 bg-bonga-orange px-4 py-2.5 text-sm font-semibold text-white shadow-bonga">
        <Hammer className="h-4 w-4" />
        Bonk Miner
      </div>
      <Link
        href="/coin-staking"
        className="flex w-full items-center justify-center gap-2 rounded-full border border-bonga-teal/50 bg-bonga-teal/10 px-4 py-2.5 text-sm font-semibold text-bonga-teal transition hover:bg-bonga-teal/20"
      >
        <Coins className="h-4 w-4" />
        Coin Stake · 25% / 7% APR monthly
      </Link>
    </div>
  );
}
