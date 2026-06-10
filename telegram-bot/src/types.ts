export type AffirmationCategory =
  | "peace"
  | "bonk"
  | "community"
  | "self"
  | "frequency";

export interface Affirmation {
  id: string;
  text: string;
  category: AffirmationCategory;
  emoji: string;
}

export interface AffirmationStore {
  version: number;
  affirmations: Affirmation[];
}

export const CATEGORY_LABELS: Record<AffirmationCategory, string> = {
  peace: "Peace",
  bonk: "Good Bonks",
  community: "The Fam",
  self: "Inner Bonga",
  frequency: "Raise the Frequency",
};

export const VALID_CATEGORIES: AffirmationCategory[] = [
  "peace",
  "bonk",
  "community",
  "self",
  "frequency",
];