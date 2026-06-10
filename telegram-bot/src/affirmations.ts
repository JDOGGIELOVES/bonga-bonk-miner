import { readFile, writeFile } from "node:fs/promises";
import { config } from "./config.js";
import type { Affirmation, AffirmationCategory, AffirmationStore } from "./types.js";
import { VALID_CATEGORIES } from "./types.js";

function dayIndex(): number {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function loadStore(): Promise<AffirmationStore> {
  const raw = await readFile(config.affirmationsPath, "utf8");
  const data = JSON.parse(raw) as AffirmationStore;
  if (!Array.isArray(data.affirmations)) {
    throw new Error("affirmations.json is missing an affirmations array.");
  }
  return data;
}

export async function saveStore(store: AffirmationStore): Promise<void> {
  await writeFile(
    config.affirmationsPath,
    `${JSON.stringify(store, null, 2)}\n`,
    "utf8"
  );
}

export async function listAffirmations(): Promise<Affirmation[]> {
  const store = await loadStore();
  return store.affirmations;
}

export function getCycleIndex(total: number): number {
  if (total <= 0) return 0;
  return dayIndex() % total;
}

export async function getTodaysAffirmation(): Promise<Affirmation> {
  const affirmations = await listAffirmations();
  if (affirmations.length === 0) {
    throw new Error("No affirmations in pool — add some via data/affirmations.json.");
  }
  return affirmations[getCycleIndex(affirmations.length)];
}

export async function getRandomAffirmation(
  excludeId?: string
): Promise<Affirmation> {
  const affirmations = await listAffirmations();
  const pool = excludeId
    ? affirmations.filter((item) => item.id !== excludeId)
    : affirmations;
  if (pool.length === 0) {
    return affirmations[0];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export function isValidCategory(value: string): value is AffirmationCategory {
  return (VALID_CATEGORIES as string[]).includes(value);
}

export async function addAffirmation(input: {
  category: AffirmationCategory;
  emoji: string;
  text: string;
}): Promise<Affirmation> {
  const store = await loadStore();
  const baseId = `${input.category}-${slugify(input.text)}`;
  let id = baseId;
  let suffix = 2;
  while (store.affirmations.some((item) => item.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  const affirmation: Affirmation = {
    id,
    text: input.text.trim(),
    category: input.category,
    emoji: input.emoji.trim(),
  };

  store.affirmations.push(affirmation);
  await saveStore(store);
  return affirmation;
}