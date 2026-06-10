/** Daily affirmations — the Bonga way: peace, love, playful bonks, no clinical vibes. */

export type AffirmationCategory = "peace" | "bonk" | "community" | "self" | "frequency";

export interface BongaAffirmation {
  id: string;
  text: string;
  category: AffirmationCategory;
  emoji: string;
}

export const CATEGORY_LABELS: Record<AffirmationCategory, string> = {
  peace: "Peace",
  bonk: "Good Bonks",
  community: "The Fam",
  self: "Inner Bonga",
  frequency: "Raise the Frequency",
};

export const BONGA_AFFIRMATIONS: BongaAffirmation[] = [
  {
    id: "peace-soften",
    text: "I soften where the world wants me to bonk harder.",
    category: "peace",
    emoji: "😌",
  },
  {
    id: "peace-breath",
    text: "My breath is slow, my timeline is optional.",
    category: "peace",
    emoji: "🌬️",
  },
  {
    id: "peace-cloud",
    text: "I let loud noise float away like a cloud — I stay meadow-calm.",
    category: "peace",
    emoji: "☁️",
  },
  {
    id: "peace-present",
    text: "Right now is enough. I don't have to earn my peace.",
    category: "peace",
    emoji: "✌️",
  },
  {
    id: "peace-rest",
    text: "Rest is not lazy — it's how peaceful warriors recharge.",
    category: "peace",
    emoji: "💤",
  },
  {
    id: "bonk-playful",
    text: "I bonk stress with play, not panic.",
    category: "bonk",
    emoji: "🔨",
  },
  {
    id: "bonk-release",
    text: "One minute of silly bonks clears a whole hour of static.",
    category: "bonk",
    emoji: "✨",
  },
  {
    id: "bonk-kind",
    text: "I bonk things that need bonking — gently, on purpose, with love.",
    category: "bonk",
    emoji: "💛",
  },
  {
    id: "bonk-laugh",
    text: "Laughter is a bonk the soul actually asked for.",
    category: "bonk",
    emoji: "😄",
  },
  {
    id: "bonk-reset",
    text: "When the chart screams, I breathe first and bonk second.",
    category: "bonk",
    emoji: "📉",
  },
  {
    id: "community-fam",
    text: "I belong to the fam — peace spreads when we show up for each other.",
    category: "community",
    emoji: "🫶",
  },
  {
    id: "community-share",
    text: "I share good vibes like lo-fi on a Sunday — freely and on repeat.",
    category: "community",
    emoji: "🎧",
  },
  {
    id: "community-bonk",
    text: "Someone near me deserves a peaceful bonk today — I can be that person.",
    category: "community",
    emoji: "🤝",
  },
  {
    id: "community-rise",
    text: "We rise together — no one bonks alone in the Bonga way.",
    category: "community",
    emoji: "🌅",
  },
  {
    id: "self-enough",
    text: "I am already enough — my worth isn't tied to the last candle.",
    category: "self",
    emoji: "🌸",
  },
  {
    id: "self-gentle",
    text: "I talk to myself like I'd talk to a sleepy Bonga — kind and patient.",
    category: "self",
    emoji: "🧸",
  },
  {
    id: "self-body",
    text: "My body knows the pace. Slow is the speed limit, and that's beautiful.",
    category: "self",
    emoji: "🧘",
  },
  {
    id: "self-grateful",
    text: "Gratitude is my quiet superpower — one small thank-you shifts the whole day.",
    category: "self",
    emoji: "🙏",
  },
  {
    id: "self-forgive",
    text: "Yesterday's bonks don't define today's peace — I start fresh.",
    category: "self",
    emoji: "🌊",
  },
  {
    id: "frequency-vibe",
    text: "I raise my frequency one breath, one stretch, one good bonk at a time.",
    category: "frequency",
    emoji: "📡",
  },
  {
    id: "frequency-cosmic",
    text: "Cosmic balance lives in me — inhale peace, exhale the noise.",
    category: "frequency",
    emoji: "🌌",
  },
  {
    id: "frequency-meadow",
    text: "I carry meadow energy into loud rooms.",
    category: "frequency",
    emoji: "🌼",
  },
  {
    id: "frequency-love",
    text: "Peace, love, good bonks — that's the frequency I'm on today.",
    category: "frequency",
    emoji: "💜",
  },
  {
    id: "frequency-flow",
    text: "I move like Tai Chi clouds — soft edges, steady center.",
    category: "frequency",
    emoji: "🍃",
  },
  {
    id: "peace-1pct",
    text: "Today can be 1% more peaceful — and that's a win worth celebrating.",
    category: "peace",
    emoji: "🎉",
  },
  {
    id: "bonk-humor",
    text: "I don't take the chaos too seriously — humor is part of my peace practice.",
    category: "bonk",
    emoji: "😏",
  },
  {
    id: "self-boundary",
    text: "Saying no is a bonk for my boundaries — and my boundaries are sacred.",
    category: "self",
    emoji: "🛡️",
  },
  {
    id: "community-witness",
    text: "I witness others without fixing them — presence is the peaceful bonk.",
    category: "community",
    emoji: "👀",
  },
  {
    id: "frequency-morning",
    text: "Morning me sets the vibe — I choose calm before the timeline wakes up.",
    category: "frequency",
    emoji: "🌄",
  },
  {
    id: "peace-whisper",
    text: "Peace, love, good bonks — I whisper it until my nervous system believes it.",
    category: "peace",
    emoji: "🤫",
  },
  {
    id: "peace-still",
    text: "Stillness is not empty — it's where my best ideas bonk gently into view.",
    category: "peace",
    emoji: "🕊️",
  },
  {
    id: "peace-sunset",
    text: "I close tabs in my mind the way the sun closes the day — slowly, with color.",
    category: "peace",
    emoji: "🌇",
  },
  {
    id: "peace-water",
    text: "I let worry flow downstream — I stay on the peaceful bank.",
    category: "peace",
    emoji: "💧",
  },
  {
    id: "bonk-dance",
    text: "A little dance bonk resets my whole nervous system — permission granted.",
    category: "bonk",
    emoji: "💃",
  },
  {
    id: "bonk-stretch",
    text: "I stretch before I scroll — my body gets the first bonk of the day.",
    category: "bonk",
    emoji: "🙆",
  },
  {
    id: "bonk-meme",
    text: "Memes are medicine when taken with breath — I dose responsibly.",
    category: "bonk",
    emoji: "🐸",
  },
  {
    id: "bonk-volume",
    text: "I turn down the volume on drama and up the volume on lo-fi peace.",
    category: "bonk",
    emoji: "🔊",
  },
  {
    id: "community-welcome",
    text: "New faces in the fam deserve a warm bonk — I lead with welcome energy.",
    category: "community",
    emoji: "🚪",
  },
  {
    id: "community-celebrate",
    text: "Someone else's win is my win — I celebrate without keeping score.",
    category: "community",
    emoji: "🎊",
  },
  {
    id: "community-listen",
    text: "I listen like Tai Chi listens to breath — fully, without rushing to fix.",
    category: "community",
    emoji: "👂",
  },
  {
    id: "community-spread",
    text: "Good vibes are contagious — I'm patient zero for peaceful bonks today.",
    category: "community",
    emoji: "🦠",
  },
  {
    id: "self-pause",
    text: "Pause is power — I don't owe anyone a rushed reply.",
    category: "self",
    emoji: "⏸️",
  },
  {
    id: "self-small",
    text: "Small steps count — one peaceful choice stacks into a whole season.",
    category: "self",
    emoji: "🪜",
  },
  {
    id: "self-honest",
    text: "I can be honest about hard days and still be gentle with myself.",
    category: "self",
    emoji: "💬",
  },
  {
    id: "self-sleepy",
    text: "Sleepy Bonga energy is valid — rest is part of raising the frequency.",
    category: "self",
    emoji: "😴",
  },
  {
    id: "frequency-sun",
    text: "I absorb sunlight like a meadow — warmth is part of my signal.",
    category: "frequency",
    emoji: "☀️",
  },
  {
    id: "frequency-music",
    text: "The right song is a frequency shift — I curate my soundtrack on purpose.",
    category: "frequency",
    emoji: "🎵",
  },
  {
    id: "frequency-nature",
    text: "Ten minutes outside retunes me — nature is the original Bonga playlist.",
    category: "frequency",
    emoji: "🌲",
  },
  {
    id: "frequency-intention",
    text: "I set intention before I set notifications — my vibe leads the day.",
    category: "frequency",
    emoji: "🎯",
  },
];

