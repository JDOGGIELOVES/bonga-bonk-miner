export const TAPS_PER_BONGA = 100;
export const DAILY_BONGA_LIMIT = 10;
export const STORAGE_KEY = "bonga-bonk-miner";

export const MEME_COINS = [
  { id: "doge", emoji: "🐕", name: "Doge", color: "#C2A633" },
  { id: "pepe", emoji: "🐸", name: "Pepe", color: "#4CAF50" },
  { id: "shib", emoji: "🦊", name: "Shib", color: "#FF6B35" },
  { id: "wojak", emoji: "😢", name: "Wojak", color: "#90CAF9" },
  { id: "bonk", emoji: "🔨", name: "BONK", color: "#FF8C42" },
  { id: "moon", emoji: "🌙", name: "Moon", color: "#9B5DE5" },
] as const;

export const UPGRADES = [
  {
    id: "auto-bonker",
    name: "Auto-Bonker",
    description: "Passive taps every 3 seconds",
    cost: 50,
    emoji: "🤖",
    available: false,
  },
  {
    id: "mega-club",
    name: "Mega Club",
    description: "2x bonk visual size",
    cost: 100,
    emoji: "🏏",
    available: false,
  },
  {
    id: "coin-magnet",
    name: "Coin Magnet",
    description: "Coins spawn closer to Bonga",
    cost: 75,
    emoji: "🧲",
    available: false,
  },
  {
    id: "peace-aura",
    name: "Peace Aura",
    description: "+10% tap satisfaction",
    cost: 200,
    emoji: "✌️",
    available: false,
  },
] as const;

export interface LeaderboardEntry {
  id: string;
  name: string;
  bonga: number;
  taps: number;
  date: string;
}

export interface GameState {
  date: string;
  tapsToday: number;
  bongaToday: number;
  claimedToday: number;
  totalTaps: number;
  totalBonga: number;
  sessionTaps: number;
  leaderboard: LeaderboardEntry[];
  playerName: string;
  lastClaimWallet?: string;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function defaultGameState(): GameState {
  return {
    date: todayKey(),
    tapsToday: 0,
    bongaToday: 0,
    claimedToday: 0,
    totalTaps: 0,
    totalBonga: 0,
    sessionTaps: 0,
    leaderboard: [],
    playerName: "Bonker",
  };
}

export function loadGameState(): GameState {
  if (typeof window === "undefined") return defaultGameState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultGameState();

    const parsed = JSON.parse(raw) as GameState;
    if (parsed.date !== todayKey()) {
      return {
        ...parsed,
        date: todayKey(),
        tapsToday: 0,
        bongaToday: 0,
        claimedToday: 0,
        sessionTaps: 0,
      };
    }
    return { ...defaultGameState(), ...parsed, sessionTaps: 0 };
  } catch {
    return defaultGameState();
  }
}

export function saveGameState(state: GameState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function canEarnBonga(state: GameState) {
  return state.bongaToday < DAILY_BONGA_LIMIT;
}

export function tapsUntilNextBonga(tapsToday: number) {
  const remainder = tapsToday % TAPS_PER_BONGA;
  return remainder === 0 ? TAPS_PER_BONGA : TAPS_PER_BONGA - remainder;
}

export function progressToNextBonga(tapsToday: number) {
  return ((tapsToday % TAPS_PER_BONGA) / TAPS_PER_BONGA) * 100;
}

export interface TapResult {
  state: GameState;
  bongaEarned: number;
  hitCoinId: string;
  atLimit: boolean;
}

export function processTap(state: GameState, hitCoinId: string): TapResult {
  const next: GameState = {
    ...state,
    tapsToday: state.tapsToday + 1,
    totalTaps: state.totalTaps + 1,
    sessionTaps: state.sessionTaps + 1,
  };

  let bongaEarned = 0;
  const atLimit = !canEarnBonga(next);

  if (!atLimit && next.tapsToday % TAPS_PER_BONGA === 0) {
    bongaEarned = 1;
    next.bongaToday += 1;
    next.totalBonga += 1;
    updateLeaderboard(next);
  }

  return { state: next, bongaEarned, hitCoinId, atLimit };
}

function updateLeaderboard(state: GameState) {
  const entry: LeaderboardEntry = {
    id: `${state.date}-${Date.now()}`,
    name: state.playerName,
    bonga: state.bongaToday,
    taps: state.tapsToday,
    date: state.date,
  };

  const filtered = state.leaderboard.filter(
    (e) => !(e.name === entry.name && e.date === entry.date)
  );

  filtered.push(entry);
  filtered.sort((a, b) => b.bonga - a.bonga || b.taps - a.taps);
  state.leaderboard = filtered.slice(0, 10);
}

export function getClaimableBonga(state: GameState) {
  return Math.max(0, state.bongaToday - (state.claimedToday ?? 0));
}

export function processClaim(state: GameState, walletAddress: string): GameState {
  const claimable = getClaimableBonga(state);
  if (claimable <= 0) return state;

  return {
    ...state,
    claimedToday: state.claimedToday + claimable,
    lastClaimWallet: walletAddress,
  };
}

export function getShareText(state: GameState) {
  const claimable = getClaimableBonga(state);
  const claimNote =
    claimable > 0 ? ` (${claimable} ready to claim!)` : "";
  return `I mined ${state.bongaToday} $BONGA today in Bonga Bonk Miner!${claimNote} ${state.tapsToday} bonks and counting ✌️🔨 #BongaBonk #BONGA`;
}