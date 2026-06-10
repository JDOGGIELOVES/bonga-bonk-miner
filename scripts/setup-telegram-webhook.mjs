#!/usr/bin/env node
/**
 * Register the Bonga affirmation bot webhook on Telegram.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=... NEXT_PUBLIC_SITE_URL=https://bongabonks.com node scripts/setup-telegram-webhook.mjs
 *
 * Optional:
 *   TELEGRAM_WEBHOOK_SECRET=...  (recommended — must match Vercel env)
 */

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://bongabonks.com").replace(
  /\/$/,
  ""
);
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN.");
  process.exit(1);
}

const webhookUrl = `${siteUrl}/api/telegram/webhook`;
const body = {
  url: webhookUrl,
  allowed_updates: ["message"],
  drop_pending_updates: true,
};
if (secret) body.secret_token = secret;

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const data = await response.json();
if (!data.ok) {
  console.error("setWebhook failed:", data.description || data);
  process.exit(1);
}

console.log("Webhook registered:", webhookUrl);
if (secret) console.log("Secret token enabled (TELEGRAM_WEBHOOK_SECRET).");

const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then((r) =>
  r.json()
);
console.log(JSON.stringify(info.result, null, 2));