const CLAIMED_KEY = "bonga-affirmation-claimed";
const STREAK_KEY = "bonga-affirmation-streak";

export interface AffirmationClaim {
  date: string;
  affirmationId: string;
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayIndex(): number {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getAffirmationCycleIndex(): number {
  return dayIndex() % BONGA_AFFIRMATIONS.length;
}

export function getTodaysAffirmation(): BongaAffirmation {
  return BONGA_AFFIRMATIONS[getAffirmationCycleIndex()];
}

export function getAffirmationById(id: string): BongaAffirmation | undefined {
  return BONGA_AFFIRMATIONS.find((a) => a.id === id);
}

export function getRandomAffirmation(excludeId?: string): BongaAffirmation {
  const pool = excludeId
    ? BONGA_AFFIRMATIONS.filter((a) => a.id !== excludeId)
    : BONGA_AFFIRMATIONS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

export function loadClaimedAffirmation(): AffirmationClaim | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLAIMED_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AffirmationClaim;
    return data.date === todayKey() ? data : null;
  } catch {
    return null;
  }
}

export function claimAffirmation(affirmationId: string): AffirmationClaim {
  const entry: AffirmationClaim = { date: todayKey(), affirmationId };
  localStorage.setItem(CLAIMED_KEY, JSON.stringify(entry));
  updateStreak();
  return entry;
}

export function loadAffirmationStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
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

function updateStreak(): void {
  const today = todayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  try {
    const raw = localStorage.getItem(STREAK_KEY);
    let count = 1;
    if (raw) {
      const prev = JSON.parse(raw) as { count: number; lastDate: string };
      if (prev.lastDate === yesterdayKey) count = prev.count + 1;
      else if (prev.lastDate === today) count = prev.count;
    }
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count, lastDate: today }));
  } catch {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastDate: today }));
  }
}