/** Unique pose + activity per collectible — the Bonga way */

export interface NFTTraitPose {
  activity: string;
  scene: string;
  image: string;
  glow?: string;
}

export const NFT_TRAIT_POSES: Record<number, NFTTraitPose> = {
  1: {
    activity: "Double peace sign, joint smoke, bat on shoulder",
    scene: "Classic chill hippie stance",
    image: "/nft/traits/bonga-01-peaceful.png",
  },
  2: {
    activity: "Lounging on beach towel with coconut drink",
    scene: "Tropical island chill",
    image: "/nft/traits/bonga-02-beach.png",
  },
  3: {
    activity: "Dancing at festival with glow sticks",
    scene: "Rave flower crown energy",
    image: "/nft/traits/bonga-03-festival.png",
  },
  4: {
    activity: "Watering sunflowers in overalls",
    scene: "Community garden earth mother",
    image: "/nft/traits/bonga-04-garden.png",
  },
  5: {
    activity: "Skateboarding on Venice boardwalk",
    scene: "Coastal cool bonk rider",
    image: "/nft/traits/bonga-05-skater.png",
  },
  6: {
    activity: "Lotus meditation with mala beads",
    scene: "Zen temple inner peace",
    image: "/nft/traits/bonga-06-meditation.png",
  },
  7: {
    activity: "Surfing a cosmic nebula wave",
    scene: "Space beach star surfer",
    image: "/nft/traits/bonga-07-cosmic-surfer.png",
    glow: "shadow-[0_0_40px_rgba(139,92,246,0.45)]",
  },
  8: {
    activity: "Hacking the matrix with holographic visor",
    scene: "Cyber rooftop future hippie",
    image: "/nft/traits/bonga-08-cyber.png",
    glow: "shadow-[0_0_36px_rgba(236,72,153,0.35)]",
  },
  9: {
    activity: "Jumping with rainbow pride cape",
    scene: "Love is love celebration",
    image: "/nft/traits/bonga-09-rainbow.png",
  },
  10: {
    activity: "Raising crystal staff at desert dusk",
    scene: "Mystic shaman wanderer",
    image: "/nft/traits/bonga-10-desert-shaman.png",
  },
  11: {
    activity: "Royal pose with golden bonk club",
    scene: "Cherry blossom temple legend",
    image: "/nft/traits/bonga-11-golden.png",
    glow: "shadow-[0_0_44px_rgba(251,191,36,0.5)]",
  },
  12: {
    activity: "Arms open under aurora borealis",
    scene: "Arctic ice crown magic",
    image: "/nft/traits/bonga-12-aurora.png",
    glow: "shadow-[0_0_40px_rgba(45,212,191,0.4)]",
  },
  13: {
    activity: "Power bonk swing near lava flows",
    scene: "Volcano fire spirit",
    image: "/nft/traits/bonga-13-volcano.png",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]",
  },
  14: {
    activity: "Hero stance with diamond club forward",
    scene: "Sparkling gem cave ultra rare",
    image: "/nft/traits/bonga-14-diamond.png",
    glow: "shadow-[0_0_44px_rgba(96,165,250,0.45)]",
  },
  15: {
    activity: "Levitating in deep space with orbiting moons",
    scene: "Cosmic Bonga Prime entity",
    image: "/nft/traits/bonga-15-cosmic-prime.png",
    glow: "shadow-[0_0_52px_rgba(255,98,0,0.45)]",
  },
  16: {
    activity: "Transcendent universe peace sign meditation",
    scene: "Infinite rainbow void ascension",
    image: "/nft/traits/bonga-16-eternal-peace.png",
    glow: "shadow-[0_0_56px_rgba(168,85,247,0.5)]",
  },
};

export function getTraitPose(id: number): NFTTraitPose | undefined {
  return NFT_TRAIT_POSES[id];
}