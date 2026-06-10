import { NextResponse } from "next/server";
import {
  formatAffirmationMessage,
  formatHelpMessage,
  formatWelcomeMessage,
} from "@/lib/telegram-affirmation";
import {
  isTelegramConfigured,
  sendTelegramMessage,
  verifyTelegramWebhookSecret,
} from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    text?: string;
  };
}

function commandFromText(text: string | undefined): string | null {
  if (!text) return null;
  const trimmed = text.trim().toLowerCase();
  if (!trimmed.startsWith("/")) return null;
  const base = trimmed.split(/\s+/)[0]?.split("@")[0];
  return base || null;
}

async function handleCommand(chatId: number, command: string): Promise<void> {
  let reply: string;

  switch (command) {
    case "/start":
      reply = formatWelcomeMessage();
      break;
    case "/today":
      reply = formatAffirmationMessage();
      break;
    case "/help":
      reply = formatHelpMessage();
      break;
    default:
      reply = [
        "Unknown command. Try /today for today's affirmation or /help.",
      ].join("\n");
  }

  await sendTelegramMessage(chatId, reply, { parseMode: "HTML" });
}

export async function POST(request: Request) {
  if (!isTelegramConfigured()) {
    return NextResponse.json({ error: "Telegram bot not configured." }, { status: 503 });
  }

  if (!verifyTelegramWebhookSecret(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const message = update.message;
  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  const command = commandFromText(message.text);
  if (!command) {
    return NextResponse.json({ ok: true });
  }

  try {
    await handleCommand(message.chat.id, command);
  } catch (error) {
    const description =
      error instanceof Error ? error.message : "Failed to handle command.";
    return NextResponse.json({ error: description }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isTelegramConfigured(),
    hint: "POST Telegram updates to this endpoint.",
  });
}