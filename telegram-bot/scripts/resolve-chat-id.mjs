#!/usr/bin/env node
/**
 * Resolve a public Telegram group/channel username to a numeric CHAT_ID.
 *
 * Usage:
 *   BOT_TOKEN=... node scripts/resolve-chat-id.mjs
 *   BOT_TOKEN=... node scripts/resolve-chat-id.mjs bonga_sol_community
 *
 * The bot must already be a member of the group/channel.
 */

import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
config({ path: path.join(root, ".env") });

const token = process.env.BOT_TOKEN?.trim();
const username = (process.argv[2] || "bonga_sol_community").replace(/^@/, "");

if (!token) {
  console.error("Set BOT_TOKEN first.");
  process.exit(1);
}

const chatRef = `@${username}`;
const url = `https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(chatRef)}`;
const response = await fetch(url);
const data = await response.json();

if (!data.ok) {
  console.error("getChat failed:", data.description || data);
  console.error("");
  console.error("Fix checklist:");
  console.error("  1. BOT_TOKEN is correct");
  console.error("  2. Bot is added to https://t.me/" + username);
  console.error("  3. Someone posted in the group after the bot joined");
  process.exit(1);
}

const chat = data.result;
console.log("");
console.log("Resolved:", chatRef);
console.log("Title:   ", chat.title);
console.log("Type:    ", chat.type);
console.log("");
console.log("Put this in your .env:");
console.log("");
console.log(`CHAT_ID=${chat.id}`);
console.log("");
console.log("Community link: https://t.me/" + username);