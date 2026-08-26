# Telegram Bot API — team tasks / standup (FACT brief)

26 Aug 2026. Official Bot API + five licensed GitHub bots. **Not** WhatsApp. **Not** user-account / MTProto clients.

Firecrawl keyless tier was rate-limited in this environment after earlier scrapes. Official pages: [Bots intro](https://core.telegram.org/bots), [Features](https://core.telegram.org/bots/features), [Bot API](https://core.telegram.org/bots/api). Repo facts from GitHub API (license SPDX + source). Cached Firecrawl hits in `.firecrawl/search-telegram-official.json` already pointed at `core.telegram.org/bots/api`.

This is **not legal advice**. Licenses and APIs change.

---

## Official Bot API (what actually exists)

Telegram bots are **not phone accounts**. @BotFather issues a token. The bot talks HTTPS to Telegram’s server:

`https://api.telegram.org/bot<token>/<method>`

[Bots intro](https://core.telegram.org/bots): Telegram handles encryption; the developer only sees the simplified Bot API. Bots **cannot start** a chat; a user must `/start` or add the bot to a group first.

**Inbound (pick one):**

| Method | What it is | Constraint |
|---|---|---|
| `getUpdates` | Long poll. Confirm by raising `offset`. | Fails if a webhook is set. [API](https://core.telegram.org/bots/api#getupdates) |
| `setWebhook` | Telegram POSTs each `Update` to your HTTPS URL. | Ports 443/80/88/8443. Disables `getUpdates`. [API](https://core.telegram.org/bots/api#setwebhook) |

**The `Update` is the inbox.** Task UIs use `message` / `edited_message` (commands, free text) and `callback_query` (inline buttons). Reply with `sendMessage`, `editMessageText`, `answerCallbackQuery`. Commands are `/keyword` (≤32 chars); register them with @BotFather or `setMyCommands`. [Features](https://core.telegram.org/bots/features)

**Groups (the cowork fact):** Privacy Mode is **on by default**. The bot only sees commands meant for it (`/cmd@this_bot`), replies to itself, and a few other “relevant” messages — **not** the whole group. Disable via @BotFather `/setprivacy`, or make the bot a group admin (admins always see all messages). Re-add the bot after toggling. [Privacy Mode](https://core.telegram.org/bots/features#privacy-mode)

**Telegram is not a task store.** `chat.id` is the team/room. `from.id` is the actor. Tasks live in **your** DB or another product’s API. Bots have limited cloud history; do not treat Telegram messages as the system of record.

**Not this API:** TDLib / MTProto user clients (the “log in as a person” path). Official bots do not need a phone number.

---

## How real OSS bots do team task read/write

Same loop every time:

1. Token from @BotFather.
2. Long-poll `getUpdates` **or** webhook.
3. Parse `/commands` and/or free text (and often `callback_data` on buttons).
4. **Read/write an external store.** Reply in the same `chat.id`.
5. Gate writes: allowlist of Telegram user IDs, “must be in this group” (`getChatMember`), or per-user OAuth to the task product.

There is **no** large, well-starred OSS “Jira-in-Telegram” product. The useful ones are small and licensed. Slack/Geekbot dominate commercial standup.

---

## Five real GitHub bots (licenses checked)

### 1. [maddevsio/mad-telegram-standup-bot](https://github.com/maddevsio/mad-telegram-standup-bot) — MIT — Go — **11★**

**Team standup in a group.** Mad Devs. MySQL. Library: [go-telegram-bot-api](https://github.com/go-telegram-bot-api/telegram-bot-api).

- **In:** `GetUpdatesChan`, 60s timeout (`bot/bot.go`).
- **Join/leave the team:** `/join` `/leave` keyed by `(UserID, ChatID)` (`bot/commands.go`).
- **Write a standup:** group message that **mentions the bot** *and* contains yesterday/today/blocker keywords (`bot/events.go` `HandleMessageEvent` + `isStandup`). Needs Privacy Mode off or admin, or people must @mention the bot.
- **Read:** `/show` group info; reminders if a standuper missed the deadline (`bot/notifications.go`).
- **Store:** own MySQL (`docker-compose.yml` `telegram` DB). Not Jira/Linear.

### 2. [ihoru/todoist_bot](https://github.com/ihoru/todoist_bot) — MIT — Python — **41★**

**Unofficial @Todoist_bot.** Official **Telegram** Bot API + official **Todoist** OAuth (`data:read_write,data:delete`).

- **In:** `python-telegram-bot` dispatcher.
- **Auth:** Flask redirects to Todoist; stores `access_token` per `tg_id` (SQLAlchemy).
- **Write:** any private text → `user.api.quick.add(...)` (`app/telegram/handlers.py` `any_text`).
- **Read:** `/projects` `/labels`; Todoist **webhook** `reminder:fired` → bot `sendMessage` (`app/todoist/__init__.py`).
- **Team:** **none.** `group()` replies “not available in group chat yet.” Per-user Todoist, not a shared board.

### 3. [turag-ev/kanboard-telegram-bot](https://github.com/turag-ev/kanboard-telegram-bot) — MIT — Python — **4★**

**Closest to “teammates read/write each other’s tasks.”** Official Bot API + [Kanboard JSON-RPC](https://docs.kanboard.org/en/latest/api/index.html). TURAG e.V.

- **In:** `Updater` + `CommandHandler` (`bot.py`).
- **ACL:** `granted_group` / `granted_user` / `granted_user_admin` IDs; `getChatMember` against a configured main group.
- **Read:** `/lists` `get_my_projects`; `/list` `/show` `/details` `/activity`.
- **Write:** `/todo <project> <title>` → `kb.create_task`; `/done` `closeTask`; `/undone` `openTask`; `/subtask`.
- **Team:** one Kanboard bot user (admin-ish). Telegram group membership is the permission check. Shared Kanboard projects are the store.

### 4. [amarcu/vikunja-telegram-assistant](https://github.com/amarcu/vikunja-telegram-assistant) — MIT — Python — **1★**

**Self-hosted Vikunja R/W.** Allowlist of Telegram user IDs. One Vikunja API token. No own DB.

- **In:** `python-telegram-bot` v21: `CommandHandler` + `MessageHandler` + `CallbackQueryHandler`.
- **Write:** free text or `/add` → `PUT /api/v1/projects/{id}/tasks` (`bot/vikunja.py`).
- **Read:** `/list` `/today` `/projects`; poller pings due/overdue.
- **Update:** inline **Done / Undo / Snooze** (`callback_data` `done:id`). Recurrence via Vikunja `repeat_after`.
- **Team:** “household” allowlist, **one token**. Everyone writes the same Vikunja account. Fine for 2–10 if you trust the list; not per-user OAuth.

### 5. [5hay/tg2notion](https://github.com/5hay/tg2notion) — MIT — Python — **18★**

**Write-only inbox → Notion table.** Official Telegram token + **unofficial** Notion `token_v2` cookie ([notion-py](https://github.com/jamalex/notion-py)), not Notion’s public API.

- **In:** one allowed `TG2N_TG_CHAT_ID`.
- **Write:** structured message → new Notion row (title / date / body).
- **Read:** none in Telegram.
- **Team:** single-user whitelist. Treat the cookie as a personal session, not a cowork integration.

---

## What this means for Taskkorb

| Want | Fact |
|---|---|
| Teammates read/write **each other’s** tasks in Telegram | **Our task store + auth.** Telegram only delivers commands/buttons. Kanboard-bot is the OSS pattern: group ACL → shared PM API. |
| Standup in the group | Mad Devs bot: `/join` + @mention + keywords + **own DB**. Privacy Mode must be off or the bot must be admin. |
| “Just add Telegram like Slack Geekbot” | No popular OSS Geekbot-for-Telegram. Build the digest yourselves. |
| Per-person Todoist/Notion | Works (todoist_bot, tg2notion). That is **not** a shared team board. |
| Bot DMs people who never `/start` | **Blocked** by Bot API. Standup nag-DMs only after the user has opened the bot. |

**Ship shape:** BotFather token → webhook or long-poll → commands + inline Done → **Taskkorb API** with `chat.id` / `from.id` mapped to our users. Same as Kanboard/Vikunja, with our store instead of theirs.

Hermes already speaks official Bot API ([python-telegram-bot](https://python-telegram-bot.org/), [Hermes Telegram](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram)). That is an agent gateway, not a task tracker.

---

## Sources

- [Telegram bots intro](https://core.telegram.org/bots)
- [Bot features (commands, inline keyboards, Privacy Mode)](https://core.telegram.org/bots/features)
- [Bot API: getUpdates, setWebhook, sendMessage](https://core.telegram.org/bots/api)
- [maddevsio/mad-telegram-standup-bot](https://github.com/maddevsio/mad-telegram-standup-bot) MIT
- [ihoru/todoist_bot](https://github.com/ihoru/todoist_bot) MIT
- [turag-ev/kanboard-telegram-bot](https://github.com/turag-ev/kanboard-telegram-bot) MIT
- [amarcu/vikunja-telegram-assistant](https://github.com/amarcu/vikunja-telegram-assistant) MIT
- [5hay/tg2notion](https://github.com/5hay/tg2notion) MIT
