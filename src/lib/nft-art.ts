import type { BongaNFT } from "@/lib/nft-collection";

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
}

/** Real Bonga PNG + per-trait color grading for 16 unique looks */
export const NFT_ART_STYLES: Record<number, NFTArtStyle> = {
  1: { image: BONGA_POSES.default, scale: 1.05 },
  2: { image: BONGA_POSES.idle, filter: "saturate(1.15) hue-rotate(-8deg)" },
  3: { image: BONGA_POSES.happy, filter: "saturate(1.35) contrast(1.05)" },
  4: { image: BONGA_POSES.default, filter: "hue-rotate(70deg) saturate(1.1)" },
  5: { image: BONGA_POSES.swing, filter: "saturate(1.2) brightness(1.05)" },
  6: { image: BONGA_POSES.idle, filter: "saturate(0.95) brightness(1.08)" },
  7: {
    image: BONGA_POSES.default,
    filter: "hue-rotate(220deg) saturate(1.25)",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.45)]",
  },
  8: {
    image: BONGA_POSES.swing,
    filter: "hue-rotate(270deg) contrast(1.12) saturate(1.3)",
    glow: "shadow-[0_0_36px_rgba(236,72,153,0.35)]",
  },
  9: { image: BONGA_POSES.happy, filter: "saturate(1.5) hue-rotate(15deg)" },
  10: {
    image: BONGA_POSES.default,
    filter: "sepia(0.25) hue-rotate(10deg) saturate(1.2)",
  },
  11: {
    image: BONGA_POSES.idle,
    filter: "sepia(0.4) saturate(1.35) brightness(1.12)",
    glow: "shadow-[0_0_44px_rgba(251,191,36,0.5)]",
  },
  12: {
    image: BONGA_POSES.default,
    filter: "hue-rotate(150deg) saturate(1.2) brightness(1.05)",
    glow: "shadow-[0_0_40px_rgba(45,212,191,0.4)]",
  },
  13: {
    image: BONGA_POSES.swing,
    filter: "hue-rotate(-25deg) saturate(1.55) contrast(1.1)",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]",
  },
  14: {
    image: BONGA_POSES.happy,
    filter: "brightness(1.15) contrast(1.08) saturate(0.9)",
    glow: "shadow-[0_0_44px_rgba(96,165,250,0.45)]",
  },
  15: {
    image: BONGA_POSES.default,
    filter: "hue-rotate(200deg) saturate(1.4) contrast(1.05)",
    glow: "shadow-[0_0_52px_rgba(255,98,0,0.45)]",
  },
  16: {
    image: BONGA_POSES.idle,
    filter: "hue-rotate(290deg) saturate(1.35) brightness(1.08)",
    glow: "shadow-[0_0_56px_rgba(168,85,247,0.5)]",
  },
};

export function getNFTArtStyle(nft: BongaNFT): NFTArtStyle {
  return (
    NFT_ART_STYLES[nft.id] ?? {
      image: BONGA_POSES.default,
      scale: 1,
    }
  );
}