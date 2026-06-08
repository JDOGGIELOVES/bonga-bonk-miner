"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  type BongaNFT,
  RARITY_BADGE_VARIANT,
} from "@/lib/nft-collection";
import { getNFTArtStyle } from "@/lib/nft-art";
import { cn } from "@/lib/utils";

interface BongaNFTArtProps {
  nft: BongaNFT;
  size?: "xs" | "sm" | "md" | "lg";
  fillContainer?: boolean;
  showBadge?: boolean;
  showAccessory?: boolean;
  className?: string;
}

const SIZE_CLASS = {
  xs: "h-20 w-20",
  sm: "h-32 w-32",
  md: "h-48 w-48",
  lg: "h-64 w-64",
};

const IMAGE_PAD = {
  xs: "p-1.5",
  sm: "p-2",
  md: "p-3",
  lg: "p-4",
};

export function BongaNFTArt({
  nft,
  size = "md",
  fillContainer = false,
  showBadge = true,
  showAccessory = true,
  className,
}: BongaNFTArtProps) {
  const art = getNFTArtStyle(nft);
  const scale = art.scale ?? 1;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br shadow-lg",
        nft.gradient,
        fillContainer ? "aspect-square h-auto w-full" : SIZE_CLASS[size],
        art.glow,
        className
      )}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div
        className={cn(
          "relative flex h-full w-full items-end justify-center",
          IMAGE_PAD[size]
        )}
      >
        <div
          className="relative h-[88%] w-[88%]"
          style={{
            filter: art.filter,
            transform: `scale(${scale})`,
          }}
        >
          <Image
            src={art.image}
            alt={nft.name}
            fill
            className="object-contain object-bottom drop-shadow-xl"
            sizes="(max-width: 768px) 50vw, 256px"
          />
        </div>
      </div>

      {showBadge && (
        <Badge
          variant={RARITY_BADGE_VARIANT[nft.rarity]}
          className="absolute left-2 top-2 z-10 text-[10px]"
        >
          {nft.rarity}
        </Badge>
      )}

      {showAccessory && (
        <span className="absolute bottom-2 right-2 z-10 rounded-full bg-black/35 px-2 py-0.5 text-sm backdrop-blur-sm">
          {nft.emoji}
        </span>
      )}
    </div>
  );
}