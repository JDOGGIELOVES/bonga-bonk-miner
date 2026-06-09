/** Transcendental meditation–inspired practice — the Bonga way: effortless, mantra-soft, peaceful. */

export interface TmStep {
  title: string;
  instruction: string;
  durationSec: number;
}

export interface TmSession {
  id: string;
  title: string;
  subtitle: string;
  durationMin: number;
  emoji: string;
  defaultMantra: string;
  steps: TmStep[];
}

export interface TmMantraOption {
  id: string;
  label: string;
  sound: string;
  note: string;
}

export const TM_MANTRAS: TmMantraOption[] = [
  {
    id: "bonga",
    label: "Bonga",
    sound: "Bonga",
    note: "Soft and familiar — let the syllables float without meaning",
  },
  {
    id: "so-hum",
    label: "So Hum",
    sound: "So hum",
    note: "Classic gentle sound — effortless, not chanted aloud",
  },
  {
    id: "peace",
    label: "Peace",
    sound: "Peace",
    note: "One word, repeated silently like a quiet ripple",
  },
  {
    id: "aum",
    label: "Aum",
    sound: "Aum",
    note: "A single soft vibration — no force, no performance",
  },
];

export const TM_CORE_INSTRUCTIONS = [
  {
    title: "Sit easy",
    body: "Comfortable chair or cushion. Back supported but not rigid. Hands rest in your lap. No perfect posture required — just settled.",
  },
  {
    title: "Eyes closed",
    body: "Gently close your eyes. You're not trying to blank the mind — thoughts can come and go like clouds.",
  },
  {
    title: "Repeat the mantra silently",
    body: "Choose a soft sound and repeat it inwardly, without strain. When you notice you've drifted, gently return. No bonking yourself for wandering.",
  },
  {
    title: "Effortless is the rule",
    body: "Transcendental-style meditation isn't concentration or visualization. Let the mantra get quieter over time. Fainter is fine. Gone is also fine — return when you notice.",
  },
  {
    title: "Close slowly",
    body: "Don't snap back to the timeline. Sit for a minute with eyes still closed, then open them soft. Whisper: peace, love, good bonks.",
  },
] as const;

export const TM_SESSIONS: TmSession[] = [
  {
    id: "tm-intro",
    title: "TM Intro",
    subtitle: "Learn the Bonga way — mantra basics in five minutes",
    durationMin: 5,
    emoji: "🕉️",
    defaultMantra: "Bonga",
    steps: [
      {
        title: "Arrive in your seat",
        instruction:
          "Sit comfortably. Feet flat or crossed — whatever lets the hips feel easy. Shoulders drop. Jaw unclenches. You're not fixing yourself, just landing.",
        durationSec: 45,
      },
      {
        title: "Close the eyes",
        instruction:
          "Eyes close softly. Take one natural breath. Notice sounds around you without chasing them. Let the room exist — you don't have to manage it.",
        durationSec: 45,
      },
      {
        title: "Meet your mantra",
        instruction:
          "Pick a gentle sound — Bonga, So hum, Peace, or Aum. Repeat it silently in the mind, easy as a whisper you almost can't hear. No rhythm required. No effort to feel special.",
        durationSec: 60,
      },
      {
        title: "Drift and return",
        instruction:
          "Thoughts will bonk in — charts, texts, yesterday's noise. That's normal. When you notice, don't scold. Gently pick the mantra back up. Fainter is perfect. Missing is fine — return is the practice.",
        durationSec: 120,
      },
      {
        title: "Close with peace",
        instruction:
          "Let the mantra fade on its own. Sit quietly for a few breaths. Open your eyes slowly. Carry the stillness into your next bonk — or your next nap. Peace, love, good bonks.",
        durationSec: 30,
      },
    ],
  },
  {
    id: "tm-classic",
    title: "Classic 20-Minute Sit",
    subtitle: "Standard transcendental-style session — deep rest, zero strain",
    durationMin: 20,
    emoji: "🧘",
    defaultMantra: "So hum",
    steps: [
      {
        title: "Settle in",
        instruction:
          "Find your seat. Spine tall enough to stay awake, soft enough to melt. Hands rest. Tongue unpressed from the roof of the mouth. Arrive for real — the timeline can wait twenty minutes.",
        durationSec: 90,
      },
      {
        title: "Let the body land",
        instruction:
          "Eyes closed. Feel weight in the chair or cushion. Soften the belly. One breath in, one breath out — then let breathing do its own thing. You're not controlling it.",
        durationSec: 90,
      },
      {
        title: "Begin the mantra",
        instruction:
          "Silently repeat your mantra. Not aloud. Not with force. Like a leaf floating on water — there, then almost not there. If it speeds up or slows down, let it. You're the meadow, not the storm.",
        durationSec: 960,
      },
      {
        title: "Gentle close",
        instruction:
          "Stop repeating the mantra. Sit in the quiet for a minute or two. No rush to check your phone. Open your eyes when they want to open. Raise your frequency one soft sit at a time.",
        durationSec: 120,
      },
    ],
  },
  {
    id: "tm-morning",
    title: "Morning Frequency",
    subtitle: "Fifteen minutes before the bonks begin — set the day's vibe",
    durationMin: 15,
    emoji: "🌅",
    defaultMantra: "Bonga",
    steps: [
      {
        title: "Wake the sit",
        instruction:
          "Morning you doesn't need to be perfect. Sit, close your eyes, and let the night drain out through the soles of your feet. Today can be 1% more peaceful.",
        durationSec: 60,
      },
      {
        title: "Mantra sunrise",
        instruction:
          "Repeat your mantra silently as the mind wakes up. Thoughts about the day may rush in — meetings, charts, bonks to make. Notice, return, repeat. No judgment bonks.",
        durationSec: 720,
      },
      {
        title: "Open to the day",
        instruction:
          "Release the mantra. Three slow breaths. Imagine carrying meadow energy into whatever room you walk into next. Go bonk something nice.",
        durationSec: 120,
      },
    ],
  },
  {
    id: "tm-evening",
    title: "Evening Melt",
    subtitle: "Ten minutes to unbonk the day — wind down before sleep",
    durationMin: 10,
    emoji: "🌙",
    defaultMantra: "Peace",
    steps: [
      {
        title: "Unload the day",
        instruction:
          "Sit or lie back in a chair — head supported if you need it. Eyes close. Let today's noise sit in the waiting room. You don't have to solve anything right now.",
        durationSec: 60,
      },
      {
        title: "Soft mantra melt",
        instruction:
          "Repeat Peace, Bonga, or your chosen sound inwardly. Slower than morning. Fainter than afternoon. If you get sleepy, that's a compliment to your nervous system.",
        durationSec: 480,
      },
      {
        title: "Drift out",
        instruction:
          "Let the mantra dissolve. Stay still a moment longer. If you're heading to bed, skip the scroll. The meadow is always here when you need it.",
        durationSec: 60,
      },
    ],
  },
];

export function getTmSession(id: string): TmSession | undefined {
  return TM_SESSIONS.find((s) => s.id === id);
}

export function getTmMantra(id: string): TmMantraOption | undefined {
  return TM_MANTRAS.find((m) => m.id === id);
}