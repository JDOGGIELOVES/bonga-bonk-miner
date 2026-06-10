import {
  BONGA_AFFIRMATIONS,
  BongaAffirmation,
  CATEGORY_LABELS,
  getAffirmationCycleIndex,
  getTodaysAffirmation,
} from "@/lib/bonga-affirmations";
import { SITE_URL } from "@/lib/site-seo";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatAffirmationMessage(
  affirmation: BongaAffirmation = getTodaysAffirmation(),
  options: { includeDayLabel?: boolean } = {}
): string {
  const { includeDayLabel = true } = options;
  const cycleIndex = getAffirmationCycleIndex();
  const dayNumber = cycleIndex + 1;
  const total = BONGA_AFFIRMATIONS.length;
  const category = CATEGORY_LABELS[affirmation.category];

  const lines = [
    includeDayLabel
      ? `${affirmation.emoji} <b>Daily Bonga Affirmation</b> · Day ${dayNumber}/${total}`
      : `${affirmation.emoji} <b>Bonga Affirmation</b>`,
    "",
    `<i>${category}</i>`,
    "",
    `"${escapeHtml(affirmation.text)}"`,
    "",
    "Peace, love, good bonks.",
    `<a href="${SITE_URL}/peace">bongabonks.com/peace</a>`,
  ];

  return lines.join("\n");
}

export function formatWelcomeMessage(): string {
  return [
    "🌼 <b>Welcome to the Bonga Daily Affirmation Bot</b>",
    "",
    "One peaceful bonk a day — 50 affirmations aligned with the Bonga way.",
    "",
    "<b>Commands</b>",
    "/today — today's affirmation",
    "/help — command list",
    "",
    `Full Peace experience: <a href="${SITE_URL}/peace">bongabonks.com/peace</a>`,
    `Community: <a href="https://t.me/bonga_sol_community">t.me/bonga_sol_community</a>`,
  ].join("\n");
}

export function formatHelpMessage(): string {
  return [
    "🫶 <b>Bonga Affirmation Bot</b>",
    "",
    "/today — get today's rotating affirmation (UTC cycle, 50 days)",
    "/start — welcome message",
    "/help — this menu",
    "",
    "The channel gets a fresh affirmation posted automatically each day.",
  ].join("\n");
}