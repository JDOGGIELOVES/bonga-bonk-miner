/** Daily peace check-in — gentle reflection, local streak tracking. */

export interface PeaceCheckIn {
  date: string;
  mood: string;
  note?: string;
}

const STORAGE_KEY = "bonga-peace-checkin";
const STREAK_KEY = "bonga-peace-streak";

export const MOOD_OPTIONS = [
  { emoji: "😌", label: "Calm" },
  { emoji: "✌️", label: "Peaceful" },
  { emoji: "😤", label: "Stressed" },
  { emoji: "🌊", label: "Wavy" },
  { emoji: "🔥", label: "Hyped" },
  { emoji: "💤", label: "Tired" },
] as const;

export const PEACE_PROMPTS = [
  "What would make today 1% more peaceful?",
  "Name one thing you're grateful for right now.",
  "Where can you soften instead of bonk harder?",
  "Who deserves a peaceful bonk from you today?",
  "What noise can you let float away like a cloud?",
];

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayPrompt(): string {
  const day = new Date().getDate();
  return PEACE_PROMPTS[day % PEACE_PROMPTS.length];
}

export function loadCheckIn(): PeaceCheckIn | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PeaceCheckIn;
    return data.date === todayKey() ? data : null;
  } catch {
    return null;
  }
}

export function saveCheckIn(mood: string, note?: string): PeaceCheckIn {
  const entry: PeaceCheckIn = { date: todayKey(), mood, note };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  updateStreak();
  return entry;
}

export function loadStreak(): number {
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