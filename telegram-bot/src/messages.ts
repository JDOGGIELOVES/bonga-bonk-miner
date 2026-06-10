import { getCycleIndex } from "./affirmations.js";
import { config } from "./config.js";
import type { Affirmation } from "./types.js";
import { CATEGORY_LABELS } from "./types.js";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatAffirmation(
  affirmation: Affirmation,
  total: number,
  options: { daily?: boolean } = {}
): string {
  const { daily = false } = options;
  const dayNumber = getCycleIndex(total) + 1;
  const category = CATEGORY_LABELS[affirmation.category];

  const header = daily
    ? `${affirmation.emoji} <b>Good morning, fam</b> · Day ${dayNumber}/${total}`
    : `${affirmation.emoji} <b>Bonga Affirmation</b>`;

  return [
    header,
    "",
    `<i>${category}</i>`,
    "",
    `"${escapeHtml(affirmation.text)}"`,
    "",
    "Peace, love, good bonks. 🌼",
    `<a href="${config.siteUrl}/peace">${config.siteUrl.replace(/^https?:\/\//, "")}/peace</a>`,
  ].join("\n");
}

export function formatWelcome(): string {
  return [
    "🌼 <b>Welcome to Bonga Bonk's Sister</b>",
    "",
    "Peaceful vibes, loving energy, and one good bonk at a time.",
    "I'm your daily affirmation companion for the Bonga fam.",
    "",
    "<b>Commands</b>",
    "/d or /b — fresh random affirmation each time",
    "/affirm or /daily — same thing, longer",
    "/chatid — show this group's ID (for setup)",
    "/help — what I can do",
    "",
    `Peace hub: <a href="${config.siteUrl}/peace">bongabonks.com/peace</a>`,
    `Community: <a href="${config.communityUrl}">t.me/bonga_sol_community</a>`,
    "",
    "Raise the frequency. ✌️",
  ].join("\n");
}

export function formatHelp(): string {
  return [
    "🫶 <b>Bonga Affirmation Bot</b>",
    "",
    "/d or /b — new random affirmation every time",
    "/affirm or /daily — same, longer names",
    "/chatid — show group ID (paste into .env as CHAT_ID)",
    "/start — welcome message",
    "/help — this menu",
    "",
    "Every morning I post a fresh affirmation in the community chat.",
    "50+ affirmations in the pool — peace, bonks, fam, self-love, frequency.",
  ].join("\n");
}

export function formatAddAffirmUsage(): string {
  return [
    "Admin usage:",
    "<code>/addaffirm &lt;category&gt; &lt;emoji&gt; &lt;text&gt;</code>",
    "",
    "Categories: peace, bonk, community, self, frequency",
    "Example:",
    "<code>/addaffirm peace 🌼 I meadow-calm my nervous system before the timeline wakes up.</code>",
  ].join("\n");
}