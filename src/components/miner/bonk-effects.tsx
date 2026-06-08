"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface BonkEffect {
  id: string;
  x: number;
  y: number;
  type: "bonk" | "star" | "coin" | "bonga";
}

interface BonkEffectsProps {
  effects: BonkEffect[];
}

const EFFECT_CONTENT = {
  bonk: { text: "BONK!", color: "#FF6200", size: "text-xl sm:text-2xl font-display font-bold" },
  star: { text: "✦", color: "#FF6200", size: "text-lg opacity-80" },
  coin: { text: "+", color: "#2DB8A8", size: "text-lg font-bold" },
  bonga: { text: "+1 $BONGA", color: "#2DB8A8", size: "text-sm sm:text-base font-semibold" },
};

export function BonkEffects({ effects }: BonkEffectsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      <AnimatePresence>
        {effects.map((effect) => {
          const content = EFFECT_CONTENT[effect.type];
          return (
            <motion.div
              key={effect.id}
              className={`absolute ${content.size}`}
              style={{
                left: effect.x,
                top: effect.y,
                color: content.color,
                textShadow: "2px 2px 0 rgba(0,0,0,0.3)",
              }}
              initial={{ scale: 0, opacity: 1, rotate: -15 }}
              animate={{
                scale: effect.type === "bonk" ? [0, 1.4, 1] : [0, 1.2, 0.8],
                opacity: [1, 1, 0],
                y: [0, -60, -120],
                rotate: effect.type === "bonk" ? [-15, 5, 15] : [0, 180],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {content.text}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface ParticlesProps {
  particles: Particle[];
}

export function Particles({ particles }: ParticlesProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-25 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
            }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: 0,
              opacity: 0,
              x: (Math.random() - 0.5) * 120,
              y: (Math.random() - 0.5) * 120 - 40,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}