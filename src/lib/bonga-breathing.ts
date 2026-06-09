/** Guided breathing patterns — slow, playful, peaceful. */

export type BreathPhase = "inhale" | "hold" | "exhale" | "holdOut";

export interface BreathPhaseStep {
  phase: BreathPhase;
  durationSec: number;
  label: string;
}

export interface BreathingPattern {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  durationMin: number;
  /** One full cycle; repeats until session ends or user stops */
  cycle: BreathPhaseStep[];
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: "box",
    title: "Box Breath",
    subtitle: "Four counts in, hold, out, hold — steady as a bonk block",
    emoji: "📦",
    durationMin: 3,
    cycle: [
      { phase: "inhale", durationSec: 4, label: "Breathe in" },
      { phase: "hold", durationSec: 4, label: "Hold" },
      { phase: "exhale", durationSec: 4, label: "Breathe out" },
      { phase: "holdOut", durationSec: 4, label: "Hold" },
    ],
  },
  {
    id: "four-seven-eight",
    title: "4-7-8 Calm",
    subtitle: "Classic wind-down — longer exhale, softer mind",
    emoji: "🌙",
    durationMin: 4,
    cycle: [
      { phase: "inhale", durationSec: 4, label: "Breathe in" },
      { phase: "hold", durationSec: 7, label: "Hold gently" },
      { phase: "exhale", durationSec: 8, label: "Long exhale" },
    ],
  },
  {
    id: "bonk-breathe",
    title: "Bonk & Breathe",
    subtitle: "Quick 1-minute reset — inhale peace, exhale the noise",
    emoji: "🧘",
    durationMin: 1,
    cycle: [
      { phase: "inhale", durationSec: 3, label: "Inhale ✌️" },
      { phase: "exhale", durationSec: 4, label: "Exhale the bonk" },
    ],
  },
];

export function getBreathingPattern(id: string): BreathingPattern | undefined {
  return BREATHING_PATTERNS.find((p) => p.id === id);
}

export function getCycleDurationSec(pattern: BreathingPattern): number {
  return pattern.cycle.reduce((sum, step) => sum + step.durationSec, 0);
}

export const PHASE_COLORS: Record<BreathPhase, string> = {
  inhale: "from-bonga-teal/40 to-bonga-teal/10",
  hold: "from-bonga-purple/40 to-bonga-purple/10",
  exhale: "from-bonga-orange/40 to-bonga-orange/10",
  holdOut: "from-bonga-purple/30 to-bonga-teal/10",
};