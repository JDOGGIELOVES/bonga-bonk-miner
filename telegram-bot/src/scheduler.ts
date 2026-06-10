import cron from "node-cron";
import type { Bot } from "grammy";
import { listAffirmations, getTodaysAffirmation } from "./affirmations.js";
import { config } from "./config.js";
import { formatAffirmation } from "./messages.js";

export function startDailyScheduler(bot: Bot): cron.ScheduledTask {
  if (!config.chatId) {
    throw new Error("CHAT_ID is required to start the daily scheduler.");
  }

  const expression = config.cronExpression;
  const timezone = config.cronTimezone;
  const chatId = config.chatId;

  if (!cron.validate(expression)) {
    throw new Error(`Invalid cron expression derived from CRON_TIME: ${expression}`);
  }

  console.log(
    `[scheduler] Daily affirmation → chat ${chatId} at "${expression}" (${timezone})`
  );

  return cron.schedule(
    expression,
    async () => {
      try {
        const affirmation = await getTodaysAffirmation();
        const total = (await listAffirmations()).length;
        const text = formatAffirmation(affirmation, total, { daily: true });
        await bot.api.sendMessage(chatId, text, {
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true },
        });
        console.log(
          `[scheduler] Posted daily affirmation: ${affirmation.id} (${new Date().toISOString()})`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[scheduler] Failed to post daily affirmation: ${message}`);
      }
    },
    { timezone }
  );
}