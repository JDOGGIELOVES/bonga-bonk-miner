/** Bonga Vibes Garden — peaceful incremental garden economy (localStorage). */

export const GARDEN_STORAGE_KEY = "bonga-vibes-garden";
export const MAX_OFFLINE_HOURS = 8;
/** Max garden $BONGA credited per UTC day (idle + taps + quests). */
export const GARDEN_DAILY_EARN_CAP = 400;

/** Returns the next daily reset (UTC midnight). */
export function getNextDailyResetDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
}

export function formatNextDailyReset(): string {
  const reset = getNextDailyResetDate();
  return reset.toLocaleString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' UTC';
}

export type PlantRarity = "common" | "rare" | "legendary" | "nft";
export type GardenZone = "meadow" | "greenhouse" | "farm";

export interface PlantType {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  tapBonga: number;
  idleBongaPerSec: number;
  rarity: PlantRarity;
  nftOnly?: boolean;
  glow: string;
  /** Suggested zone shown in shop */
  defaultZone: GardenZone;
}

export const GARDEN_ZONES: {
  id: GardenZone;
  label: string;
  emoji: string;
  description: string;
}[] = [
  { id: "meadow", label: "Meadow", emoji: "🌾", description: "Open peaceful fields" },
  { id: "greenhouse", label: "Greenhouse", emoji: "🪴", description: "Warm glass sanctuary" },
  { id: "farm", label: "Farm", emoji: "🚜", description: "Cosmic crop rows" },
];

export const PLANT_CATALOG: PlantType[] = [
  {
    id: "peace-lily",
    name: "Peace Lily",
    emoji: "🪷",
    description: "Soft petals, softer vibes.",
    cost: 0,
    tapBonga: 0.05,
    idleBongaPerSec: 0.01,
    rarity: "common",
    glow: "#2DB8A8",
    defaultZone: "meadow",
  },
  {
    id: "love-lotus",
    name: "Love Lotus",
    emoji: "💗",
    description: "Opens hearts on every water.",
    cost: 65,
    tapBonga: 0.08,
    idleBongaPerSec: 0.016,
    rarity: "common",
    glow: "#FF6200",
    defaultZone: "meadow",
  },
  {
    id: "frequency-crystal",
    name: "Frequency Crystal",
    emoji: "🔮",
    description: "Amplifies meadow energy.",
    cost: 180,
    tapBonga: 0.12,
    idleBongaPerSec: 0.025,
    rarity: "rare",
    glow: "#8B5CF6",
    defaultZone: "greenhouse",
  },
  {
    id: "affirmation-tree",
    name: "Affirmation Tree",
    emoji: "🌳",
    description: "Leaves whisper good bonks.",
    cost: 380,
    tapBonga: 0.20,
    idleBongaPerSec: 0.04,
    rarity: "rare",
    glow: "#4ADE80",
    defaultZone: "farm",
  },
  {
    id: "bonga-kush",
    name: "Bonga Kush",
    emoji: "🌿",
    description: "Sacred herb for NFT fam — greenhouse royalty.",
    cost: 420,
    tapBonga: 0.25,
    idleBongaPerSec: 0.05,
    rarity: "nft",
    nftOnly: true,
    glow: "#22C55E",
    defaultZone: "greenhouse",
  },
  {
    id: "cosmic-sunflower",
    name: "Cosmic Sunflower",
    emoji: "🌻",
    description: "NFT fam exclusive bloom.",
    cost: 520,
    tapBonga: 0.30,
    idleBongaPerSec: 0.06,
    rarity: "nft",
    nftOnly: true,
    glow: "#FF8533",
    defaultZone: "farm",
  },
  {
    id: "bonk-bloom",
    name: "Bonk Bloom",
    emoji: "✨",
    description: "Legendary holder decoration.",
    cost: 880,
    tapBonga: 0.40,
    idleBongaPerSec: 0.08,
    rarity: "legendary",
    nftOnly: true,
    glow: "#9B5DE5",
    defaultZone: "meadow",
  },
];

export interface PlantedCrop {
  instanceId: string;
  plantTypeId: string;
  plantedAt: number;
  zone: GardenZone;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  emoji: string;
  reward: number;
}

