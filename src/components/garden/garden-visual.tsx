"use client";

import { motion } from "framer-motion";
import type { PlantedCrop } from "@/lib/vibes-garden";
import { getPlantType } from "@/lib/vibes-garden";

interface GardenVisualProps {
  plants: PlantedCrop[];
  onWater: (instanceId: string) => void;
  beautyLevel: number;
}

const SKY_GRADIENTS: Record<number, string> = {
  1: "from-bonga-teal/15 via-bonga-purple/5 to-bonga-orange/10",
  2: "from-bonga-teal/20 via-bonga-green/10 to-bonga-orange/15",
  3: "from-bonga-teal/25 via-bonga-purple/15 to-bonga-green/15",
  4: "from-bonga-teal/30 via-bonga-purple/20 to-bonga-orange/20",
  5: "from-bonga-teal/35 via-bonga-purple/25 to-bonga-green/25",
};

export function GardenVisual({ plants, onWater, beautyLevel }: GardenVisualProps) {
  const gradient = SKY_GRADIENTS[beautyLevel] ?? SKY_GRADIENTS[1];

  return (
    <div
      className={`bonga-card relative min-h-[52vh] overflow-hidden bg-gradient-to-b ${gradient} p-4 sm:min-h-[56vh]`}
    >
      {beautyLevel >= 3 && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(45,184,168,0.2),transparent_35%)]" />
      )}
      {beautyLevel >= 4 && (
        <motion.div
          className="pointer-events-none absolute -left-8 top-8 h-24 w-24 rounded-full bg-bonga-purple/20 blur-2xl"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
      )}

      <p className="relative text-center text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
        Tap a plant to water · send vibes
      </p>

      <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {plants.map((crop, index) => {
          const type = getPlantType(crop.plantTypeId);
          if (!type) return null;

          return (
            <motion.button
              key={crop.instanceId}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onWater(crop.instanceId)}
              className="group relative flex flex-col items-center rounded-bonga-lg border border-border/50 bg-card/80 px-3 py-4 shadow-card backdrop-blur-sm transition hover:border-bonga-teal/40 hover:shadow-bonga"
              style={{
                boxShadow: `0 0 24px -8px ${type.glow}55`,
              }}
            >
              <span
                className="text-4xl transition-transform group-hover:scale-110 sm:text-5xl"
                role="img"
                aria-hidden
              >
                {type.emoji}
              </span>
              <span className="mt-2 text-center text-xs font-semibold text-foreground">
                {type.name}
              </span>
              <span className="mt-1 text-[10px] text-bonga-teal opacity-0 transition group-hover:opacity-100">
                + vibes
              </span>
            </motion.button>
          );
        })}
      </div>

      {plants.length === 0 && (
        <p className="relative mt-12 text-center text-sm text-muted-foreground">
          Visit the shop to plant your first cosmic bloom.
        </p>
      )}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bonga-green/20 to-transparent" />
    </div>
  );
}