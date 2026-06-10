const TELEGRAM_API = "https://api.telegram.org";

export interface TelegramConfig {
  botToken: string;
  chatId?: string;
  webhookSecret?: string;
}

export function getTelegramConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!botToken) return null;

  return {
    botToken,
    chatId: process.env.TELEGRAM_CHAT_ID?.trim() || undefined,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || undefined,
  };
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
}

export function isTelegramBroadcastConfigured(): boolean {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim()
  );
}

interface SendMessageOptions {
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  disableWebPagePreview?: boolean;
}

interface TelegramApiResult<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: SendMessageOptions = {}
): Promise<TelegramApiResult<{ message_id: number }>> {
  const config = getTelegramConfig();
  if (!config) {
    return { ok: false, description: "TELEGRAM_BOT_TOKEN is not configured." };
  }

  const response = await fetch(
    `${TELEGRAM_API}/bot${config.botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parseMode,
        disable_web_page_preview: options.disableWebPagePreview ?? true,
      }),
    }
  );

  const data = (await response.json()) as TelegramApiResult<{ message_id: number }>;
  return data;
}

export function verifyTelegramWebhookSecret(request: Request): boolean {
  const config = getTelegramConfig();
  if (!config?.webhookSecret) return true;
  const header = request.headers.get("x-telegram-bot-api-secret-token");
  return header === config.webhookSecret;
}

export function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}