# Bonga Daily Affirmation Bot

Peaceful, loving, hippie-vibe Telegram bot for the Bonga fam — like **Bonga Bonk's Sister**.

Posts a rotating daily affirmation every morning, answers on-demand requests, and lets admins grow the pool over time.

## Plan

```
telegram-bot/
├── data/affirmations.json   # 55 seed affirmations (easy to edit)
├── src/
│   ├── index.ts             # Boot: load data, start cron + polling
│   ├── config.ts            # Env parsing (BOT_TOKEN, CHAT_ID, CRON_TIME)
│   ├── types.ts             # Affirmation types + categories
│   ├── affirmations.ts      # Load/save JSON, daily cycle, /addaffirm storage
│   ├── messages.ts          # Bonga-branded HTML message templates
│   ├── bot.ts               # grammY commands (/start, /affirm, /daily, /addaffirm)
│   └── scheduler.ts         # node-cron morning post to CHAT_ID
├── .env.example
├── render.yaml              # One-click Render worker deploy
└── README.md
```

| Feature | How it works |
|--------|----------------|
| **Morning post** | `node-cron` fires at `CRON_TIME` in `CRON_TIMEZONE`, sends today's affirmation to `CHAT_ID` |
| **Daily rotation** | UTC day-of-year index modulo pool size (same cycle as bongabonks.com/peace) |
| **/affirm, /daily** | Returns today's affirmation in DM or group |
| **/start** | Warm Bonga welcome + command list |
| **/addaffirm** | Admins append to `data/affirmations.json` at runtime |
| **Personality** | Peace, love, good bonks — meadow-calm, no clinical vibes |

## Quick start (local)

```bash
cd telegram-bot
cp .env.example .env
# Edit .env — set BOT_TOKEN, CHAT_ID, ADMIN_USER_IDS

npm install
npm run dev
```

### Create the bot

1. Open [@BotFather](https://t.me/BotFather) → `/newbot` → copy **BOT_TOKEN**.
2. Add the bot to your **group or channel** as a member (admin for channels).
3. Get **CHAT_ID**:
   - Forward a message from the chat to [@userinfobot](https://t.me/userinfobot), or
   - Send a message in the group, then visit  
     `https://api.telegram.org/bot<TOKEN>/getUpdates`  
     and read `message.chat.id` (channels often look like `-100…`).
4. Get your **ADMIN_USER_IDS** from [@userinfobot](https://t.me/userinfobot) after you DM it.

### Configure the morning post

| Variable | Example | Meaning |
|----------|---------|---------|
| `CRON_TIME` | `08:00` | Post every day at 8:00 AM |
| `CRON_TIME` | `0 8 * * *` | Full cron expression (5 fields) |
| `CRON_TIMEZONE` | `America/New_York` | IANA timezone for `HH:MM` format |
| `CHAT_ID` | `-1001234567890` | Group or channel that receives the scheduled post |

The bot uses **long polling** (no public URL required). `node-cron` runs inside the same process, so the app must stay running 24/7 — use a **worker** service on Railway or Render, not serverless.

## Commands

| Command | Who | Description |
|---------|-----|-------------|
| `/start` | Everyone | Bonga welcome + instructions |
| `/affirm` or `/daily` | Everyone | Today's affirmation on demand |
| `/help` | Everyone | Command list |
| `/addaffirm <category> <emoji> <text>` | Admins | Add affirmation to JSON pool |

**Categories:** `peace`, `bonk`, `community`, `self`, `frequency`

**Example:**
```
/addaffirm peace 🌼 I meadow-calm my nervous system before the timeline wakes up.
```

## Editing affirmations

**By hand:** edit `data/affirmations.json` and restart the bot.

**At runtime:** use `/addaffirm` (persists to the same JSON file).

On Railway/Render, mount a **persistent volume** on `data/` if you want `/addaffirm` additions to survive redeploys. Otherwise, commit JSON changes to git.

## Deploy on Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** (or upload this folder).
2. Set **Root Directory** to `telegram-bot` if deploying from the monorepo.
3. **Settings → Deploy**:
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. Add environment variables from `.env.example`.
5. Use a **long-running service** (not a cron-only job) — scheduling is built into the bot via `node-cron`.

Optional: attach a volume at `/app/data` (or your working directory + `data`) for persistent affirmations.

## Deploy on Render

1. Push to GitHub.
2. Render Dashboard → **New +** → **Blueprint** (uses included `render.yaml`),  
   or **Background Worker** with:
   - Build: `npm install && npm run build`
   - Start: `npm start`
3. Set secrets: `BOT_TOKEN`, `CHAT_ID`, `ADMIN_USER_IDS`.
4. Adjust `CRON_TIME` / `CRON_TIMEZONE` in the Render env UI.

> Use a **Background Worker**, not a Web Service — the bot does not expose HTTP.

## Environment reference

See `.env.example`:

- `BOT_TOKEN` — Telegram bot token (required)
- `CHAT_ID` — Target group/channel for scheduled posts (required)
- `CRON_TIME` — `HH:MM` or cron expression (default `08:00`)
- `CRON_TIMEZONE` — IANA timezone (default `UTC`)
- `ADMIN_USER_IDS` — Comma-separated Telegram user IDs for `/addaffirm`
- `SITE_URL` — Link in messages (default `https://bongabonks.com`)
- `COMMUNITY_URL` — Community link in welcome message
- `AFFIRMATIONS_PATH` — Optional override path to JSON file

## Production checklist

- [ ] Bot is admin in the target channel (required to post)
- [ ] `CHAT_ID` matches the community group/channel
- [ ] `CRON_TIME` + `CRON_TIMEZONE` match when your fam wakes up
- [ ] `ADMIN_USER_IDS` set for trusted operators
- [ ] Persistent volume on `data/` if using `/addaffirm` in production

Peace, love, good bonks. 🌼