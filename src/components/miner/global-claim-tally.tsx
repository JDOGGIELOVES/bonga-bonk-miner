"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, Users } from "lucide-react";
import { fetchGlobalClaimTally, type GlobalClaimTally, type CategoryTally } from "@/lib/claim-client";

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
  const totalClaims = tally?.claimCount ?? 0;
  const miner = tally?.miner ?? { bonga: 0, claims: 0 };
  const garden = tally?.garden ?? { bonga: 0, claims: 0 };
  const pet = tally?.pet ?? { bonga: 0, claims: 0 };
  const stake = tally?.stake ?? { bonga: 0, claims: 0 };
  const lastUpdated = tally?.updatedAt ? new Date(tally.updatedAt).toLocaleString() : null;

  const CategoryRow = ({ label, data, color }: { label: string; data: CategoryTally; color: string }) => (
    <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-2">
      <Coins className={`h-4 w-4 ${color}`} />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-display text-sm font-bold">
          {data.bonga.toLocaleString()}
          <span className="text-[10px] font-normal text-muted-foreground ml-1">
            ({data.claims})
          </span>
        </p>
      </div>
    </div>
  );

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
            Cumulative lifetime total paid out from the treasury (never resets daily — daily resets only apply to individual user earning caps). Broken down by source for exploit monitoring.
            {lastUpdated && <span className="block">Last updated: {lastUpdated}</span>}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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
                Total Claims
              </p>
              <p className="font-display text-sm font-bold">{totalClaims.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
        <CategoryRow label="Bonk Miner" data={miner} color="text-bonga-orange" />
        <CategoryRow label="Garden" data={garden} color="text-bonga-teal" />
        <CategoryRow label="Pet Love" data={pet} color="text-bonga-purple" />
        <CategoryRow label="NFT Staking" data={stake} color="text-bonga-orange" />
      </div>
    </motion.div>
  );
}