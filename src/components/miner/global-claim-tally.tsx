"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Users } from "lucide-react";
import { fetchGlobalClaimTally, type GlobalClaimTally } from "@/lib/claim-client";

interface GlobalClaimTallyProps {
  refreshKey?: number;
}

export function GlobalClaimTally({ refreshKey = 0 }: GlobalClaimTallyProps) {
  const [tally, setTally] = useState<GlobalClaimTally | null>(null);

  const loadTally = useCallback(async () => {
    const next = await fetchGlobalClaimTally();
    setTally(next);
  }, []);

  useEffect(() => {
    void loadTally();
  }, [loadTally, refreshKey]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadTally();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [loadTally]);

  const total = tally?.totalBonga ?? 0;
  const claims = tally?.claimCount ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bonga-card border-bonga-orange/20 bg-gradient-to-br from-bonga-orange/5 via-card to-bonga-teal/5 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="bonga-section-label">Community Claimed</p>
          <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {total.toLocaleString()}{" "}
            <span className="text-gradient">$BONGA</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Running total paid out from the treasury — miner taps &amp; Pet Love
          </p>
        </div>

        <div className="flex shrink-0 gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-2">
            <Coins className="h-4 w-4 text-bonga-orange" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p className="font-display text-sm font-bold">{total.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-2">
            <Users className="h-4 w-4 text-bonga-teal" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Claims
              </p>
              <p className="font-display text-sm font-bold">{claims.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}