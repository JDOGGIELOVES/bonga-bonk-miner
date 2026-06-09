/** Daily stretching routines — gentle mobility, the Bonga way. */

export interface StretchStep {
  title: string;
  instruction: string;
  durationSec: number;
}

export interface StretchSession {
  id: string;
  title: string;
  subtitle: string;
  durationMin: number;
  emoji: string;
  guideTraitId: number;
  bodyFocus: string;
  steps: StretchStep[];
}

export const STRETCHING_SESSIONS: StretchSession[] = [
  {
    id: "morning-unfurl",
    title: "Morning Unfurl",
    subtitle: "Wake the body soft — neck to toes before the bonks begin",
    durationMin: 5,
    emoji: "🌄",
    guideTraitId: 4,
    bodyFocus: "Full body wake-up",
    steps: [
      {
        title: "Neck rolls",
        instruction:
          "Slow circles with the chin — four each way. No forcing. Imagine loosening yesterday's timeline tension.",
        durationSec: 40,
      },
      {
        title: "Shoulder shrugs",
        instruction:
          "Inhale shoulders up to ears, exhale let them drop like a heavy bonk. Repeat six times.",
        durationSec: 45,
      },
      {
        title: "Side reach",
        instruction:
          "One arm overhead, lean gently to the side. Feel the ribs open. Switch sides. Hold, don't bounce.",
        durationSec: 50,
      },
      {
        title: "Standing forward fold",
        instruction:
          "Soft knees, hinge at hips, let arms hang. Nod yes and no with the head. Rise slowly when done.",
        durationSec: 50,
      },
      {
        title: "Calf & ankle wake",
        instruction:
          "Hands on a wall or desk. Step one foot back, press heel down. Switch legs. Roll ankles both directions.",
        durationSec: 45,
      },
    ],
  },
  {
    id: "desk-bonk-relief",
    title: "Desk Bonk Relief",
    subtitle: "For chart watchers and miners — undo the hunch",
    durationMin: 4,
    emoji: "💻",
    guideTraitId: 8,
    bodyFocus: "Neck, shoulders, wrists",
    steps: [
      {
        title: "Chin tucks",
        instruction:
          "Sit tall. Glide chin straight back (not down) — like making a double chin. Hold 3 seconds, release. Ten reps.",
        durationSec: 45,
      },
      {
        title: "Eagle arms",
        instruction:
          "Wrap one arm under the other at elbows, lift forearms if comfortable. Feel between shoulder blades. Switch arms.",
        durationSec: 50,
      },
      {
        title: "Wrist circles",
        instruction:
          "Extend arms, circle wrists slow — eight each direction. Shake hands loose like you just bonked a keyboard.",
        durationSec: 40,
      },
      {
        title: "Chest opener",
        instruction:
          "Clasp hands behind back, straighten arms, lift chest gently. Breathe into the front of the shoulders.",
        durationSec: 45,
      },
      {
        title: "Seated twist",
        instruction:
          "One hand on opposite knee, twist from the belly. Look over the shoulder. Both sides. Exhale as you turn.",
        durationSec: 50,
      },
    ],
  },
  {
    id: "hip-loosen",
    title: "Hip Loosen Flow",
    subtitle: "Open the hips — sitting and scrolling tightens everything",
    durationMin: 6,
    emoji: "🦋",
    guideTraitId: 6,
    bodyFocus: "Hips & lower back",
    steps: [
      {
        title: "Standing hip circles",
        instruction:
          "Hands on hips, soft knees. Draw slow circles with the pelvis — four each direction. Like hula at 10% speed.",
        durationSec: 45,
      },
      {
        title: "Figure-four stretch",
        instruction:
          "Seated or lying: ankle on opposite knee, gentle forward lean. Feel the outer hip. Switch sides. No pain, only ease.",
        durationSec: 60,
      },
      {
        title: "Low lunge",
        instruction:
          "One knee down, front foot flat. Tuck pelvis slightly, feel the front hip flexor lengthen. Switch legs.",
        durationSec: 70,
      },
      {
        title: "Supine twist",
        instruction:
          "On your back, knees to chest then drop both to one side. Arms wide. Gaze opposite. Switch sides slowly.",
        durationSec: 60,
      },
      {
        title: "Happy baby",
        instruction:
          "On back, grab feet or shins, knees wide. Rock gently side to side. Smile optional, recommended.",
        durationSec: 45,
      },
    ],
  },
  {
    id: "post-bonk-cooldown",
    title: "Post-Bonk Cooldown",
    subtitle: "After mining or gaming — reset wrists, spine, and legs",
    durationMin: 4,
    emoji: "🪵",
    guideTraitId: 5,
    bodyFocus: "Arms, spine, legs",
    steps: [
      {
        title: "Forearm stretch",
        instruction:
          "Arm out, palm up — gently pull fingers back with other hand. Then palm down, pull fingers down. Both arms.",
        durationSec: 50,
      },
      {
        title: "Cat-cow",
        instruction:
          "On hands and knees — arch back on inhale, round on exhale. Six slow cycles. Let the spine wave.",
        durationSec: 50,
      },
      {
        title: "Quad stretch",
        instruction:
          "Standing: grab one ankle behind you, knees together, tuck pelvis. Use a wall for balance. Switch legs.",
        durationSec: 50,
      },
      {
        title: "Hamstring reach",
        instruction:
          "One foot on a low step or seat, leg straight, back flat. Hinge forward until you feel a gentle pull. Switch.",
        durationSec: 50,
      },
    ],
  },
  {
    id: "evening-melt",
    title: "Evening Melt",
    subtitle: "Wind down the body before sleep — slow and heavy like warm sand",
    durationMin: 7,
    emoji: "🌙",
    guideTraitId: 2,
    bodyFocus: "Relax & release",
    steps: [
      {
        title: "Child's pose",
        instruction:
          "Knees wide or together, sit hips toward heels, arms forward. Breathe into the lower back. Stay soft.",
        durationSec: 60,
      },
      {
        title: "Thread the needle",
        instruction:
          "From hands and knees, slide one arm under the other, shoulder to floor. Hold. Switch sides.",
        durationSec: 60,
      },
      {
        title: "Legs up the wall",
        instruction:
          "Sit sideways to a wall, swing legs up, lie back. Arms loose. Let blood flow reverse. Close eyes if you like.",
        durationSec: 90,
      },
      {
        title: "Gentle neck release",
        instruction:
          "Ear toward shoulder — no hand pull, just gravity. Hold each side. Finish with three slow breaths.",
        durationSec: 50,
      },
      {
        title: "Savasana close",
        instruction:
          "Lie flat, palms up. Scan from toes to crown, soften each part. Whisper: peace, love, good bonks.",
        durationSec: 60,
      },
    ],
  },
  {
    id: "daily-seven",
    title: "Daily Seven",
    subtitle: "Seven moves, seven minutes — the everyday Bonga stretch habit",
    durationMin: 7,
    emoji: "✌️",
    guideTraitId: 1,
    bodyFocus: "Head-to-toe daily habit",
    steps: [
      {
        title: "Reach up",
        instruction: "Interlace fingers, push palms to sky, lengthen through the ribs. Hold. Release with a sigh.",
        durationSec: 40,
      },
      {
        title: "Neck & shoulders",
        instruction: "Ear to shoulder each side, then roll shoulders back five times.",
        durationSec: 50,
      },
      {
        title: "Spinal twist",
        instruction: "Standing or seated twist — inhale tall, exhale turn. Both sides.",
        durationSec: 50,
      },
      {
        title: "Hip opener",
        instruction: "Figure-four or standing pigeon — gentle lean forward. Both sides.",
        durationSec: 60,
      },
      {
        title: "Hamstrings",
        instruction: "Forward fold or seated reach toward toes. Soft knees OK.",
        durationSec: 50,
      },
      {
        title: "Calves",
        instruction: "Wall stretch both legs. Press heels down, breathe.",
        durationSec: 45,
      },
      {
        title: "Close & breathe",
        instruction: "Hands on belly. Three slow breaths. You stretched today — that's the Bonga way.",
        durationSec: 45,
      },
    ],
  },
];

