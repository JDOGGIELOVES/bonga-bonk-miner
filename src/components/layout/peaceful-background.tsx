"use client";

import { motion } from "framer-motion";

/**
 * Subtle peaceful background effects for the Bonga site.
 * Low-opacity floating orbs + soft particles (emoji orbs for hippie/peace vibe).
 * Designed to be non-intrusive, pointer-events-none, and performant.
 * Used in GameHub / play areas initially.
 */
export function PeacefulBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Soft gradient glow orbs - very slow drift */}
      <motion.div
        className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-bonga-orange/5 blur-3xl"
        animate={{
          x: [0, 40, -20, 0],
          y: [0, 30, -10, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-16 h-64 w-64 rounded-full bg-bonga-teal/5 blur-3xl"
        animate={{
          x: [0, -30, 25, 0],
          y: [0, -25, 15, 0],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute bottom-10 left-1/4 h-48 w-48 rounded-full bg-bonga-purple/4 blur-3xl"
        animate={{
          x: [0, 35, -15, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{ duration: 36, repeat: Infinity, ease: "easeInOut", delay: 8 }}
      />

      {/* Tiny floating peaceful particles (subtle emoji orbs) */}
      {[
        { emoji: "✧", left: "12%", top: "18%", delay: 0 },
        { emoji: "✦", left: "78%", top: "25%", delay: 2.5 },
        { emoji: "🕊️", left: "22%", top: "62%", delay: 5 },
        { emoji: "✧", left: "85%", top: "55%", delay: 1.2 },
        { emoji: "🌿", left: "35%", top: "82%", delay: 7 },
        { emoji: "✦", left: "65%", top: "12%", delay: 3.8 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className="absolute text-base opacity-20 select-none"
          style={{ left: p.left, top: p.top }}
          animate={{
            y: [0, -18, 0],
            x: [0, i % 2 === 0 ? 8 : -6, 0],
            opacity: [0.15, 0.28, 0.15],
            rotate: [0, i % 2 === 0 ? 12 : -8, 0],
          }}
          transition={{
            duration: 18 + (i % 3) * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}