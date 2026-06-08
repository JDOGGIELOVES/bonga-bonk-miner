import { BONGA_POSES } from "@/lib/nft-art";

export interface TraitSceneLayer {
  emoji: string;
  className: string;
  size?: string;
}

export interface NFTTraitScene {
  pose: keyof typeof BONGA_POSES;
  image?: string;
  characterClass?: string;
  filter?: string;
  glow?: string;
  scale?: number;
  yOffset?: string;
  backdrop?: string;
  foreground: TraitSceneLayer[];
  background: TraitSceneLayer[];
}

/**
 * Per-trait pose + activity composition until dedicated PNGs land in /nft/traits/.
 */
export const NFT_TRAIT_SCENES: Record<number, NFTTraitScene> = {
  1: {
    pose: "default",
    scale: 1.02,
    foreground: [
      { emoji: "✌️", className: "left-[8%] top-[18%]", size: "text-2xl" },
      { emoji: "✌️", className: "right-[8%] top-[20%]", size: "text-2xl" },
    ],
    background: [{ emoji: "🌅", className: "right-3 top-3 opacity-70", size: "text-xl" }],
  },
  2: {
    pose: "idle",
    scale: 0.95,
    yOffset: "translate-y-2",
    filter: "saturate(1.1) hue-rotate(-5deg)",
    foreground: [
      { emoji: "🏖️", className: "left-2 bottom-8", size: "text-3xl" },
      { emoji: "🥥", className: "right-4 bottom-12", size: "text-2xl" },
      { emoji: "🐚", className: "left-6 bottom-14", size: "text-lg" },
    ],
    background: [{ emoji: "🌴", className: "right-2 top-2 opacity-80", size: "text-2xl" }],
  },
  3: {
    pose: "happy",
    scale: 1.05,
    characterClass: "-rotate-6",
    filter: "saturate(1.35)",
    foreground: [
      { emoji: "🎪", className: "left-3 top-4", size: "text-2xl" },
      { emoji: "✨", className: "right-5 top-8", size: "text-xl" },
      { emoji: "🌸", className: "left-8 top-10", size: "text-lg" },
    ],
    background: [
      { emoji: "🎶", className: "right-2 bottom-10 opacity-80", size: "text-xl" },
      { emoji: "💃", className: "left-2 bottom-6 opacity-60", size: "text-lg" },
    ],
  },
  4: {
    pose: "idle",
    scale: 0.92,
    yOffset: "translate-y-3",
    filter: "hue-rotate(65deg) saturate(1.1)",
    foreground: [
      { emoji: "🌻", className: "left-2 bottom-10", size: "text-3xl" },
      { emoji: "🪴", className: "right-3 bottom-8", size: "text-2xl" },
      { emoji: "💧", className: "left-10 bottom-16", size: "text-lg" },
    ],
    background: [{ emoji: "🌿", className: "right-2 top-3", size: "text-2xl" }],
  },
  5: {
    pose: "swing",
    scale: 1,
    characterClass: "rotate-3",
    filter: "saturate(1.15)",
    foreground: [
      { emoji: "🛹", className: "left-1/2 -translate-x-1/2 bottom-6", size: "text-4xl" },
      { emoji: "🌊", className: "right-2 bottom-12 opacity-70", size: "text-xl" },
    ],
    background: [{ emoji: "☀️", className: "left-3 top-3", size: "text-xl" }],
  },
  6: {
    pose: "idle",
    scale: 0.88,
    yOffset: "translate-y-4",
    filter: "saturate(0.95) brightness(1.05)",
    foreground: [
      { emoji: "🧘", className: "left-1/2 -translate-x-1/2 bottom-8", size: "text-3xl" },
      { emoji: "📿", className: "right-4 top-16", size: "text-xl" },
    ],
    background: [{ emoji: "🪷", className: "left-3 top-4 opacity-80", size: "text-2xl" }],
  },
  7: {
    pose: "swing",
    scale: 1.08,
    characterClass: "-rotate-12",
    filter: "hue-rotate(220deg) saturate(1.3)",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.45)]",
    foreground: [
      { emoji: "🏄", className: "left-1/2 -translate-x-1/2 bottom-5", size: "text-4xl" },
      { emoji: "🌊", className: "left-2 bottom-10", size: "text-3xl" },
    ],
    background: [{ emoji: "🪐", className: "right-2 top-2", size: "text-2xl" }],
  },
  8: {
    pose: "default",
    scale: 1,
    filter: "hue-rotate(270deg) saturate(1.25) contrast(1.08)",
    glow: "shadow-[0_0_36px_rgba(236,72,153,0.35)]",
    foreground: [
      { emoji: "🤖", className: "right-3 top-14", size: "text-2xl" },
      { emoji: "💻", className: "left-3 bottom-12", size: "text-2xl" },
    ],
    background: [{ emoji: "🌃", className: "right-2 top-2 opacity-80", size: "text-xl" }],
  },
  9: {
    pose: "happy",
    scale: 1.06,
    characterClass: "rotate-6",
    filter: "saturate(1.45)",
    foreground: [
      { emoji: "🌈", className: "left-1/2 -translate-x-1/2 top-6", size: "text-3xl" },
      { emoji: "😎", className: "right-5 top-14", size: "text-xl" },
    ],
    background: [{ emoji: "❤️", className: "left-3 top-4", size: "text-xl" }],
  },
  10: {
    pose: "default",
    scale: 0.98,
    filter: "sepia(0.2) hue-rotate(15deg)",
    foreground: [
      { emoji: "🔮", className: "right-4 bottom-14", size: "text-3xl" },
      { emoji: "🏜️", className: "left-2 bottom-8", size: "text-2xl" },
    ],
    background: [{ emoji: "🌙", className: "right-2 top-3", size: "text-xl" }],
  },
  11: {
    pose: "idle",
    scale: 1,
    filter: "sepia(0.35) saturate(1.3) brightness(1.1)",
    glow: "shadow-[0_0_44px_rgba(251,191,36,0.5)]",
    foreground: [
      { emoji: "👑", className: "left-1/2 -translate-x-1/2 top-5", size: "text-2xl" },
      { emoji: "🌸", className: "left-3 bottom-10", size: "text-2xl" },
    ],
    background: [{ emoji: "⛩️", className: "right-2 top-2 opacity-70", size: "text-xl" }],
  },
  12: {
    pose: "happy",
    scale: 1.02,
    filter: "hue-rotate(150deg) saturate(1.15)",
    glow: "shadow-[0_0_40px_rgba(45,212,191,0.4)]",
    foreground: [
      { emoji: "❄️", className: "left-4 top-12", size: "text-2xl" },
      { emoji: "🌌", className: "right-3 top-8", size: "text-2xl" },
    ],
    background: [{ emoji: "✨", className: "left-2 top-3", size: "text-xl" }],
  },
  13: {
    pose: "swing",
    scale: 1.1,
    characterClass: "-rotate-3",
    filter: "hue-rotate(-20deg) saturate(1.5)",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]",
    foreground: [
      { emoji: "🌋", className: "left-2 bottom-8", size: "text-3xl" },
      { emoji: "🔥", className: "right-4 top-12", size: "text-2xl" },
    ],
    background: [{ emoji: "💥", className: "right-2 top-3", size: "text-xl" }],
  },
  14: {
    pose: "swing",
    scale: 1.05,
    filter: "brightness(1.12) contrast(1.05)",
    glow: "shadow-[0_0_44px_rgba(96,165,250,0.45)]",
    foreground: [
      { emoji: "💎", className: "right-3 top-10", size: "text-3xl" },
      { emoji: "✨", className: "left-4 top-14", size: "text-xl" },
    ],
    background: [{ emoji: "🪨", className: "left-2 bottom-8 opacity-70", size: "text-2xl" }],
  },
  15: {
    pose: "happy",
    scale: 1.08,
    yOffset: "-translate-y-2",
    filter: "hue-rotate(200deg) saturate(1.35)",
    glow: "shadow-[0_0_52px_rgba(255,98,0,0.45)]",
    foreground: [
      { emoji: "🌙", className: "left-6 top-8", size: "text-lg" },
      { emoji: "🌙", className: "right-6 top-12", size: "text-sm" },
      { emoji: "🪐", className: "left-1/2 -translate-x-1/2 top-4", size: "text-2xl" },
    ],
    background: [{ emoji: "🌌", className: "right-2 bottom-6", size: "text-3xl" }],
  },
  16: {
    pose: "idle",
    scale: 1,
    yOffset: "-translate-y-1",
    filter: "hue-rotate(285deg) saturate(1.3) brightness(1.06)",
    glow: "shadow-[0_0_56px_rgba(168,85,247,0.5)]",
    foreground: [
      { emoji: "☮️", className: "left-1/2 -translate-x-1/2 top-6", size: "text-4xl" },
      { emoji: "✨", className: "left-3 bottom-12", size: "text-xl" },
      { emoji: "✨", className: "right-3 bottom-10", size: "text-xl" },
    ],
    background: [{ emoji: "🌈", className: "right-2 top-2 opacity-80", size: "text-2xl" }],
  },
};

export function getTraitScene(id: number): NFTTraitScene | undefined {
  return NFT_TRAIT_SCENES[id];
}