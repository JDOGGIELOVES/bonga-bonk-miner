"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GARDEN_ZONES,
  getPlantType,
  getPlantsInZone,
  type GardenZone,
  type PlantedCrop,
} from "@/lib/vibes-garden";

interface GardenVisualProps {
  plants: PlantedCrop[];
  onWater: (instanceId: string) => void;
  beautyLevel: number;
}

const ZONE_STYLES: Record<
  GardenZone,
  { gradient: string; accent: string; ground: string }
> = {
  meadow: {
    gradient: "from-sky-200/40 via-bonga-green/15 to-amber-100/30 dark:from-sky-900/30 dark:via-bonga-green/10 dark:to-amber-900/20",
    accent: "rgba(74, 222, 128, 0.25)",
    ground: "from-bonga-green/35 via-emerald-400/20 to-transparent",
  },
  greenhouse: {
    gradient: "from-emerald-100/50 via-bonga-teal/20 to-lime-100/40 dark:from-emerald-950/40 dark:via-bonga-teal/15 dark:to-lime-950/30",
    accent: "rgba(45, 184, 168, 0.3)",
    ground: "from-bonga-teal/30 via-green-300/15 to-transparent",
  },
  farm: {
    gradient: "from-amber-100/40 via-orange-100/30 to-bonga-orange/15 dark:from-amber-950/35 dark:via-orange-950/20 dark:to-bonga-orange/10",
    accent: "rgba(255, 98, 0, 0.2)",
    ground: "from-amber-600/25 via-orange-400/15 to-transparent",
  },
};

function MeadowDecor() {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute left-[8%] top-[12%] text-2xl opacity-70 sm:text-3xl"
        animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      >
        🦋
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-[12%] top-[18%] h-10 w-10 rounded-full bg-yellow-300/50 blur-[1px] sm:h-14 sm:w-14"
        animate={{ scale: [1, 1.08, 1], opacity: [0.65, 0.9, 0.65] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[22%] left-[5%] text-lg opacity-50"
        animate={{ x: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      >
        🌼
      </motion.div>
    </>
  );
}

function GreenhouseDecor() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-4 top-3 h-8 rounded-t-2xl border-x-2 border-t-2 border-white/30 bg-white/10 backdrop-blur-[2px] sm:inset-x-8 sm:top-4 sm:h-10" />
      {[20, 45, 70].map((left, i) => (
        <motion.div
          key={left}
          className="pointer-events-none absolute top-[18%] w-px bg-white/25"
          style={{ left: `${left}%`, height: "55%" }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 3 + i, delay: i * 0.4 }}
        />
      ))}
      <motion.div
        className="pointer-events-none absolute bottom-[30%] right-[10%] text-xl opacity-40"
        animate={{ opacity: [0.2, 0.55, 0.2], y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        💨
      </motion.div>
    </>
  );
}

function FarmDecor() {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute bottom-[28%] right-[8%] text-2xl opacity-60"
        animate={{ rotate: [0, 360] }}
        transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
      >
        🌾
      </motion.div>
      <div className="pointer-events-none absolute bottom-[24%] left-[6%] text-xl opacity-50">
        🏚️
      </div>
      <motion.div
        className="pointer-events-none absolute top-[22%] right-[18%] text-lg opacity-45"
        animate={{ x: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 7 }}
      >
        🐝
      </motion.div>
    </>
  );
}

function ZoneDecor({ zone }: { zone: GardenZone }) {
  if (zone === "meadow") return <MeadowDecor />;
  if (zone === "greenhouse") return <GreenhouseDecor />;
  return <FarmDecor />;
}

export function GardenVisual({ plants, onWater, beautyLevel }: GardenVisualProps) {
  const [activeZone, setActiveZone] = useState<GardenZone>("meadow");
  const style = ZONE_STYLES[activeZone];
  const zonePlants = getPlantsInZone(plants, activeZone);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GARDEN_ZONES.map((zone) => {
          const count = getPlantsInZone(plants, zone.id).length;
          const active = activeZone === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => setActiveZone(zone.id)}
              className={`min-h-[48px] shrink-0 rounded-full border px-4 py-2.5 text-left transition sm:min-h-[44px] ${
                active
                  ? "border-bonga-teal bg-bonga-teal/15 shadow-sm"
                  : "border-border/60 bg-card/80 hover:border-bonga-teal/30"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-lg">{zone.emoji}</span>
                {zone.label}
                {count > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeZone}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className={`bonga-card relative min-h-[58vh] overflow-hidden bg-gradient-to-b ${style.gradient} p-3 sm:min-h-[56vh] sm:p-4`}
        >
          {beautyLevel >= 3 && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${style.accent}, transparent 55%)`,
              }}
            />
          )}

          <ZoneDecor zone={activeZone} />

          <div className="relative">
            <p className="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground sm:text-xs">
              {GARDEN_ZONES.find((z) => z.id === activeZone)?.description}
            </p>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Tap a plant to water · big taps for mobile
            </p>
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {zonePlants.map((crop, index) => {
              const type = getPlantType(crop.plantTypeId);
              if (!type) return null;

              return (
                <motion.button
                  key={crop.instanceId}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onWater(crop.instanceId)}
                  className="group relative flex min-h-[88px] touch-manipulation flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/85 px-4 py-5 shadow-card backdrop-blur-sm transition active:border-bonga-teal/50 sm:min-h-[96px]"
                  style={{
                    boxShadow: `0 0 28px -10px ${type.glow}66`,
                  }}
                >
                  <motion.span
                    className="text-5xl sm:text-5xl"
                    role="img"
                    aria-hidden
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5 + (index % 3) * 0.5,
                      ease: "easeInOut",
                    }}
                  >
                    {type.emoji}
                  </motion.span>
                  <span className="mt-2 text-center text-sm font-semibold text-foreground">
                    {type.name}
                  </span>
                  <span className="mt-1 text-[11px] font-medium text-bonga-teal">
                    Tap to water
                  </span>
                </motion.button>
              );
            })}
          </div>

          {zonePlants.length === 0 && (
            <p className="relative mt-10 px-4 text-center text-sm text-muted-foreground">
              No plants in the {activeZone} yet. Open the shop and plant here — each zone
              keeps its own peaceful layout.
            </p>
          )}

          <div
            className={`pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t ${style.ground}`}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}