export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: "water-5",
    title: "Morning mist",
    description: "Water plants 5 times",
    emoji: "💧",
    reward: 3,
  },
  {
    id: "affirm",
    title: "Speak peace",
    description: "Claim a daily affirmation vibe",
    emoji: "🌼",
    reward: 3,
  },
  {
    id: "meditate",
    title: "Breathe & bonk",
    description: "Take a 10-second peace pause",
    emoji: "🧘",
    reward: 3,
  },
  {
    id: "good-deed",
    title: "Spread love",
    description: "Send good vibes to the fam",
    emoji: "🫶",
    reward: 3,
  },
];

export interface GardenState {
  date: string;
  gardenBonga: number;
  totalEarned: number;
  bongaFarmedToday: number;
  lifetimeWaters: number;
  waterCountToday: number;
  plants: PlantedCrop[];
  unlockedPlantIds: string[];
  questsDone: string[];
  lastTickAt: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getPlantType(id: string): PlantType | undefined {
  return PLANT_CATALOG.find((p) => p.id === id);
}

function normalizeCropZone(zone?: GardenZone): GardenZone {
  if (zone === "greenhouse" || zone === "farm") return zone;
  return "meadow";
}

export function defaultGardenState(): GardenState {
  const now = Date.now();
  return {
    date: todayKey(),
    gardenBonga: 0,
    totalEarned: 0,
    bongaFarmedToday: 0,
    lifetimeWaters: 0,
    waterCountToday: 0,
    plants: [
      {
        instanceId: "starter-peace-lily",
        plantTypeId: "peace-lily",
        plantedAt: now,
        zone: "meadow",
      },
    ],
    unlockedPlantIds: ["peace-lily", "love-lotus", "frequency-crystal", "affirmation-tree"],
    questsDone: [],
    lastTickAt: now,
  };
}

function rolloverDaily(state: GardenState): GardenState {
  if (state.date === todayKey()) return state;
  return {
    ...state,
    date: todayKey(),
    waterCountToday: 0,
    questsDone: [],
    bongaFarmedToday: 0,
  };
}

function migrateGardenState(parsed: Partial<GardenState>): GardenState {
  const base = { ...defaultGardenState(), ...parsed };
  return {
    ...base,
    bongaFarmedToday: Math.max(0, Number(base.bongaFarmedToday) || 0),
    plants: (base.plants ?? []).map((crop) => ({
      ...crop,
      zone: normalizeCropZone(crop.zone),
    })),
  };
}

export function loadGardenState(): GardenState {
  if (typeof window === "undefined") return defaultGardenState();
  try {
    const raw = localStorage.getItem(GARDEN_STORAGE_KEY);
    if (!raw) return defaultGardenState();
    const parsed = JSON.parse(raw) as Partial<GardenState>;
    return rolloverDaily(migrateGardenState(parsed));
  } catch {
    return defaultGardenState();
  }
}

export function saveGardenState(state: GardenState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(state));
}

export function getNftMultiplier(isHolder: boolean): {
  tap: number;
  idle: number;
  label: string;
} {
  if (!isHolder) {
    return { tap: 1, idle: 1, label: "" };
  }
  return {
    tap: 2,
    idle: 2,
    label: "NFT holder · 2× tap · 2× idle · Bonga Kush unlocked",
  };
}

export function getDailyEarnRemaining(state: GardenState): number {
  return Math.max(0, GARDEN_DAILY_EARN_CAP - state.bongaFarmedToday);
}

export function isDailyEarnCapReached(state: GardenState): boolean {
  return state.bongaFarmedToday >= GARDEN_DAILY_EARN_CAP;
}

function applyCappedEarnings(
  state: GardenState,
  rawEarned: number,
  extra: Partial<GardenState> = {}
): { state: GardenState; earned: number; capped: boolean } {
  const room = getDailyEarnRemaining(state);
  const earned = Math.min(Math.max(0, rawEarned), room);

  if (earned <= 0) {
    return {
      state: { ...state, ...extra, lastTickAt: extra.lastTickAt ?? state.lastTickAt },
      earned: 0,
      capped: room <= 0,
    };
  }

  return {
    earned,
    capped: earned < rawEarned,
    state: {
      ...state,
      ...extra,
      gardenBonga: state.gardenBonga + earned,
      totalEarned: state.totalEarned + earned,
      bongaFarmedToday: state.bongaFarmedToday + earned,
      lastTickAt: extra.lastTickAt ?? Date.now(),
    },
  };
}

function idleRate(state: GardenState, mult: number): number {
  return state.plants.reduce((sum, crop) => {
    const type = getPlantType(crop.plantTypeId);
    return sum + (type?.idleBongaPerSec ?? 0) * mult;
  }, 0);
}

