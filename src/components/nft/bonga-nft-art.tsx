"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  type BongaNFT,
  RARITY_BADGE_VARIANT,
} from "@/lib/nft-collection";
import { BONGA_POSES, getNFTArtStyle } from "@/lib/nft-art";
import { getTraitScene } from "@/lib/nft-trait-scenes";
import { getTraitPose } from "@/lib/nft-trait-poses";
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
  xs: "p-1",
  sm: "p-1.5",
  md: "p-2.5",
  lg: "p-3",
};

function SceneEmoji({
  layer,
}: {
  layer: { emoji: string; className: string; size?: string };
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-20 drop-shadow-md",
        layer.size ?? "text-xl",
        layer.className
      )}
      aria-hidden
    >
      {layer.emoji}
    </span>
  );
}

export function BongaNFTArt({
  nft,
  size = "md",
  fillContainer = false,
  showBadge = true,
  showAccessory = true,
  className,
}: BongaNFTArtProps) {
  const art = getNFTArtStyle(nft);
  const scene = getTraitScene(nft.id);
  const trait = getTraitPose(nft.id);
  const [useDedicated, setUseDedicated] = useState(Boolean(trait?.image));

  const poseImage = scene
    ? BONGA_POSES[scene.pose]
    : BONGA_POSES.default;
  const dedicatedImage = trait?.image;
  const showingDedicated = useDedicated && Boolean(dedicatedImage);
  const imageSrc = showingDedicated ? dedicatedImage! : poseImage;

  const scale = showingDedicated ? 1 : (scene?.scale ?? art.scale ?? 1);
  const showSceneLayers = !showingDedicated && Boolean(scene);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br shadow-lg",
        nft.gradient,
        fillContainer ? "aspect-square h-auto w-full" : SIZE_CLASS[size],
        scene?.glow ?? art.glow,
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-black/10" />

      {showSceneLayers &&
        scene?.background.map((layer, i) => (
          <SceneEmoji key={`bg-${i}`} layer={layer} />
        ))}

      <div
        className={cn(
          "relative flex h-full w-full items-end justify-center",
          IMAGE_PAD[size]
        )}
      >
        <div
          className={cn(
            "relative h-[90%] w-[90%] transition-transform",
            scene?.yOffset,
            scene?.characterClass
          )}
          style={{
            filter: showingDedicated
              ? undefined
              : (scene?.filter ?? art.filter),
            transform: `scale(${scale})`,
          }}
        >
          <Image
            src={imageSrc}
            alt={`${nft.name} — ${trait?.activity ?? nft.vibe}`}
            fill
            className="object-contain object-bottom drop-shadow-xl"
            sizes="(max-width: 768px) 50vw, 256px"
            onError={() => {
              if (dedicatedImage) setUseDedicated(false);
            }}
          />
        </div>
      </div>

      {showSceneLayers &&
        scene?.foreground.map((layer, i) => (
          <SceneEmoji key={`fg-${i}`} layer={layer} />
        ))}

      {showBadge && (
        <Badge
          variant={RARITY_BADGE_VARIANT[nft.rarity]}
          className="absolute left-2 top-2 z-30 text-[10px]"
        >
          {nft.rarity}
        </Badge>
      )}

      {showAccessory && (
        <span className="absolute bottom-2 right-2 z-30 rounded-full bg-black/40 px-2 py-0.5 text-sm backdrop-blur-sm">
          {nft.emoji}
        </span>
      )}
    </div>
  );
}