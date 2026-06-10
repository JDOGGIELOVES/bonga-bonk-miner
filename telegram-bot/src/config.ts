import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const defaultAffirmationsPath = path.join(moduleDir, "..", "data", "affirmations.json");

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseAdminIds(raw: string | undefined): number[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id));
}

/** Convert HH:MM to a 5-field cron expression (minute hour * * *). */
export function parseCronSchedule(cronTime: string): string {
  const trimmed = cronTime.trim();
  const hhmm = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (hhmm) {
    const hour = Number(hhmm[1]);
    const minute = Number(hhmm[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      throw new Error(`Invalid CRON_TIME HH:MM value: ${cronTime}`);
    }
    return `${minute} ${hour} * * *`;
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      `CRON_TIME must be HH:MM (e.g. 08:00) or a 5-field cron expression (e.g. 0 8 * * *). Got: ${cronTime}`
    );
  }
  return trimmed;
}

export const config = {
  botToken: requireEnv("BOT_TOKEN"),
  /** Optional until you run /chatid in the target group to discover it. */
  chatId: process.env.CHAT_ID?.trim() || undefined,
  cronExpression: parseCronSchedule(process.env.CRON_TIME?.trim() || "08:00"),
  cronTimezone: process.env.CRON_TIMEZONE?.trim() || "UTC",
  adminUserIds: parseAdminIds(process.env.ADMIN_USER_IDS),
  siteUrl: (process.env.SITE_URL || "https://bongabonks.com").replace(/\/$/, ""),
  communityUrl:
    process.env.COMMUNITY_URL || "https://t.me/bonga_sol_community",
  affirmationsPath:
    process.env.AFFIRMATIONS_PATH?.trim() || defaultAffirmationsPath,
};