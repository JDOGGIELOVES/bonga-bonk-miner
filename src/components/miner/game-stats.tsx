"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DAILY_BONGA_LIMIT,
  TAPS_PER_BONGA,
  progressToNextBonga,
  tapsUntilNextBonga,
  type GameState,
} from "@/lib/miner-game";
import { motion, AnimatePresence } from "framer-motion";

interface GameStatsProps {
  state: GameState;
  combo: number;
  connected?: boolean;
  dailyLimitReached?: boolean;
  nextDailyReset?: string;
  limitMessage?: string | null;
}

export function GameStats({ state, combo, connected, dailyLimitReached, nextDailyReset, limitMessage }: GameStatsProps) {
  const atLimit = state.bongaToday >= DAILY_BONGA_LIMIT;
  const progress = progressToNextBonga(state.tapsToday);
  const untilNext = tapsUntilNextBonga(state.tapsToday);

  return (
    <div className="bonga-card p-5 sm:p-6">
      <div className="mb-4 flex items-end justify-between gap-2">
        <div>
          <p className="bonga-section-label">Mining Progress</p>
          <h2 className="bonga-heading mt-1 text-lg">Bonk Miner</h2>
        </div>
        {connected && (
          <Badge variant="teal" className="text-[10px]">
            Wallet connected
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatBox label="Taps today" value={state.tapsToday} />
        <StatBox
          label="Mined today"
          value={`${state.bongaToday}/${DAILY_BONGA_LIMIT}`}
          highlight={state.bongaToday > 0}
        />
        <StatBox label="Session" value={state.sessionTaps} />
      </div>

      {TAPS_PER_BONGA !== 1 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {dailyLimitReached || atLimit 
                ? (limitMessage || `Daily limit reached of ${DAILY_BONGA_LIMIT} Bonga. Come back tomorrow to mine more $Bonga!`) 
                : `Next reward in ${untilNext} bonks`}
            </span>
            <span className="font-semibold text-bonga-orange">{Math.round(progress)}%</span>
          </div>
          <Progress value={atLimit ? 100 : progress} />
        </div>
      )}

      {TAPS_PER_BONGA === 1 && (
        <div className="mt-5 text-xs text-muted-foreground text-center">
          1 tap = 1 $BONGA — automatically deposited to your Bonga Bank Vault
        </div>
      )}

      {(dailyLimitReached || atLimit) && nextDailyReset && (
        <p className="mt-2 text-xs text-center text-amber-600 font-medium">
          The daily timer resets at {new Date(nextDailyReset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} UTC tomorrow.
        </p>
      )}

      <AnimatePresence>
        {combo >= 3 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden text-center"
          >
            <Badge variant="default">{combo}x combo</Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <motion.p
        key={String(value)}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground"
      >
        {highlight && <span className="text-bonga-orange">· </span>}
        {value}
      </motion.p>
    </div>
  );
}