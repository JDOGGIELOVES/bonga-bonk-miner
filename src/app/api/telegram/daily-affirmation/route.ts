import { NextResponse } from "next/server";
import { formatAffirmationMessage } from "@/lib/telegram-affirmation";
import {
  getTelegramConfig,
  isTelegramBroadcastConfigured,
  sendTelegramMessage,
  verifyCronSecret,
} from "@/lib/telegram";
import { getTodaysAffirmation } from "@/lib/bonga-affirmations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isTelegramBroadcastConfigured()) {
    return NextResponse.json(
      { error: "Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID." },
      { status: 503 }
    );
  }

  const config = getTelegramConfig();
  const chatId = config?.chatId;
  if (!chatId) {
    return NextResponse.json({ error: "TELEGRAM_CHAT_ID missing." }, { status: 503 });
  }

  const affirmation = getTodaysAffirmation();
  const text = formatAffirmationMessage(affirmation);

  const result = await sendTelegramMessage(chatId, text, { parseMode: "HTML" });
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.description || "Telegram send failed.",
        affirmationId: affirmation.id,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    affirmationId: affirmation.id,
    messageId: result.result?.message_id,
    date: new Date().toISOString().slice(0, 10),
  });
}

export async function POST(request: Request) {
  return GET(request);
}