export function getStretchSession(id: string): StretchSession | undefined {
  return STRETCHING_SESSIONS.find((s) => s.id === id);
}

/** Rotates through routines so each day highlights a different stretch. */
export function getTodaysStretch(): StretchSession {
  const day = new Date().getDay();
  return STRETCHING_SESSIONS[day % STRETCHING_SESSIONS.length];
}

export function getStretchTotalSeconds(session: StretchSession): number {
  return session.steps.reduce((sum, step) => sum + step.durationSec, 0);
}

const STRETCH_STREAK_KEY = "bonga-stretch-streak";
const STRETCH_LAST_KEY = "bonga-stretch-last";

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadStretchStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STRETCH_STREAK_KEY);
    if (!raw) return 0;
    const { count, lastDate } = JSON.parse(raw) as {
      count: number;
      lastDate: string;
    };
    const today = todayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    if (lastDate === today || lastDate === yesterdayKey) return count;
    return 0;
  } catch {
    return 0;
  }
}

export function completedStretchToday(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STRETCH_LAST_KEY) === todayKey();
}

export function markStretchComplete(): number {
  const today = todayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  let count = 1;
  try {
    const raw = localStorage.getItem(STRETCH_STREAK_KEY);
    if (raw) {
      const prev = JSON.parse(raw) as { count: number; lastDate: string };
      if (prev.lastDate === yesterdayKey) count = prev.count + 1;
      else if (prev.lastDate === today) count = prev.count;
    }
    localStorage.setItem(
      STRETCH_STREAK_KEY,
      JSON.stringify({ count, lastDate: today })
    );
    localStorage.setItem(STRETCH_LAST_KEY, today);
    return count;
  } catch {
    localStorage.setItem(
      STRETCH_STREAK_KEY,
      JSON.stringify({ count: 1, lastDate: today })
    );
    localStorage.setItem(STRETCH_LAST_KEY, today);
    return 1;
  }
}