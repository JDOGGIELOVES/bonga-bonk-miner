import { mkdir, readFile, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { readBlobText, writeBlobText } from "@/lib/blob-json-store";
import {
  GARDEN_DAILY_EARN_CAP,
  type GardenState,
  type PlantedCrop,
} from "@/lib/vibes-garden";

/**
 * Garden daily earn/claim cap (1500).
 * On-chain withdrawals up to 20,001 $BONGA daily per wallet (no minimum vault threshold).
 * Earnings auto-deposit to the player's vault.
 */

export interface GardenEarnRecord extends GardenState {
  wallet: string;
  /** On-chain $BONGA already claimed from today's garden earnings. */
  claimed: number;
  /** Hashed client IP — wallet locked to first connection of the day. */
  ipKey?: string;
  /** One-time import of local plants/shop balance when wallet first links. */
  bootstrapped: boolean;
  lastWaterAt: number;
  watersInWindow: number;
  waterWindowStart: number;
  lastSyncAt: number;
  updatedAt: string;
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function gardenDailyClaimLimit(): number {
  // Defaults to the shared GARDEN_DAILY_EARN_CAP (1500). All small claims auto-deposit to Bonga Bank Vault.
  return envInt("GARDEN_DAILY_CLAIM_LIMIT", GARDEN_DAILY_EARN_CAP);
}

export function maxGardenPlantsPerWallet(): number {
  return envInt("GARDEN_MAX_PLANTS_PER_WALLET", 48);
}

export function maxGardenShopBalance(): number {
  return envInt("GARDEN_MAX_SHOP_BALANCE", 5_000);
}

export function minMsBetweenGardenWaters(): number {
  return envInt("GARDEN_MIN_MS_BETWEEN_WATERS", 400);
}

export function maxGardenWatersPerMinute(): number {
  return envInt("GARDEN_MAX_WATERS_PER_MINUTE", 45);
}

export function minMsBetweenGardenSyncs(): number {
  return envInt("GARDEN_MIN_MS_BETWEEN_SYNCS", 4_000);
}

export function isGardenClaimsPaused(): boolean {
  if (process.env.CLAIMS_PAUSED === "true") return true;
  return process.env.GARDEN_CLAIMS_PAUSED !== "false";
}

function blobPath(wallet: string, date: string): string {
  const safe = wallet.replace(/[^a-zA-Z0-9]/g, "_");
  return `bonga-garden/earned/${safe}/${date}.json`;
}

function envFlag(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === "1";
}

function hasBlobCredentials(): boolean {
  if (envFlag("BLOB_READ_WRITE_TOKEN")) return true;
  if (!envFlag("BLOB_STORE_ID")) return false;
  if (isVercelRuntime()) return true;
  return envFlag("VERCEL_OIDC_TOKEN");
}

function useBlobStorage(): boolean {
  if (isVercelRuntime()) return hasBlobCredentials();
  return envFlag("BLOB_READ_WRITE_TOKEN");
}

function getLocalDataDir(): string {
  if (isVercelRuntime()) {
    return path.join(os.tmpdir(), "bonga-garden-earn");
  }
  return path.join(process.cwd(), ".bonga-garden-data");
}

function localRecordPath(wallet: string, date: string): string {
  const safe = wallet.replace(/[^a-zA-Z0-9]/g, "_");
  return path.join(getLocalDataDir(), safe, `${date}.json`);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function emptyGardenEarnRecord(wallet: string, date: string): GardenEarnRecord {
  const now = Date.now();
  return {
    wallet,
    date,
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
    claimed: 0,
    bootstrapped: false,
    lastWaterAt: 0,
    watersInWindow: 0,
    waterWindowStart: now,
    lastSyncAt: 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function getGardenEarnRecord(
  wallet: string,
  date: string
): Promise<GardenEarnRecord> {
  const normalized = wallet.trim();

  if (useBlobStorage()) {
    const raw = await readBlobText(blobPath(normalized, date));
    if (raw) {
      try {
        return { ...emptyGardenEarnRecord(normalized, date), ...JSON.parse(raw) };
      } catch {
        return emptyGardenEarnRecord(normalized, date);
      }
    }
    return emptyGardenEarnRecord(normalized, date);
  }

  const filePath = localRecordPath(normalized, date);
  try {
    const raw = await readFile(filePath, "utf8");
    return { ...emptyGardenEarnRecord(normalized, date), ...JSON.parse(raw) };
  } catch {
    return emptyGardenEarnRecord(normalized, date);
  }
}

export async function saveGardenEarnRecord(record: GardenEarnRecord): Promise<void> {
  record.updatedAt = new Date().toISOString();
  const text = `${JSON.stringify(record, null, 2)}\n`;

  if (useBlobStorage()) {
    await writeBlobText(blobPath(record.wallet, record.date), text);
    return;
  }

  const filePath = localRecordPath(record.wallet, record.date);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, text, "utf8");
}

export function gardenStateFromRecord(record: GardenEarnRecord): GardenState {
  return {
    date: record.date,
    gardenBonga: record.gardenBonga,
    totalEarned: record.totalEarned,
    bongaFarmedToday: record.bongaFarmedToday,
    lifetimeWaters: record.lifetimeWaters,
    waterCountToday: record.waterCountToday,
    plants: record.plants,
    unlockedPlantIds: record.unlockedPlantIds,
    questsDone: record.questsDone,
    lastTickAt: record.lastTickAt,
  };
}

export function applyGardenStateToRecord(
  record: GardenEarnRecord,
  state: GardenState
): GardenEarnRecord {
  return {
    ...record,
    ...state,
    wallet: record.wallet,
    claimed: record.claimed,
    ipKey: record.ipKey,
    bootstrapped: record.bootstrapped,
    lastWaterAt: record.lastWaterAt,
    watersInWindow: record.watersInWindow,
    waterWindowStart: record.waterWindowStart,
    lastSyncAt: record.lastSyncAt,
  };
}

export function gardenClaimableFromRecord(record: GardenEarnRecord): number {
  const raw = Math.max(0, record.bongaFarmedToday - record.claimed);
  return Math.floor(raw * 100) / 100;
}

export async function recordGardenClaim(
  wallet: string,
  date: string,
  amount: number
): Promise<GardenEarnRecord> {
  const record = await getGardenEarnRecord(wallet, date);
  record.claimed = Math.min(
    record.bongaFarmedToday,
    Math.round((record.claimed + amount) * 100) / 100
  );
  await saveGardenEarnRecord(record);
  return record;
}

export async function rollbackGardenClaim(
  wallet: string,
  date: string,
  amount: number
): Promise<GardenEarnRecord> {
  const record = await getGardenEarnRecord(wallet, date);
  record.claimed = Math.max(0, Math.round((record.claimed - amount) * 100) / 100);
  await saveGardenEarnRecord(record);
  return record;
}

export function isGardenEarnStorageReady(): boolean {
  if (isVercelRuntime()) return hasBlobCredentials();
  return true;
}

export function rolloverGardenRecordIfNeeded(record: GardenEarnRecord): GardenEarnRecord {
  const today = todayKey();
  if (record.date === today) return record;
  return emptyGardenEarnRecord(record.wallet, today);
}

export function sanitizeBootstrapPlants(plants: PlantedCrop[]): PlantedCrop[] {
  const max = maxGardenPlantsPerWallet();
  return plants.slice(0, max).map((crop, index) => ({
    instanceId: crop.instanceId?.trim() || `imported-${index}`,
    plantTypeId: crop.plantTypeId,
    plantedAt: Number(crop.plantedAt) || Date.now(),
    zone: crop.zone === "greenhouse" || crop.zone === "farm" ? crop.zone : "meadow",
  }));
}