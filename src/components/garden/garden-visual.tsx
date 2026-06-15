"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  getPlantType,
  type PlantedCrop,
} from "@/lib/vibes-garden";

interface GardenVisualProps {
  plants: PlantedCrop[];
  onWater: (instanceId: string) => void;
  beautyLevel: number;
  plantPops?: Record<string, { id: number; text: string }>;
  generalFeedback?: { id: number; text: string } | null;
}

// Soft layered garden palette — peaceful bonga hippie vibe (even softer, more dreamy)
const GARDEN_BG = "from-[#EAF7F4] via-[#F8F4EC] to-[#FEFBF5] dark:from-[#0D201E] dark:via-[#14221F] dark:to-[#181F1C]";

function GardenDecor({ beauty, plantCount }: { beauty: number; plantCount: number }) {
  const extraFlowers = Math.min(9, Math.floor(plantCount / 1.5));
  const showButterflies = beauty >= 2;
  const showOrbs = beauty >= 3;
  const showSparkle = beauty >= 4;
  const moteCount = Math.min(6, 2 + Math.floor(plantCount / 3));

  return (
    <>
      {/* Multiple soft peaceful sky / light layers */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_25%,rgba(45,184,168,0.09),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(139,92,246,0.05),transparent_50%)]" />

      {/* Ground / moss layers that densify (softer) */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#C8E0D6]/65 via-[#A8C9B8]/35 to-transparent dark:from-[#0A1A17]/75 dark:via-[#0E221E]/45" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#9BBBA8]/50 to-transparent dark:from-[#13221E]/60" />

      {/* Base wildflowers / ground cover — grows with plantCount */}
      {Array.from({ length: Math.min(14, 4 + extraFlowers) }).map((_, i) => (
        <div
          key={`gf-${i}`}
          className="pointer-events-none absolute text-[12px] sm:text-sm opacity-35 dark:opacity-25"
          style={{
            left: `${10 + ((i * 13) % 76)}%`,
            bottom: `${6 + (i % 4) * 5}%`,
            transform: `rotate(${((i % 7) - 3) * 5}deg)`,
          }}
        >
          {["🌱", "🌼", "🪻", "🌸", "💐"][i % 5]}
        </div>
      ))}

      {/* Enhanced floating petals + leaves (more, varied motion) */}
      {Array.from({ length: beauty >= 3 ? 6 : 3 }).map((_, i) => (
        <motion.div
          key={`petal-${i}`}
          className="pointer-events-none absolute text-base sm:text-lg opacity-35"
          style={{ left: `${20 + (i % 5) * 14}%`, top: `${14 + (i % 3) * 9}%` }}
          animate={{
            y: [0, 26 + (i % 2) * 4, 0],
            x: [0, (i % 3 === 0 ? 8 : -7), 0],
            rotate: [0, 14, -9, 0],
            opacity: [0.35, 0.55, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 8.5 + i * 0.45, ease: "easeInOut", delay: i * 0.55 }}
        >
          {i % 3 === 0 ? "🍃" : "🌿"}
        </motion.div>
      ))}

      {/* Extra gentle drifting light motes / peaceful particles */}
      {Array.from({ length: moteCount }).map((_, i) => (
        <motion.div
          key={`mote-${i}`}
          className="pointer-events-none absolute rounded-full bg-white/40 dark:bg-white/15"
          style={{
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            left: `${18 + ((i * 19) % 62)}%`,
            top: `${22 + (i % 4) * 11}%`,
          }}
          animate={{ y: [0, -18, 0], x: [0, (i % 2 ? 5 : -4), 0], opacity: [0.2, 0.5, 0.15] }}
          transition={{ repeat: Infinity, duration: 10 + i * 0.8, ease: "easeInOut", delay: i * 1.1 }}
        />
      ))}

      {showButterflies && (
        <motion.div
          className="pointer-events-none absolute text-xl opacity-55"
          style={{ left: "12%", top: "20%" }}
          animate={{ x: [0, 42, -14, 0], y: [0, -16, 7, 0], rotate: [0, 9, -7, 0] }}
          transition={{ repeat: Infinity, duration: 12.5, ease: "easeInOut" }}
        >
          🦋
        </motion.div>
      )}
      {beauty >= 3 && (
        <motion.div
          className="pointer-events-none absolute text-lg opacity-45"
          style={{ right: "15%", top: "26%" }}
          animate={{ x: [0, -32, 12, 0], y: [0, 9, -11, 0] }}
          transition={{ repeat: Infinity, duration: 10.2, ease: "easeInOut", delay: 1.4 }}
        >
          🦋
        </motion.div>
      )}

      {/* Soft glowing orbs / frequency vibes (more peaceful) */}
      {showOrbs && (
        <>
          <motion.div
            className="pointer-events-none absolute h-10 w-10 rounded-full bg-bonga-teal/18 blur-2xl"
            style={{ left: "20%", top: "29%" }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.5, 0.28] }}
            transition={{ repeat: Infinity, duration: 5.8 }}
          />
          <motion.div
            className="pointer-events-none absolute h-7 w-7 rounded-full bg-bonga-purple/18 blur-xl"
            style={{ right: "24%", bottom: "32%" }}
            animate={{ scale: [1, 1.22, 1], opacity: [0.22, 0.42, 0.2] }}
            transition={{ repeat: Infinity, duration: 6.6, delay: 0.9 }}
          />
        </>
      )}

      {/* Extra sparkle at high beauty + soft star-like */}
      {showSparkle && (
        <>
          <motion.div
            className="pointer-events-none absolute text-xl opacity-35"
            style={{ right: "10%", top: "13%" }}
            animate={{ rotate: [0, 18, -10, 0], scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 9 }}
          >
            ✨
          </motion.div>
          <motion.div
            className="pointer-events-none absolute text-[10px] opacity-25"
            style={{ left: "31%", top: "17%" }}
            animate={{ opacity: [0.15, 0.4, 0.15] }}
            transition={{ repeat: Infinity, duration: 4.5, delay: 2 }}
          >
            ✧
          </motion.div>
        </>
      )}

      {/* Peaceful Bonga presence (grows with the garden) */}
      {beauty >= 2 && (
        <div className="pointer-events-none absolute bottom-[17%] right-[8%] text-3xl opacity-65 drop-shadow-sm" title="Bonga rests here">
          🦥
        </div>
      )}

      {/* Gentle grass tufts at the base that multiply */}
      {Array.from({ length: Math.min(8, 2 + Math.floor(plantCount / 2.2)) }).map((_, i) => (
        <div
          key={`grass-${i}`}
          className="pointer-events-none absolute bottom-[5%] text-[10px] opacity-30"
          style={{ left: `${16 + i * 9}%` }}
        >
          🌿
        </div>
      ))}
    </>
  );
}

