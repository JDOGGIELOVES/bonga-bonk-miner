import type { BongaNFT } from "@/lib/nft-collection";
import { getTraitPose } from "@/lib/nft-trait-poses";
import { getTraitScene } from "@/lib/nft-trait-scenes";

export const BONGA_POSES = {
  default: "/bonga-character.png",
  idle: "/characters/bonga-idle.png",
  swing: "/characters/bonga-swing-impact.png",
  happy: "/characters/bonga-bonk-happy.png",
} as const;

export interface NFTArtStyle {
  image: string;
  filter?: string;
  glow?: string;
  scale?: number;
  activity?: string;
  scene?: string;
}

export function getNFTArtStyle(nft: BongaNFT): NFTArtStyle {
  const trait = getTraitPose(nft.id);
  const scene = getTraitScene(nft.id);

  if (trait || scene) {
    return {
      image: trait?.image ?? BONGA_POSES[scene?.pose ?? "default"],
      glow: trait?.glow ?? scene?.glow,
      filter: scene?.filter,
      scale: scene?.scale ?? 1,
      activity: trait?.activity,
      scene: trait?.scene,
    };
  }

  return {
    image: BONGA_POSES.default,
    scale: 1,
  };
}