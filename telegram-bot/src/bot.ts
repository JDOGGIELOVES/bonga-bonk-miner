import { Bot } from "grammy";
import { config } from "./config.js";
import {
  addAffirmation,
  getRandomAffirmation,
  isValidCategory,
  listAffirmations,
} from "./affirmations.js";
import {
  formatAddAffirmUsage,
  formatAffirmation,
  formatHelp,
  formatWelcome,
} from "./messages.js";

function isAdmin(userId: number | undefined): boolean {
  if (!userId) return false;
  if (config.adminUserIds.length === 0) return false;
  return config.adminUserIds.includes(userId);
}

const replyOptions = {
  parse_mode: "HTML" as const,
  link_preview_options: { is_disabled: true },
};

/** Avoid back-to-back repeats when someone spams /d in the same chat. */
const lastAffirmationByChat = new Map<number, string>();

export function createBot(): Bot {
  const bot = new Bot(config.botToken);

  bot.use(async (ctx, next) => {
    const text = ctx.message?.text;
    const chat = ctx.chat;
    if (text && chat) {
      const where =
        chat.type === "private"
          ? "DM"
          : "title" in chat && chat.title
            ? chat.title
            : String(chat.type);
      console.log(`[bot] ${where}: ${text}`);
    }
    await next();
  });

  bot.command("start", async (ctx) => {
    await ctx.reply(formatWelcome(), replyOptions);
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(formatHelp(), replyOptions);
  });

  bot.command("chatid", async (ctx) => {
    const chat = ctx.chat;
    const rawTitle = ("title" in chat && chat.title) || "this chat";
    const title = rawTitle.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const username = "username" in chat && chat.username ? `@${chat.username}` : "—";

    console.log(`[bot] /chatid → CHAT_ID=${chat.id} (${rawTitle})`);

    await ctx.reply(
      [
        "🆔 <b>Chat ID for setup</b>",
        "",
        `Name: <b>${title}</b>`,
        `Username: ${username}`,
        "",
        "Copy this into your <code>.env</code> file:",
        "",
        `<code>CHAT_ID=${chat.id}</code>`,
        "",
        "Then restart the bot. Morning affirmations will post here.",
      ].join("\n"),
      replyOptions
    );
  });

  const sendAffirmation = async (ctx: {
    chat?: { id: number };
    reply: (text: string, options?: typeof replyOptions) => Promise<unknown>;
  }) => {
    const chatId = ctx.chat?.id;
    const excludeId = chatId ? lastAffirmationByChat.get(chatId) : undefined;
    const affirmation = await getRandomAffirmation(excludeId);
    if (chatId) lastAffirmationByChat.set(chatId, affirmation.id);
    const total = (await listAffirmations()).length;
    await ctx.reply(formatAffirmation(affirmation, total), replyOptions);
  };

  bot.command(["affirm", "daily", "d", "b", "bonk"], sendAffirmation);

  bot.command("addaffirm", async (ctx) => {
    const userId = ctx.from?.id;
    if (!isAdmin(userId)) {
      await ctx.reply("Only Bonga admins can add affirmations. 🛡️");
      return;
    }

    const text = ctx.message?.text?.trim() ?? "";
    const body = text.replace(/^\/addaffirm(@\w+)?\s*/i, "").trim();
    if (!body) {
      await ctx.reply(formatAddAffirmUsage(), replyOptions);
      return;
    }

    const parts = body.split(/\s+/);
    const category = parts[0]?.toLowerCase();
    const emoji = parts[1];
    const affirmationText = parts.slice(2).join(" ").trim();

    if (!category || !emoji || !affirmationText) {
      await ctx.reply(formatAddAffirmUsage(), replyOptions);
      return;
    }

    if (!isValidCategory(category)) {
      await ctx.reply(
        "Unknown category. Use: peace, bonk, community, self, frequency."
      );
      return;
    }

    try {
      const created = await addAffirmation({
        category,
        emoji,
        text: affirmationText,
      });
      const total = (await listAffirmations()).length;
      await ctx.reply(
        [
          "✅ Added to the affirmation pool:",
          "",
          formatAffirmation(created, total),
          "",
          `Pool size: ${total}`,
        ].join("\n"),
        replyOptions
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save.";
      await ctx.reply(`Could not add affirmation: ${message}`);
    }
  });

  bot.catch((error) => {
    console.error("[bot] Unhandled error:", error);
  });

  return bot;
}