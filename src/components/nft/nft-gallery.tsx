"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NFTCard } from "@/components/nft/nft-card";
import { BongaNFTArt } from "@/components/nft/bonga-nft-art";
import { BONGA_NFTS, type BongaNFT, type RarityTier } from "@/lib/nft-collection";
import { getTraitPose } from "@/lib/nft-trait-poses";
import { Badge } from "@/components/ui/badge";

const FILTERS: Array<RarityTier | "All"> = [
  "All",
  "Common",
  "Rare",
  "Legendary",
  "Cosmic Bonga",
];

export function NFTGallery() {
  const [filter, setFilter] = useState<RarityTier | "All">("All");
  const [selected, setSelected] = useState<BongaNFT | null>(null);

  const filtered =
    filter === "All"
      ? BONGA_NFTS
      : BONGA_NFTS.filter((n) => n.rarity === filter);

  return (
    <section id="gallery" className="section-anchor py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
          The <span className="text-gradient">Bonga</span> Gallery
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
          16 unique vibes — hippie, cosmic, beach, cyber and more. Each one a
          peaceful warrior with dreadlocks.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-bonga-orange text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
          {filtered.map((nft, i) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <NFTCard
                nft={nft}
                selected={selected?.id === nft.id}
                onClick={() => setSelected(nft)}
              />
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                exit={{ y: 40 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-bonga-orange/30 bg-card p-6"
              >
                <div className="mx-auto flex justify-center">
                  <BongaNFTArt nft={selected} size="md" />
                </div>
                <h3 className="mt-4 text-center font-display text-2xl font-bold">
                  {selected.name}
                </h3>
                <div className="mt-2 flex justify-center">
                  <Badge variant="purple">{selected.rarity}</Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {getTraitPose(selected.id) && (
                    <p className="rounded-lg bg-bonga-orange/10 px-3 py-2 text-xs font-medium text-bonga-orange">
                      <strong>Activity:</strong> {getTraitPose(selected.id)?.activity}
                    </p>
                  )}
                  <p>
                    <strong>Outfit:</strong> {selected.outfit}
                  </p>
                  <p>
                    <strong>Background:</strong> {selected.background}
                  </p>
                  <p>
                    <strong>Accessory:</strong> {selected.accessory}
                  </p>
                  <p>
                    <strong>Vibe:</strong> {selected.vibe}
                  </p>
                </div>
                <div className="mt-4 rounded-xl bg-muted/50 p-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">
                    Art prompt
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected.imagePrompt}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}