"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COLLECTION_STATS } from "@/lib/nft-collection";
import { ArrowDown } from "lucide-react";

export function NFTHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-hero-gradient" />
      <div className="pointer-events-none absolute -left-20 top-20 h-60 w-60 rounded-full bg-bonga-orange/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-60 w-60 rounded-full bg-bonga-purple/20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="relative h-40 w-40 sm:h-48 sm:w-48">
            <Image
              src="/bonga-character.png"
              alt="Bonga Bonk's Sister"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Badge variant="purple" className="mt-6">
            Peace & Love on Solana
          </Badge>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-6xl">
            <span className="text-gradient">Bonga</span> NFT Collection
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {COLLECTION_STATS.totalSupply.toLocaleString()} unique chibi Shiba
            warriors — hippie vibes, cosmic energy, and bonk power. Mint yours.
            Join the fam.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          <Badge variant="default">{COLLECTION_STATS.totalSupply} Supply</Badge>
          <Badge variant="teal">16 Unique Traits</Badge>
          <Badge variant="green">Bonk Miner Whitelist</Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Button variant="peace" size="lg" asChild>
            <a href="#mint">Mint Now</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#gallery">View Gallery</a>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/">Bonk Miner</Link>
          </Button>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-12"
        >
          <a
            href="#gallery"
            className="inline-flex flex-col items-center text-muted-foreground"
          >
            <span className="text-xs">Explore</span>
            <ArrowDown className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}