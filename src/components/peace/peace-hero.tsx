"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function PeaceHero() {
  return (
    <section className="relative overflow-hidden bg-hero-gradient py-16 md:py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-28 w-28 md:h-36 md:w-36"
        >
          <Image
            src="/nft/traits/bonga-01-peaceful.png"
            alt="Peaceful Bonga"
            fill
            className="object-contain drop-shadow-lg"
            priority
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 font-display text-4xl font-extrabold tracking-tight md:text-5xl"
        >
          The <span className="text-gradient">Bonga</span> Way
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          Slow flows, daily stretches, deep breaths, playful bonk release —
          mindfulness that doesn&apos;t take itself too seriously. Peace, love,
          and good bonks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Button variant="peace" size="lg" asChild>
            <a href="#stretch">Today&apos;s stretch</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#breathe">Breathe</a>
          </Button>
        </motion.div>

        <p className="mt-6 text-xs text-muted-foreground">
          Gentle tools for relaxation — not medical advice. Move and breathe
          within your comfort.
        </p>
      </div>
    </section>
  );
}