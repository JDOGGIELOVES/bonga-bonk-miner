"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  type BongaNFT,
  RARITY_BADGE_VARIANT,
} from "@/lib/nft-collection";

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
      <div
        className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${nft.gradient} ${compact ? "text-4xl" : "text-6xl"}`}
      >
        <span className="drop-shadow-lg">{nft.emoji}</span>
        <div className="absolute inset-0 bg-black/10" />
        <Badge
          variant={RARITY_BADGE_VARIANT[nft.rarity]}
          className="absolute left-2 top-2 text-[10px]"
        >
          {nft.rarity}
        </Badge>
      </div>
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