export function GardenVisual({ plants, onWater, beautyLevel, plantPops, generalFeedback }: GardenVisualProps) {
  const plantCount = plants.length;

  // Position plants organically across the beautiful garden bed (no zone tabs — one central growing space)
  // Use stable-ish placement based on instance index so they don't jump around.
  function getPlantPos(index: number) {
    const cols = 3;
    const col = index % cols;
    const row = Math.floor(index / cols);
    // Gentle organic scatter
    const baseLeft = 14 + col * 27 + ((index % 5) - 2) * 2.8;
    const baseTop = 34 + row * 18 + ((index + 1) % 4) * 1.5;
    return {
      left: `${Math.max(6, Math.min(86, baseLeft))}%`,
      top: `${Math.max(28, Math.min(72, baseTop))}%`,
    };
  }

  return (
    <div className="space-y-2">
      {/* One central beautiful garden — grows visually as you add & water plants */}
      <div
        className={`bonga-card relative min-h-[62vh] overflow-hidden rounded-bonga-lg bg-gradient-to-b ${GARDEN_BG} p-4 sm:min-h-[58vh] sm:p-5`}
      >
        {/* Very subtle overall peaceful breathing glow for the whole garden */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: [0.03, 0.07, 0.03] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
          style={{
            background: "radial-gradient(ellipse at 50% 45%, rgba(45,184,168,0.06), transparent 70%)",
          }}
        />

        {/* Decor layers: sky glows, ground, flowers, butterflies, orbs — density grows */}
        <GardenDecor beauty={beautyLevel} plantCount={plantCount} />

        {/* Centered title area with soft vignette */}
        <div className="relative z-10">
          <div className="mx-auto mb-1 w-fit rounded-full border border-white/40 bg-white/60 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-bonga-teal shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-bonga-teal/90">
            The Vibes Garden
          </div>
          <p className="text-center text-[11px] text-muted-foreground">
            A peaceful place to grow • tap plants to water
          </p>
        </div>

        {/* General feedback floats gently (affirmation / quest rewards) */}
        <AnimatePresence>
          {generalFeedback && (
            <motion.p
              key={generalFeedback.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="pointer-events-none absolute left-1/2 top-10 z-30 -translate-x-1/2 rounded-full bg-card/95 px-4 py-1 text-center text-xs font-bold text-bonga-orange shadow-sm sm:text-sm"
            >
              {generalFeedback.text}
            </motion.p>
          )}
        </AnimatePresence>

        {/* The living garden: each plant is a tappable visual that feels alive */}
        <div className="relative z-10 mt-6 min-h-[260px]">
          {plants.length === 0 && (
            <div className="absolute inset-x-0 top-16 text-center text-sm text-muted-foreground">
              Your garden is waiting. Open the shop and plant your first friends.
            </div>
          )}

          {plants.map((crop, index) => {
            const type = getPlantType(crop.plantTypeId);
            if (!type) return null;
            const pos = getPlantPos(index);
            const pop = plantPops?.[crop.instanceId];

            return (
              <motion.button
                key={crop.instanceId}
                type="button"
                onClick={() => onWater(crop.instanceId)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.68, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 22, delay: Math.min(index * 0.025, 0.18) }}
                className="group absolute flex -translate-x-1/2 -translate-y-1/2 touch-manipulation flex-col items-center rounded-2xl px-2 py-2 transition active:opacity-90"
                style={{ left: pos.left, top: pos.top }}
                aria-label={`Water ${type.name}`}
              >
                {/* Soft halo that matches plant glow — gets richer with beauty */}
                <div
                  className="pointer-events-none absolute -inset-5 rounded-full blur-xl transition-opacity"
                  style={{
                    background: `radial-gradient(circle, ${type.glow}22 0%, transparent 65%)`,
                    opacity: 0.6 + Math.min(0.35, beautyLevel * 0.06),
                  }}
                />

                {/* The plant — subtle growing sway + lively on interaction. Grows in on first appearance. */}
                <motion.div
                  className="relative text-[52px] drop-shadow sm:text-[58px] leading-none"
                  animate={{
                    y: [0, -5.5, 0],
                    rotate: index % 2 === 0 ? [0, 1.8, 0, -1.5, 0] : [0, -1.5, 0, 2, 0],
                    scale: [1, 1.012, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3.6 + (index % 3) * 0.3,
                    ease: "easeInOut",
                  }}
                  whileTap={{ scale: 1.18, transition: { duration: 0.18 } }}
                >
                  {type.emoji}
                </motion.div>

                {/* Tiny plant label — only on larger screens or hover to keep clean */}
                <div className="mt-0.5 rounded-full bg-card/80 px-2 py-px text-[10px] font-semibold text-foreground/90 shadow-sm backdrop-blur group-hover:bg-card">
                  {type.name}
                </div>

                {/* Per-plant +$BONGA pop — localized, no layout shift */}
                <AnimatePresence>
                  {pop && (
                    <motion.span
                      key={pop.id}
                      initial={{ opacity: 0, y: 4, scale: 0.8 }}
                      animate={{ opacity: 1, y: -28, scale: 1 }}
                      exit={{ opacity: 0, y: -40 }}
                      transition={{ duration: 1.05, ease: "easeOut" }}
                      className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-card/95 px-2.5 py-px text-center font-display text-xs font-bold text-bonga-orange shadow-sm sm:text-sm"
                    >
                      {pop.text}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Bottom soft earth rim + instruction */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
          Tap to water • plants keep earning while you’re away
        </div>

        {/* Lush ground accent line */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/5 to-transparent dark:from-white/5" />
      </div>

      {/* Subtle growth indicator */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
        <span className="font-medium">Beauty Lv {beautyLevel}</span>
        <span className="opacity-40">·</span>
        <span>{plantCount} plant{plantCount === 1 ? "" : "s"} growing peacefully</span>
      </div>
    </div>
  );
}