import { checkWalletIsBongaNftHolder } from "@/lib/nft-holder-server";
import {
  applyGardenStateToRecord,
  gardenStateFromRecord,
  maxGardenShopBalance,
  maxGardenPlantsPerWallet,
  minMsBetweenGardenSyncs,
  minMsBetweenGardenWaters,
  maxGardenWatersPerMinute,
  sanitizeBootstrapPlants,
  type GardenEarnRecord,
} from "@/lib/garden-earn-store";
import {
  applyIdleEarnings,
  buyPlant,
  completeQuest,
  getPlantType,
  PLANT_CATALOG,
  waterPlant,
  type GardenZone,
  type PlantedCrop,
} from "@/lib/vibes-garden";

export type GardenSyncAction =
  | { type: "bootstrap"; plants: PlantedCrop[]; gardenBonga: number }
  | { type: "tick"; now?: number }
  | { type: "water"; instanceId: string }
  | { type: "quest"; questId: string }
  | { type: "buy"; plantTypeId: string; zone: GardenZone };

export interface GardenSyncResult {
  ok: boolean;
  reason?: string;
  record: GardenEarnRecord;
  rejectedActions?: number;
}

function validPlantTypeId(id: string): boolean {
  return PLANT_CATALOG.some((plant) => plant.id === id);
}

function assertWaterRate(record: GardenEarnRecord, now: number): string | null {
  if (record.lastWaterAt && now - record.lastWaterAt < minMsBetweenGardenWaters()) {
    return "Watering too fast.";
  }

  const windowMs = 60_000;
  if (!record.waterWindowStart || now - record.waterWindowStart >= windowMs) {
    record.waterWindowStart = now;
    record.watersInWindow = 0;
  }

  if (record.watersInWindow >= maxGardenWatersPerMinute()) {
    return "Water rate limit reached. Slow down and try again.";
  }

  return null;
}

function applyBootstrap(
  record: GardenEarnRecord,
  action: Extract<GardenSyncAction, { type: "bootstrap" }>
): { ok: boolean; reason?: string } {
  if (record.bootstrapped) {
    return { ok: false, reason: "Garden already linked to wallet today." };
  }

  const plants = sanitizeBootstrapPlants(action.plants ?? []);
  if (plants.length === 0) {
    return { ok: false, reason: "Invalid garden bootstrap." };
  }

  for (const crop of plants) {
    if (!validPlantTypeId(crop.plantTypeId)) {
      return { ok: false, reason: "Unknown plant in bootstrap." };
    }
  }

  const shopBalance = Math.max(0, Math.min(maxGardenShopBalance(), Number(action.gardenBonga) || 0));

  record.plants = plants.slice(0, maxGardenPlantsPerWallet());
  record.gardenBonga = shopBalance;
  record.bootstrapped = true;
  record.bongaFarmedToday = 0;
  record.claimed = 0;
  record.lastTickAt = Date.now();

  return { ok: true };
}

export async function applyGardenSyncActions(params: {
  record: GardenEarnRecord;
  actions: GardenSyncAction[];
  ipKey?: string;
  now?: number;
}): Promise<GardenSyncResult> {
  let record = { ...params.record };
  const now = params.now ?? Date.now();
  let rejected = 0;

  if (params.ipKey) {
    if (record.ipKey && record.ipKey !== params.ipKey) {
      return {
        ok: false,
        reason: "This wallet is linked to a different connection for today.",
        record,
      };
    }
    if (!record.ipKey) {
      record.ipKey = params.ipKey;
    }
  }

  if (record.lastSyncAt && now - record.lastSyncAt < minMsBetweenGardenSyncs()) {
    const hasBootstrap = params.actions.some((action) => action.type === "bootstrap");
    if (!hasBootstrap) {
      return {
        ok: false,
        reason: "Garden sync too frequent. Please wait a moment.",
        record,
      };
    }
  }

  const isNftHolder = await checkWalletIsBongaNftHolder(record.wallet);
  let state = gardenStateFromRecord(record);

  for (const action of params.actions) {
    if (action.type === "bootstrap") {
      const result = applyBootstrap(record, action);
      if (!result.ok) {
        rejected += 1;
        continue;
      }
      state = gardenStateFromRecord(record);
      continue;
    }

    if (!record.bootstrapped && record.plants.length <= 1) {
      rejected += 1;
      continue;
    }

    if (action.type === "tick") {
      const tickNow = Math.min(now, action.now ?? now);
      if (action.now && action.now > now + 5_000) {
        rejected += 1;
        continue;
      }
      state = applyIdleEarnings(state, isNftHolder, tickNow);
      continue;
    }

    if (action.type === "water") {
      const rateError = assertWaterRate(record, now);
      if (rateError) {
        return { ok: false, reason: rateError, record, rejectedActions: rejected };
      }

      const crop = state.plants.find((plant) => plant.instanceId === action.instanceId);
      if (!crop || !getPlantType(crop.plantTypeId)) {
        rejected += 1;
        continue;
      }

      const result = waterPlant(state, action.instanceId, isNftHolder);
      state = result.state;
      record.lastWaterAt = now;
      record.watersInWindow += 1;
      continue;
    }

    if (action.type === "quest") {
      const result = completeQuest(state, action.questId);
      if (!result.ok) {
        rejected += 1;
        continue;
      }
      state = result.state;
      continue;
    }

    if (action.type === "buy") {
      if (!validPlantTypeId(action.plantTypeId)) {
        rejected += 1;
        continue;
      }
      if (state.plants.length >= maxGardenPlantsPerWallet()) {
        rejected += 1;
        continue;
      }

      const zone: GardenZone =
        action.zone === "greenhouse" || action.zone === "farm" ? action.zone : "meadow";
      const result = buyPlant(state, action.plantTypeId, zone, isNftHolder);
      if (!result.ok) {
        rejected += 1;
        continue;
      }
      state = result.state;
    }
  }

  record = applyGardenStateToRecord(record, state);
  record.lastSyncAt = now;

  return {
    ok: true,
    record,
    rejectedActions: rejected > 0 ? rejected : undefined,
  };
}