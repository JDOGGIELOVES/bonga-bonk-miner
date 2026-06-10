import { createBot } from "./bot.js";
import { config } from "./config.js";
import { listAffirmations } from "./affirmations.js";
import { startDailyScheduler } from "./scheduler.js";

async function main(): Promise<void> {
  const affirmations = await listAffirmations();
  console.log(`[bonga-bot] Loaded ${affirmations.length} affirmations`);
  if (config.chatId) {
    console.log(`[bonga-bot] Target chat: ${config.chatId}`);
    console.log(
      `[bonga-bot] Schedule: ${config.cronExpression} (${config.cronTimezone})`
    );
  } else {
    console.log(
      "[bonga-bot] CHAT_ID not set — morning posts disabled until you add it."
    );
    console.log(
      "[bonga-bot] Add the bot to https://t.me/bonga_sol_community and run /chatid there."
    );
  }

  const bot = createBot();
  if (config.chatId) {
    startDailyScheduler(bot);
  }

  await bot.api.deleteWebhook({ drop_pending_updates: true });
  await bot.api.setMyCommands([
    { command: "d", description: "Random affirmation (short)" },
    { command: "b", description: "Random Bonga affirmation" },
    { command: "daily", description: "Random affirmation" },
    { command: "help", description: "Command list" },
  ]);

  console.log("[bonga-bot] Starting long polling…");
  console.log("[bonga-bot] In groups use: /d@bonga_affirm_bot");
  await bot.start({
    onStart: (info) => {
      console.log(`[bonga-bot] Online as @${info.username}`);
      console.log("[bonga-bot] Group command: /d@bonga_affirm_bot");
    },
  });
}

main().catch((error) => {
  console.error("[bonga-bot] Fatal error:", error);
  process.exit(1);
});