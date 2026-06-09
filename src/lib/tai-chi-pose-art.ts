/** Bonga character art for each Tai Chi body position. */

export interface TaiChiPoseArt {
  id: string;
  caption: string;
  image: string;
}

const IMG = {
  idle: "/characters/bonga-idle.png",
  character: "/bonga-character.png",
  peaceful: "/nft/traits/bonga-01-peaceful.png",
  beach: "/nft/traits/bonga-02-beach.png",
  festival: "/nft/traits/bonga-03-festival.png",
  garden: "/nft/traits/bonga-04-garden.png",
  skater: "/nft/traits/bonga-05-skater.png",
  meditation: "/nft/traits/bonga-06-meditation.png",
  surfer: "/nft/traits/bonga-07-cosmic-surfer.png",
  rainbow: "/nft/traits/bonga-09-rainbow.png",
  shaman: "/nft/traits/bonga-10-desert-shaman.png",
  aurora: "/nft/traits/bonga-12-aurora.png",
  cosmic: "/nft/traits/bonga-15-cosmic-prime.png",
  eternal: "/nft/traits/bonga-16-eternal-peace.png",
  swing: "/characters/bonga-swing-impact.png",
  happy: "/characters/bonga-bonk-happy.png",
} as const;

export const TAI_CHI_POSE_ART: Record<string, TaiChiPoseArt> = {
  "stand-neutral": { id: "stand-neutral", caption: "Stand tall", image: IMG.idle },
  "stand-relaxed": { id: "stand-relaxed", caption: "Shoulders soft", image: IMG.meditation },
  "shoulders-drop-mid": { id: "shoulders-drop-mid", caption: "Exhale, melt down", image: IMG.peaceful },
  "arms-down": { id: "arms-down", caption: "Arms resting", image: IMG.idle },
  "arms-half": { id: "arms-half", caption: "Lifting halfway", image: IMG.character },
  "arms-raised": { id: "arms-raised", caption: "Top — sun raised", image: IMG.aurora },
  "palms-down": { id: "palms-down", caption: "Palms float down", image: IMG.meditation },
  "cloud-left": { id: "cloud-left", caption: "Drift left", image: IMG.surfer },
  "cloud-center": { id: "cloud-center", caption: "Float through center", image: IMG.surfer },
  "cloud-right": { id: "cloud-right", caption: "Top — full sweep", image: IMG.rainbow },
  "brush-left": { id: "brush-left", caption: "Brush left", image: IMG.swing },
  "brush-center": { id: "brush-center", caption: "Turn through center", image: IMG.happy },
  "brush-right": { id: "brush-right", caption: "Top — brush right", image: IMG.swing },
  "hands-rise": { id: "hands-rise", caption: "Hands rising", image: IMG.peaceful },
  "hands-belly": { id: "hands-belly", caption: "Top — belly rest", image: IMG.meditation },
  "ground-feet": { id: "ground-feet", caption: "Top — rooted", image: IMG.meditation },
  "soft-knees": { id: "soft-knees", caption: "Knees soften", image: IMG.beach },
  "wave-low": { id: "wave-low", caption: "Wave low", image: IMG.festival },
  "wave-mid": { id: "wave-mid", caption: "Ripple through", image: IMG.festival },
  "wave-high": { id: "wave-high", caption: "Top — arms wide", image: IMG.aurora },
  "hold-ball": { id: "hold-ball", caption: "Cup the orb", image: IMG.cosmic },
  "shift-left-ball": { id: "shift-left-ball", caption: "Shift left", image: IMG.cosmic },
  "shift-right-ball": { id: "shift-right-ball", caption: "Top — shift right", image: IMG.cosmic },
  "press-mid": { id: "press-mid", caption: "Pressing down", image: IMG.shaman },
  "press-down": { id: "press-down", caption: "Top — full release", image: IMG.shaman },
  "meadow-root": { id: "meadow-root", caption: "Top — meadow root", image: IMG.garden },
  "breathe-open": { id: "breathe-open", caption: "Breathe sunset in", image: IMG.garden },
  "gate-center": { id: "gate-center", caption: "Centered", image: IMG.idle },
  "gate-open-left": { id: "gate-open-left", caption: "Gate opens left", image: IMG.aurora },
  "gate-open-right": { id: "gate-open-right", caption: "Top — gate wide", image: IMG.aurora },
  "repulse-left": { id: "repulse-left", caption: "Push left", image: IMG.swing },
  "repulse-center": { id: "repulse-center", caption: "Gather the push", image: IMG.happy },
  "repulse-right": { id: "repulse-right", caption: "Top — push right", image: IMG.swing },
  "gather-in": { id: "gather-in", caption: "Gather inward", image: IMG.eternal },
  "gather-mid": { id: "gather-mid", caption: "Hold at chest", image: IMG.peaceful },
  "gather-out": { id: "gather-out", caption: "Top — expand out", image: IMG.eternal },
  "hands-rise-heart": { id: "hands-rise-heart", caption: "Rise to heart", image: IMG.peaceful },
  "hands-heart": { id: "hands-heart", caption: "Top — hands at heart", image: IMG.peaceful },
  "float-stance": { id: "float-stance", caption: "Top — cosmic float", image: IMG.surfer },
  "knees-soft-mid": { id: "knees-soft-mid", caption: "Soft knees", image: IMG.surfer },
  "rooster-left": { id: "rooster-left", caption: "Left knee lifts", image: IMG.skater },
  "rooster-center": { id: "rooster-center", caption: "Find balance", image: IMG.skater },
  "rooster-right": { id: "rooster-right", caption: "Top — other leg", image: IMG.skater },
  "wave-rider-left": { id: "wave-rider-left", caption: "Ride left", image: IMG.surfer },
  "wave-rider-center": { id: "wave-rider-center", caption: "Through center", image: IMG.surfer },
  "wave-rider-right": { id: "wave-rider-right", caption: "Top — ride right", image: IMG.surfer },
  "palms-up": { id: "palms-up", caption: "Top — palms open", image: IMG.eternal },
  "palms-mid": { id: "palms-mid", caption: "Palms lowering", image: IMG.peaceful },
  "palms-rest": { id: "palms-rest", caption: "Settle in", image: IMG.meditation },
};

export function getTaiChiPoseArt(id: string): TaiChiPoseArt | undefined {
  return TAI_CHI_POSE_ART[id];
}