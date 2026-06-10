#!/usr/bin/env node
/**
 * Diagnose why the bot isn't replying.
 * Usage: npm run telegram:doctor  (reads telegram-bot/.env)
 */

import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
config({ path: path.join(root, ".env") });

const token = process.env.BOT_TOKEN?.trim();
if (!token) {
  console.error("Missing BOT_TOKEN. Put it in .env or pass in the shell.");
  process.exit(1);
}

const api = (method, params = {}) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((r) => r.json());

console.log("\n=== Bonga Telegram Doctor ===\n");

const me = await api("getMe");
if (!me.ok) {
  console.error("❌ BOT_TOKEN is invalid:", me.description);
  process.exit(1);
}
console.log("✅ Bot token OK");
console.log(`   Username: @${me.result.username}`);
console.log(`   Name:     ${me.result.first_name}`);

const webhook = await api("getWebhookInfo");
const hookUrl = webhook.result?.url || "";
if (hookUrl) {
  console.log("\n⚠️  WEBHOOK IS SET — local bot cannot receive messages!");
  console.log(`   URL: ${hookUrl}`);
  console.log("   Fixing: deleting webhook so npm run dev can use long polling…");
  const deleted = await api("deleteWebhook", { drop_pending_updates: true });
  if (deleted.ok) {
    console.log("✅ Webhook removed. Start the bot with: npm run dev");
  } else {
    console.error("❌ Could not delete webhook:", deleted.description);
  }
} else {
  console.log("\n✅ No webhook — long polling (npm run dev) can receive messages.");
}

const updates = await api("getUpdates", { limit: 5 });
if (updates.ok && updates.result?.length) {
  console.log("\n📨 Recent messages Telegram has for this bot:");
  for (const u of updates.result) {
    const m = u.message;
    if (!m) continue;
    const chat = m.chat;
    const label = chat.title || chat.username || chat.first_name || "chat";
    console.log(`   - "${m.text || "(no text)"}" in ${label} (id ${chat.id})`);
  }
} else {
  console.log("\n📭 No recent messages stored.");
  console.log("   After npm run dev is running, send the bot:");
  console.log(`   /chatid@${me.result.username}`);
  console.log("   in https://t.me/bonga_sol_community");
}

console.log("\n=== Next steps ===");
console.log("1. telegram-bot/.env  →  BOT_TOKEN=your_token");
console.log("2. npm run dev        →  leave terminal open");
console.log(`3. In the group:      /chatid@${me.result.username}`);
console.log("4. Or DM the bot:     /chatid");
console.log("");