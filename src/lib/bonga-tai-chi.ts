/** Gentle Tai Chi–inspired flows — the Bonga way: slow, playful, peaceful. */

export interface TaiChiStep {
  title: string;
  instruction: string;
  /** Seconds to hold or move through this step */
  durationSec: number;
}

export interface TaiChiSession {
  id: string;
  title: string;
  subtitle: string;
  durationMin: number;
  emoji: string;
  guideTraitId: number;
  vibe: string;
  steps: TaiChiStep[];
}

export const TAI_CHI_SESSIONS: TaiChiSession[] = [
  {
    id: "morning-peace",
    title: "Morning Peace Flow",
    subtitle: "Wake up soft — open the body with cloud hands and good vibes",
    durationMin: 5,
    emoji: "🌅",
    guideTraitId: 1,
    vibe: "Classic hippie",
    steps: [
      {
        title: "Arrive & breathe",
        instruction:
          "Stand tall, feet shoulder-width, knees soft. Inhale through the nose, exhale with a quiet ✌️. Let the shoulders drop.",
        durationSec: 45,
      },
      {
        title: "Raise the sun",
        instruction:
          "Slowly lift both arms like you're raising the morning sun. Palms turn down as arms lower. Repeat three times — smooth, no rush.",
        durationSec: 60,
      },
      {
        title: "Cloud hands",
        instruction:
          "Shift weight left, arms float right. Shift right, arms float left. Imagine moving through warm clouds. Stay relaxed in the hips.",
        durationSec: 90,
      },
      {
        title: "Bonk the stress away",
        instruction:
          "Gentle waist turns. Let one hand drift back, one forward — like brushing stress behind you. Smile optional, recommended.",
        durationSec: 60,
      },
      {
        title: "Close with peace",
        instruction:
          "Hands rest at the lower belly. Three slow breaths. Whisper: \"Peace, love, good bonks.\" Carry that into your day.",
        durationSec: 45,
      },
    ],
  },
  {
    id: "bonk-release",
    title: "Bonk & Breathe",
    subtitle: "Short reset when the timeline gets loud",
    durationMin: 3,
    emoji: "🧘",
    guideTraitId: 6,
    vibe: "Inner peace",
    steps: [
      {
        title: "Ground",
        instruction:
          "Feel all four corners of your feet. Soften the jaw. You're not fixing anything — just arriving.",
        durationSec: 30,
      },
      {
        title: "Wave arms",
        instruction:
          "Arms ripple like water — up the body, out to the sides, down. Match your breath. Slow is the speed limit.",
        durationSec: 50,
      },
      {
        title: "Hold the ball",
        instruction:
          "Cup an imaginary glowing orb at chest height. Shift weight side to side. The orb stays centered — you stay calm.",
        durationSec: 50,
      },
      {
        title: "Release",
        instruction:
          "Press palms down toward the earth, letting tension drain. One deep exhale. Done. Go bonk something nice.",
        durationSec: 40,
      },
    ],
  },
  {
    id: "sunset-meadow",
    title: "Sunset Meadow Flow",
    subtitle: "Longer flow for evening wind-down",
    durationMin: 7,
    emoji: "🌇",
    guideTraitId: 4,
    vibe: "Earth mother",
    steps: [
      {
        title: "Root in the meadow",
        instruction:
          "Stand easy. Imagine grass under your feet. Breathe in golden sunset light, breathe out the day's noise.",
        durationSec: 50,
      },
      {
        title: "Open the gate",
        instruction:
          "One foot steps out, arms open wide like welcoming a friend. Return to center. Other side. Flow, don't force.",
        durationSec: 70,
      },
      {
        title: "Repulse the monkey",
        instruction:
          "Soft circular push with one hand, other hand rests at the side. Shift weight into the back leg. Switch sides slowly.",
        durationSec: 80,
      },
      {
        title: "Gather qi",
        instruction:
          "Both hands gather inward, then expand outward — sharing peace with the room. Repeat until it feels silly-good.",
        durationSec: 80,
      },
      {
        title: "Garden close",
        instruction:
          "Hands fold at heart. Bow to yourself for showing up. The meadow is always here when you need it.",
        durationSec: 60,
      },
    ],
  },
  {
    id: "cosmic-balance",
    title: "Cosmic Balance",
    subtitle: "Find center when everything feels wavy",
    durationMin: 4,
    emoji: "🌌",
    guideTraitId: 7,
    vibe: "Space beach",
    steps: [
      {
        title: "Float in place",
        instruction:
          "Micro-bend the knees. Imagine low gravity. Shoulders melt down. You're on a cosmic surfboard — just balance.",
        durationSec: 40,
      },
      {
        title: "Golden rooster",
        instruction:
          "One knee lifts softly, arms frame the body. Hold only as long as comfortable. Lower with control. Other leg.",
        durationSec: 70,
      },
      {
        title: "Wave rider",
        instruction:
          "Weight shifts like riding a slow nebula wave. Arms follow the tide. No perfect form — only smooth intention.",
        durationSec: 70,
      },
      {
        title: "Star close",
        instruction:
          "Feet settle. Palms up at sides, then down to rest. You are the still point. The universe can wait.",
        durationSec: 50,
      },
    ],
  },
];

export function getTaiChiSession(id: string): TaiChiSession | undefined {
  return TAI_CHI_SESSIONS.find((s) => s.id === id);
}

export function getSessionTotalSeconds(session: TaiChiSession): number {
  return session.steps.reduce((sum, step) => sum + step.durationSec, 0);
}