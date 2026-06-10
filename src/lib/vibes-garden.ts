/** Bonga Vibes Garden — peaceful incremental garden economy (localStorage). */

export const GARDEN_STORAGE_KEY = "bonga-vibes-garden";
export const MAX_OFFLINE_HOURS = 8;

export type PlantRarity = "common" | "rare" | "legendary" | "nft";

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
}

export const PLANT_CATALOG: PlantType[] = [
  {
    id: "peace-lily",
    name: "Peace Lily",
    emoji: "🪷",
    description: "Soft petals, softer vibes.",
    cost: 0,
    tapBonga: 0.15,
    idleBongaPerSec: 0.03,
    rarity: "common",
    glow: "#2DB8A8",
  },
  {
    id: "love-lotus",
    name: "Love Lotus",
    emoji: "💗",
    description: "Opens hearts on every water.",
    cost: 25,
    tapBonga: 0.25,
    idleBongaPerSec: 0.05,
    rarity: "common",
    glow: "#FF6200",
  },
  {
    id: "frequency-crystal",
    name: "Frequency Crystal",
    emoji: "🔮",
    description: "Amplifies meadow energy.",
    cost: 75,
    tapBonga: 0.4,
    idleBongaPerSec: 0.08,
    rarity: "rare",
    glow: "#8B5CF6",
  },
  {
    id: "affirmation-tree",
    name: "Affirmation Tree",
    emoji: "🌳",
    description: "Leaves whisper good bonks.",
    cost: 150,
    tapBonga: 0.6,
    idleBongaPerSec: 0.12,
    rarity: "rare",
    glow: "#4ADE80",
  },
  {
    id: "cosmic-sunflower",
    name: "Cosmic Sunflower",
    emoji: "🌻",
    description: "NFT fam exclusive bloom.",
    cost: 200,
    tapBonga: 0.9,
    idleBongaPerSec: 0.18,
    rarity: "nft",
    nftOnly: true,
    glow: "#FF8533",
  },
  {
    id: "bonk-bloom",
    name: "Bonk Bloom",
    emoji: "✨",
    description: "Legendary holder decoration.",
    cost: 350,
    tapBonga: 1.2,
    idleBongaPerSec: 0.25,
    rarity: "legendary",
    nftOnly: true,
    glow: "#9B5DE5",
  },
];

export interface PlantedCrop {
  instanceId: string;
  plantTypeId: string;
  plantedAt: number;
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
    reward: 2,
  },
  {
    id: "meditate",
    title: "Breathe & bonk",
    description: "Take a 10-second peace pause",
    emoji: "🧘",
    reward: 2,
  },
  {
    id: "good-deed",
    title: "Spread love",
    description: "Send good vibes to the fam",
    emoji: "🫶",
    reward: 4,
  },
];

export interface GardenState {
  date: string;
  gardenBonga: number;
  totalEarned: number;
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

export function defaultGardenState(): GardenState {
  const now = Date.now();
  return {
    date: todayKey(),
    gardenBonga: 0,
    totalEarned: 0,
    lifetimeWaters: 0,
    waterCountToday: 0,
    plants: [
      {
        instanceId: "starter-peace-lily",
        plantTypeId: "peace-lily",
        plantedAt: now,
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
  };
}

export function loadGardenState(): GardenState {
  if (typeof window === "undefined") return defaultGardenState();
  try {
    const raw = localStorage.getItem(GARDEN_STORAGE_KEY);
    if (!raw) return defaultGardenState();
    const parsed = JSON.parse(raw) as GardenState;
    return rolloverDaily({ ...defaultGardenState(), ...parsed });
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
    tap: 1.35,
    idle: 1.5,
    label: "NFT holder · +35% vibes · +50% idle",
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
  const elapsedSec = Math.max(0, (now - state.lastTickAt) / 1000);
  const cappedSec = Math.min(elapsedSec, MAX_OFFLINE_HOURS * 3600);
  const mult = getNftMultiplier(isNftHolder).idle;
  const earned = idleRate(state, mult) * cappedSec;
  if (earned <= 0) {
    return { ...state, lastTickAt: now };
  }
  return {
    ...state,
    gardenBonga: state.gardenBonga + earned,
    totalEarned: state.totalEarned + earned,
    lastTickAt: now,
  };
}

export function waterPlant(
  state: GardenState,
  instanceId: string,
  isNftHolder: boolean
): { state: GardenState; earned: number } {
  const crop = state.plants.find((p) => p.instanceId === instanceId);
  if (!crop) return { state, earned: 0 };

  const type = getPlantType(crop.plantTypeId);
  if (!type) return { state, earned: 0 };

  const mult = getNftMultiplier(isNftHolder).tap;
  const earned = type.tapBonga * mult;

  return {
    earned,
    state: {
      ...state,
      gardenBonga: state.gardenBonga + earned,
      totalEarned: state.totalEarned + earned,
      lifetimeWaters: state.lifetimeWaters + 1,
      waterCountToday: state.waterCountToday + 1,
      lastTickAt: Date.now(),
    },
  };
}

export function buyPlant(
  state: GardenState,
  plantTypeId: string,
  isNftHolder: boolean
): { state: GardenState; ok: boolean; reason?: string } {
  const type = getPlantType(plantTypeId);
  if (!type) return { state, ok: false, reason: "Unknown plant." };
  if (type.nftOnly && !isNftHolder) {
    return { state, ok: false, reason: "Connect wallet & hold a Bonga NFT." };
  }
  if (!state.unlockedPlantIds.includes(plantTypeId)) {
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
        { instanceId, plantTypeId, plantedAt: Date.now() },
      ],
      lastTickAt: Date.now(),
    },
  };
}

export function completeQuest(
  state: GardenState,
  questId: string
): { state: GardenState; ok: boolean; reward: number } {
  const quest = DAILY_QUESTS.find((q) => q.id === questId);
  if (!quest || state.questsDone.includes(questId)) {
    return { state, ok: false, reward: 0 };
  }

  if (questId === "water-5" && state.waterCountToday < 5) {
    return { state, ok: false, reward: 0 };
  }

  return {
    ok: true,
    reward: quest.reward,
    state: {
      ...state,
      gardenBonga: state.gardenBonga + quest.reward,
      totalEarned: state.totalEarned + quest.reward,
      questsDone: [...state.questsDone, questId],
      lastTickAt: Date.now(),
    },
  };
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