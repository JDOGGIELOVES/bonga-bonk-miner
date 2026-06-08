"use client";

import { motion } from "framer-motion";
import { BongaNFTArt } from "@/components/nft/bonga-nft-art";
import type { BongaNFT } from "@/lib/nft-collection";

interface NFTCardProps {
  nft: BongaNFT;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export function NFTCard({ nft, onClick, selected, compact }: NFTCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer overflow-hidden rounded-2xl border-2 bg-card shadow-md transition-colors ${
        selected
          ? "border-bonga-orange shadow-bonga-orange/20"
          : "border-border/50 hover:border-bonga-teal/40"
      }`}
    >
      <BongaNFTArt
        nft={nft}
        size={compact ? "sm" : "md"}
        fillContainer
        className="rounded-none shadow-none"
      />
      {!compact && (
        <div className="p-3">
          <h3 className="font-display font-bold">{nft.name}</h3>
          <p className="text-xs text-muted-foreground">
            {nft.outfit} · {nft.background}
          </p>
        </div>
      )}
    </motion.div>
  );
}