export function applyIdleEarnings(
  state: GardenState,
  isNftHolder: boolean,
  now = Date.now()
): GardenState {
  if (isDailyEarnCapReached(state)) {
    return { ...state, lastTickAt: now };
  }

  const elapsedSec = Math.max(0, (now - state.lastTickAt) / 1000);
  const cappedSec = Math.min(elapsedSec, MAX_OFFLINE_HOURS * 3600);
  const mult = getNftMultiplier(isNftHolder).idle;
  const rawEarned = idleRate(state, mult) * cappedSec;

  return applyCappedEarnings(state, rawEarned, { lastTickAt: now }).state;
}

export function waterPlant(
  state: GardenState,
  instanceId: string,
  isNftHolder: boolean
): { state: GardenState; earned: number; capped: boolean } {
  const crop = state.plants.find((p) => p.instanceId === instanceId);
  if (!crop) return { state, earned: 0, capped: false };

  const type = getPlantType(crop.plantTypeId);
  if (!type) return { state, earned: 0, capped: false };

  const mult = getNftMultiplier(isNftHolder).tap;
  const rawEarned = type.tapBonga * mult;

  const result = applyCappedEarnings(state, rawEarned, {
    lifetimeWaters: state.lifetimeWaters + 1,
    waterCountToday: state.waterCountToday + 1,
  });

  return result;
}

export function isPlantAvailableInShop(
  state: GardenState,
  plantTypeId: string,
  isNftHolder: boolean
): boolean {
  const type = getPlantType(plantTypeId);
  if (!type) return false;
  if (type.nftOnly) return isNftHolder;
  return state.unlockedPlantIds.includes(plantTypeId);
}

export function buyPlant(
  state: GardenState,
  plantTypeId: string,
  zone: GardenZone,
  isNftHolder: boolean
): { state: GardenState; ok: boolean; reason?: string } {
  const type = getPlantType(plantTypeId);
  if (!type) return { state, ok: false, reason: "Unknown plant." };
  if (type.nftOnly && !isNftHolder) {
    return { state, ok: false, reason: "Hold a Bonga NFT to unlock this plant." };
  }
  if (!isPlantAvailableInShop(state, plantTypeId, isNftHolder)) {
    return { state, ok: false, reason: "Not in shop yet." };
  }
  if (state.gardenBonga < type.cost) {
    return { state, ok: false, reason: "Need more garden $BONGA." };
  }

  const instanceId = `${plantTypeId}-${Date.now()}`;
  return {
    ok: true,
    state: {
      ...state,
      gardenBonga: state.gardenBonga - type.cost,
      plants: [
        ...state.plants,
        {
          instanceId,
          plantTypeId,
          plantedAt: Date.now(),
          zone,
        },
      ],
      lastTickAt: Date.now(),
    },
  };
}

export function completeQuest(
  state: GardenState,
  questId: string
): { state: GardenState; ok: boolean; reward: number; capped: boolean } {
  const quest = DAILY_QUESTS.find((q) => q.id === questId);
  if (!quest || state.questsDone.includes(questId)) {
    return { state, ok: false, reward: 0, capped: false };
  }

  if (questId === "water-5" && state.waterCountToday < 5) {
    return { state, ok: false, reward: 0, capped: false };
  }

  const result = applyCappedEarnings(state, quest.reward, {
    questsDone: [...state.questsDone, questId],
  });

  return {
    ok: result.earned > 0 || !result.capped,
    reward: result.earned,
    capped: result.capped,
    state: result.state,
  };
}

export function countOwnedPlants(state: GardenState, plantTypeId: string): number {
  return state.plants.filter((crop) => crop.plantTypeId === plantTypeId).length;
}

export function getPlantsInZone(
  plants: PlantedCrop[],
  zone: GardenZone
): PlantedCrop[] {
  return plants.filter((crop) => crop.zone === zone);
}

export function getGardenIdleRate(state: GardenState, isNftHolder: boolean): number {
  const mult = getNftMultiplier(isNftHolder).idle;
  return idleRate(state, mult);
}

export function gardenBeautyLevel(plantCount: number): number {
  if (plantCount >= 12) return 5;
  if (plantCount >= 8) return 4;
  if (plantCount >= 5) return 3;
  if (plantCount >= 3) return 2;
  return 1;
}

export function formatGardenBonga(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value < 10 ? value.toFixed(2) : value.toFixed(1);
}