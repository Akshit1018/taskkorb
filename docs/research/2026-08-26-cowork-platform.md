# Taskkorb cowork / personal-assistant direction

Research only except a root **Apache-2.0 `LICENSE` + `NOTICE`** so the repo matches visual SPDX. **No platform / orb / iOS code in this change.** Written 26 Aug 2026 after the owner asked for notes + tasks coworking, BYO ChatGPT, Hermes-per-user, budget from mail/SMS, MCP / Claude Code / Codex, WhatsApp, and an iOS floating dock that can drop voice into Claude / ChatGPT / Gemini / Codex.

Thirteen research tracks ran first (Firecrawl + official docs). A later **18-agent OSS pass** (two batches; Task limit 10) plus sibling notes on other branches produced section 16. `parallel-cli` **is installed** here but **cannot run**: `PARALLEL_API_KEY` is unset and `parallel-cli login` needs a human. Firecrawl is installed but **unauthenticated / keyless-rate-limited**. Facts below are from official docs + GitHub API, not from Parallel Deep Research.

This is **not legal advice**. Store and ToS rules change. Dates are scrape dates unless a page states otherwise.

---

## What you asked for (plain)

1. Notes + tasks app for **2–10 people** who cowork: share tasks, update tasks, talk (voice-native), Sheets-class integrations.
2. Typed messages should **speak out loud** (transcript already exists).
3. Users should run the app from **their own ChatGPT subscription on the phone**.
4. A **Hermes** agent behind every user that self-evolves with them.
5. **My Budget**: auto-see spend from email + phone SMS; end-of-day categories; **do not guess** — ask “I am unable to… whose sale was this?”
6. Open-source **shared memory** so agents can call other agents (ChatGPT, Claude, others).
7. **MCP** so Claude Code / Codex can read/write tasks at end of day.
8. **WhatsApp** so teammates can read/write each other’s tasks.
9. **iOS-first**: SwiftUI, floating dock, shortcuts into Claude / Codex / Antigravity / Gemini, transcribe and drop into any chat, read last 3–5 chats from those apps, “Listen me” wake word like Siri, auto-assign tasks from context.

---

## Hard facts (do not ship the opposite)

| Wish | Fact | Official source |
|---|---|---|
| Use ChatGPT Plus / Claude Pro / Gemini Advanced **inside our app** | **No.** Consumer chat plans do **not** include a generic chat/voice API. Separate billed keys. Claude Code / Codex CLI can share a **vendor CLI** quota — that is not a license for Taskkorb. | [What is ChatGPT Plus?](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus) · [Claude Pro vs API](https://support.claude.com/en/articles/9876003) · [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing) · [Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key) |
| Login-with-Plus / scrape ChatGPT cookies | **ToS + technically blocked** (credential sharing, other-origin cookies) | [OpenAI Terms](https://openai.com/policies/row-terms-of-use/) |
| iOS app reads SMS / bank texts | **No public inbox API** | [IdentityLookup filtering](https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering) |
| iOS Message Filter as a secret inbox | **Unknown senders only**; extension **cannot write** to the containing app | Same Apple page |
| Android SMS for a notes/tasks/voice app | Play lists **SMS-based money management** as a **review exception**, not a right. Core-functionality + declaration. Budget apps **must not** exfiltrate non-finance SMS. Bluecoins was **denied** in 2018–19. | [Play SMS policy](https://support.google.com/googleplay/android-developer/answer/10208820) · [Bluecoins](https://www.bluecoinsapp.com/google-policy-removing-sms-permissions/) |
| Floating dock over Claude / ChatGPT like AssistiveTouch | **Blocked on iOS.** No public overlay API and no `SYSTEM_ALERT_WINDOW`. AssistiveTouch is system-only. | [Review 2.5.1](https://developer.apple.com/app-store/review/guidelines/) (public APIs / intended purpose) · [AssistiveTouch](https://support.apple.com/en-us/111794) |
| Read last 3–5 chats from Claude / ChatGPT / Gemini / Codex | **Blocked.** Sandbox. Those apps do not publish a list API. | [iOS sandbox](https://support.apple.com/guide/security/security-of-runtime-process-sec15bfe098e/web) |
| “Hey Listen” always-on wake word | **No third-party system wake-word API.** Always-on + screen-off fails Review **2.5.4** (background must match intended purpose). 2.5.14 only requires consent + a recording indicator. Gemini on iPhone is still **tap Live**. User-configured [Vocal Shortcuts](https://support.apple.com/guide/iphone/iph7f242ea2c/ios) can map a phrase to our Shortcut — that is the system, not our listener. | [Review 2.5.4](https://developer.apple.com/app-store/review/guidelines/) · [Gemini Live iOS](https://support.google.com/gemini/answer/15274899?hl=en&co=GENIE.Platform%3DiOS) |
| Embed Hermes in the App Store binary | **No iOS SDK.** Official Hermes is Desktop / CLI / Docker / Termux. Review **2.5.2** forbids downloading/executing **new code that changes features** (skills, shell, browser) — not “any interpreter.” | [Hermes platforms](https://hermes-agent.nousresearch.com/docs/getting-started/platform-support) · [Review 2.5.2](https://developer.apple.com/app-store/review/guidelines/) |
| WhatsApp reads personal chats / joins the team group as a bot | **No personal inbox.** Cloud API is a **business number**. Default webhooks are user → *your* number. [Groups API](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups) is OBA, **max 8** participants — below the 2–10 cowork target. Unauthorized WhatsApp-Web / Baileys bridges are prohibited. | [WhatsApp platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform) · [Groups API](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups) |
| Gmail “connect inbox, auto-import all receipts” in v1 | `gmail.readonly` is **Restricted**. Verification + often annual CASA if a server sees mail. Budget is **not an explicit** approved use; reporting/monitoring examples exist, so treat as **uncertain + high friction**, not a hard policy ban. Forward remains the v1 path. | [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes) · [Workspace policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy) |

**Owner rule we should keep:** if category/merchant is unclear, **do not guess**. Ask.

---

## 1. Model money — three honest ways

ChatGPT Plus is **$20/month for chatgpt.com and official apps**. Official Help: **“API usage is separate and billed independently.”** [What is ChatGPT Plus?](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus)

OpenAI staff, marked solved: your ChatGPT subscription **does not** give API access; add funds on [platform.openai.com](https://platform.openai.com/). [Community thread](https://community.openai.com/t/api-chatgpt-subscription-cannot-use-api-with-chatgpt-subscription/875542)

Same split:

- Claude Pro/Max = chat. Console API = prepaid credits. [Anthropic](https://support.claude.com/en/articles/9876003)
- Gemini Advanced / Google AI Pro = Gemini **app**. Keys = [AI Studio](https://aistudio.google.com/apikey) + Cloud project. [Gemini billing](https://ai.google.dev/gemini-api/docs/billing)
- Claude Code can share a Pro/Max **quota for Anthropic’s own CLI**. That is **not** a license for our app.

**ChatGPT Apps SDK** is the **opposite** of embedding ChatGPT in Taskkorb: we would build a widget **inside ChatGPT**. [Introducing apps in ChatGPT](https://openai.com/index/introducing-apps-in-chatgpt/)

### Product models

| Model | What the user does | Billing honest? | Production-safe? |
|---|---|---|---|
| **A. BYO key** (already Gemini) | Paste AI Studio / OpenAI / Claude Console / OpenRouter key | Yes | **Local/demo only** on web (XSS, extensions). Prefer Keychain + phone→vendor, or the existing hosted **ephemeral Live mint**. Vendor docs: no production keys in clients |
| **B. We bill** | We hold keys, meter tokens, charge the user | Yes; we pay providers | Yes if the key stays on a backend |
| **C. “Use your Plus”** | Login as ChatGPT | **No. Do not ship.** | — |

Aggregators ([OpenRouter](https://openrouter.ai/), [Nous Portal](https://hermes-agent.nousresearch.com/docs/integrations/nous-portal)) are **new** paid pipes. They do not attach Plus/Pro/Advanced.

**Speak typed text (your first small ask):** use the browser/device [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis). That API is **not a billed Gemini/OpenAI TTS hop**. Voices may be **remote** — pick one with [`localService === true`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService) before promising on-device privacy.

---

## 2. Hermes — confirm which one, then host it

Closest match to “hermes.ai / self-evolve with the user”:

**[Hermes Agent](https://hermes-agent.nousresearch.com/docs/)** by [Nous Research](https://nousresearch.com/) — MIT, [GitHub](https://github.com/NousResearch/hermes-agent). Self-improving loop: skills from experience, `MEMORY.md` / `USER.md`, Honcho-class user modeling. Desktop + CLI. Telegram and 20+ gateways. **Not** a “paste hermes.ai and Taskkorb mints per-user SaaS.” Nous also sells [Hermes Cloud](https://portal.nousresearch.com/cloud) (they host an instance). That is **their** product, not an OEM we wrap, and not ChatGPT Plus.

NVIDIA writeup of the same agent + NemoClaw: [self-evolving Hermes](https://developer.nvidia.com/blog/deploy-self-evolving-agents-for-faster-more-secure-research-with-a-hermes-agent-and-nvidia-nemoclaw/).

### “Har user ke peeche Hermes”

Official **layout** is a **profile** (`~/.hermes/profiles/<name>/`), not a VM per user. Official Docker: one container *can* host all profiles. Two writers on one home **compound / entangle state**. [Profiles](https://hermes-agent.nousresearch.com/docs/user-guide/profiles) · [Docker](https://hermes-agent.nousresearch.com/docs/user-guide/docker)

**Profiles are not a sandbox.** The official page: a profile does **not** stop the agent from reading folders outside that directory; on the default local backend it has the same filesystem access as the OS user; tool subprocesses keep the real user `HOME` unless `terminal.home_mode: profile`. One hosted container for **unrelated** households is a shared-RCE / shared-`.ssh` layout. Use **one trust domain per process** (one family on one host they own), or **separate containers + volumes + credentials**. Docker docs also recommend a separate container per profile when you need blast-radius isolation.

Mobile story official docs actually give: **phone = Telegram (or our HTTP client). Hermes stays on a server.** No iOS SDK. Termux is Android CLI only. [Goose AI](https://apps.apple.com/app/goose-ai/id6752889295) is the closest shipped “thin phone client → user’s host” cousin — pairing is fragile / Desktop tunnel removed.

MIT lets us **fork and host**. It does not let us ship Hermes’s **self-evolving skills + terminal/process/browser** inside the App Store ([Review 2.5.2](https://developer.apple.com/app-store/review/guidelines/)).

**WhatsApp via Hermes:** `hermes whatsapp` (Baileys / Linked Devices) is the unofficial Web-style bridge §5 forbids. Only `whatsapp-cloud` matches the Cloud API wall — still not a personal inbox.

---

## 3. Shared memory and agents calling agents

Cowork memory is an **HTTP store keyed by user/team**, called from **our backend**. MCP is an **agent/IDE protocol**, not a phone SDK. Files (`MEMORY.md`) are single-writer local state.

| Tool | License | Role |
|---|---|---|
| [Mem0](https://docs.mem0.ai/introduction) | Apache 2.0 | REST memory API, SaaS or Docker |
| [Honcho](https://honcho.dev/) ([plastic-labs/honcho](https://github.com/plastic-labs/honcho)) | Server **AGPL-3.0**; do not vendor | Multi-peer memory; Hermes already plugs in. Prefer Honcho Cloud |
| [Zep Cloud](https://help.getzep.com/) / [Graphiti](https://help.getzep.com/graphiti/getting-started/welcome) | Cloud / Apache 2.0 | Graph memory. Zep **Community Edition is discontinued** |
| [Letta](https://docs.letta.com/agent-sdk/memory/) | Apache 2.0 | Agent runtime with **memory blocks + archival memory**, not a generic notes API |
| Hermes built-in files | MIT | Local only; do not share one home |

**MCP** = tools (Sheets, our task API). **[A2A](https://a2a-protocol.org/latest/)** = separate agent *services*. **OpenAI Agents SDK** = in-process handoffs. **Hermes `message_agent`** = Hermes-proprietary, not A2A.

Google’s own guide: use local sub-agents first; A2A when the other agent is a **different service**. [ADK A2A](https://google.github.io/adk-docs/a2a/intro/)

For 2–10 people: **one backend, in-process specialists, MCP for tools.** Do not start with a VM-per-user A2A mesh.

---

## 4. MCP / Claude Code / Codex — no partnership required

Ship a **task API the mobile app already needs**, then a thin **remote MCP** on streamable HTTP (`https://…/mcp`).

**Auth (one story):** laptop demo may use a **short-lived, revocable, scoped** personal token. Anything with **2–10 people + write** ships **OAuth 2.1** (discovery, audience, `tasks:read` / `tasks:write`). Do not leave a static Bearer in a committed config as the product.

Users add it themselves (Claude Code form; other clients differ):

```text
claude mcp add --transport http taskkorb https://…/mcp
```

Same pattern for [Cursor MCP](https://cursor.com/docs/mcp) and [Codex MCP](https://developers.openai.com/codex/mcp). Directory listing is optional review, not a deal. [Claude Code MCP](https://code.claude.com/docs/en/mcp)

```text
Phone  ──REST──►  our API + task store
Claude Code / Cursor / Codex  ──MCP + OAuth 2.1──►  same store
```

ChatGPT **Apps SDK** is a widget *inside ChatGPT*, not this MCP hop. Do not draw “ChatGPT App” on the MCP line.

stdio MCP on a laptop is a personal hack, not a multi-device product.

---

## 5. WhatsApp vs Telegram

**WhatsApp Cloud API** is a dedicated **business inbox**. Consumer WhatsApp cannot be registered. Incoming webhooks are usually “user → *your* business number.” [Groups API](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups) exists for **OBA** businesses, **max 8** people — too small for the 2–10 cowork ask. Unauthorized WhatsApp-Web / Baileys bridges are prohibited. [About the platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform)

After 24h without a user message, only **approved templates** (and those are billed). [Send messages](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages)

**Telegram Bot API** is free; the **bot** needs no phone (creating one via @BotFather still needs a Telegram account). Groups work **if** Privacy Mode is off or the bot is admin — default Privacy Mode means the bot misses most group chat. Hermes already first-class. [Telegram bots](https://core.telegram.org/bots) · [Hermes Telegram](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram)

**Simplest cowork chat: Telegram first. WhatsApp later as a shared business number, not “our WhatsApp group.”**

Teammates reading/writing **each other’s tasks** is **our task store + auth**, not WhatsApp history.

---

## 6. My Budget

### Email

- **v1:** unique inbound address + Gmail **filter/forward**. Official, no Restricted scope. [Forward Gmail](https://support.google.com/mail/answer/10957)
- **Not v1:** `gmail.readonly` OAuth. Restricted + verification + often [CASA](https://appdefensealliance.dev/casa). Budget is not an *explicit* approved use; treat as high-friction, not a proven ban. [Workspace policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy)

Parse → **draft** → user confirms. If unsure: *“I am unable to tell whose sale this was.”*

Inbound mail is a **public write endpoint**. Use a high-entropy, per-user, rotatable address; drop non-receipt mail (including OTPs — §10); do not treat forwarded SPF/DKIM as proof the bank sent it. Confirm-drafts stops silent ledger writes; it does not stop a convincing forge.

### SMS

- **iOS:** never claim auto-read.
- **Android:** exception exists for money-management; approval is discretionary; listing must make budget **core**. Do not attach SMS to a cowork/voice app and hope Play agrees.

### Sheets

Use [Google Picker + `drive.file`](https://developers.google.com/workspace/sheets/api/scopes) (non-sensitive, one file). Do not request full Drive (`drive` is Restricted).

---

## 7. iOS floating dock, shortcuts, wake word

### Overlay

iOS has **no** third-party “draw over other apps.” PiP is **video**. Live Activities / Dynamic Island are glanceable, system-placed, tap-opens-**your**-app. Keyboard UI cannot draw above the keyboard. [Creating a custom keyboard](https://developer.apple.com/documentation/uikit/creating-a-custom-keyboard)

### “Drop into last 5 chats”

Impossible without those apps exporting history. **None of them publish that.**

Honest handoff:

1. **Share sheet** / Copy — always works.
2. **User Shortcut** via official `shortcuts://run-shortcut?name=…&input=text&text=…`. [Apple](https://support.apple.com/guide/shortcuts/run-a-shortcut-from-a-url-apd624386f42/ios)
3. **Claude official:** Share / Ask Claude intent. `claude://code/new?q=` and `https://claude.ai/code/new?q=` need **Claude Code on that account** — they fail for plain Claude Pro. Prefer the `https://` universal link when you use this path. [Claude mobile links](https://support.claude.com/en/articles/14898120-open-the-claude-mobile-app-with-a-link) · [Claude iOS intents](https://support.claude.com/en/articles/10263469)
4. **ChatGPT / Gemini:** no official prefill URL. Community Shortcuts exist; do not treat `?q=` or `googlegemini://` as a contract.
5. **Codex on phone** lives **inside ChatGPT** after QR-pair to a host. `codex://` is **desktop**. [Work with Codex from anywhere](https://openai.com/index/work-with-codex-from-anywhere/)
6. **Antigravity** is Google’s **desktop agent IDE** (2025–26), not Gemini iOS widgets. Mobile = **browser Remote Control** of a desktop. [Antigravity](https://antigravity.google/) · [Remote Control](https://antigravity.google/docs/remote-control/)
7. **Custom keyboard** can `insertText` into the **focused** composer after the user switches keyboards. Must not launch other apps ([Review 4.4.1](https://developer.apple.com/app-store/review/guidelines/)). Network / shared container needs **Full Access**; the keyboard must still work if the user declines. Memory budget is tighter than the host app.

### Transcribe

| Path | On-device? | Notes |
|---|---|---|
| [SpeechAnalyzer / SpeechTranscriber](https://developer.apple.com/documentation/speech/speechanalyzer) | Yes — [Apple: transcriber modules do not send voice audio to Apple](https://developer.apple.com/documentation/speech/asking-permission-to-use-speech-recognition) | iOS 26+ (live-capture helper in the current sample is iOS 27) |
| [SFSpeechRecognizer](https://developer.apple.com/documentation/speech/sfspeechrecognizer) + `requiresOnDeviceRecognition` | Only if flagged **and** `supportsOnDeviceRecognition` | Default / server path **may** send audio to Apple and is the ~1 minute / rate-limited path. On-device flag is not that cap |
| [WhisperKit](https://github.com/argmaxinc/WhisperKit) (MIT) | Yes | iOS 16+ |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) (MIT) | Yes | Official iOS samples |

**v1:** user taps Talk → on-device STT → we send **text** (not audio) to our backend. Orange mic indicator. Do not start the mic at launch.

**Wake word:** honest v1 is **Hey Siri → our App Shortcut**, or a user-made [Vocal Shortcut](https://support.apple.com/guide/iphone/iph7f242ea2c/ios). A custom always-on “Listen me” with the screen off fails Review **2.5.4** (intended purpose / battery), not because 2.5.14 bans wake words.

Auto-assign tasks from a transcript is **our NLP**, not an Apple entitlement.

---

## 8. Smallest stacks (pick one first product)

These are **different products**. Building all of them at once is how this dies.

### A. Keep shipping the existing web orb (already in repo)

PWA. Tap Talk. Typed text → `speechSynthesis` (prefer `localService`). Green-team already has **BYO Gemini** *and* a **hosted Live token mint** when the server holds `GEMINI_API_KEY`. Hindi chrome already on `cursor/green-team-voice-79c8`.

**This is the only slice that already has code.**

### B. iOS personal assistant (new Xcode app)

SwiftUI + SwiftData, **local-only**. Talk button + Share/Copy. Optional CloudKit later. Hermes, if any, on a Mac/VPS you already own via [API server](https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server) or Telegram.

Do **not** WKWebView-wrap the Vite orb as the App Store client ([Review 4.2](https://developer.apple.com/app-store/review/guidelines/) “repackaged website”).

### C. Cowork for 2–10 people (new backend)

User accounts + task store + REST. Later: remote MCP. Later: Telegram bot. Later: Mem0/Honcho. WhatsApp and Gmail OAuth last.

Supabase/Firebase are optional when you need non-Apple accounts. They are not required for B.

---

## Recommended first slice (this agent’s answer)

**This is the decision gate. §15 is the expansion order after you pick.** Until you override the defaults below, treat Q1 = **A**. **Do not start C or a Swift rewrite** unless you change Q1.

### Grill Q1–Q7 (answer these — or keep the defaults)

Defaults are this agent’s pick after the 18-model review. Override any row.

| # | Question | Default until you say otherwise |
|---|---|---|
| 1 | First product: A orb / B iOS / C team cowork? | **A** — web orb. Only slice with code. |
| 2 | Model money: BYO / we bill / user proxy? (Plus-login is out.) | **BYO** local/demo + existing hosted Live mint if the server holds `GEMINI_API_KEY`. Do not bill strangers yet. |
| 3 | First slice: typed TTS / Talk+Share / task API? | **Typed TTS** on the existing orb (`speechSynthesis`, prefer `localService === true`). |
| 4 | Hermes: none / user-hosted / Nous Cloud / we host strangers? | **None** in v1. Next allowed: user-hosted or [Nous Cloud](https://portal.nousresearch.com/cloud). Never “we host strangers in one Docker.” |
| 5 | Budget: skip / household ledger + forward? | **Skip.** If later yes: forward + confirm drafts. No `gmail.readonly`, no CASA start. |
| 6 | Team chat: none / Telegram / WhatsApp Cloud later? | **None.** Next allowed: Telegram. WhatsApp Cloud is later and still a business number (Groups API **max 8**). |
| 7 | Key custody: Keychain / our Worker / user’s Worker? | **Keychain or the existing ephemeral mint.** A Worker that holds the user’s production key means **we can see it**. |

You can still answer in chat: `Q1=A Q2=BYO Q3=TTS Q4=none Q5=skip Q6=none Q7=keychain` — or change any letter.

**Owner lock (27 Aug 2026):** the owner said **“do all.”** That means accept every Q1–Q7 default above. First shipped slice is **typed TTS** on the existing green-team web orb (`speechSynthesis`, prefer `localService === true`). Product work lives on `cursor/typed-tts-79c8` (branched from `cursor/green-team-voice-79c8`). **Still do not start C**, iOS Swift, Hermes host, budget, Telegram, or WhatsApp. Blocked wishes stay blocked (Plus-login, iOS overlay, last-5-chats, iOS SMS inbox, WhatsApp personal/Baileys, Hermes-in-IPA, Gmail OAuth/CASA).

### After Q1

1. If Q1 = **A** (“typed note bolke sunao”) → Web Speech Synthesis on the existing orb. Do **not** start C.
2. If Q1 = **B** (“iPhone pe meri voice, Share to Claude”) → SwiftUI Talk+Share, no overlay, no custom always-on wake word, no last-5-chats.
3. If Q1 = **C** (“team tasks + Claude Code EOD”) → **then** the §15 API + OpenAPI + MCP path, Telegram not WhatsApp.

Hermes-per-user, SMS budget, ChatGPT Plus-inside-app, floating dock over other apps: **document as blocked or later**, do not prototype as if they were APIs.

---

## 9. Market: what peers actually ship

No official notes + tasks + voice + launcher + “terminal on phone” stack reads SMS, scrapes other apps’ chats, or draws an overlay. Taskkorb must not copy those three.

Closest honest cousins:

| Job | Who already does it | How they reach other apps |
|---|---|---|
| Voice → text anywhere you type | [Wispr Flow](https://wisprflow.ai/) (store title: AI Voice Keyboard) | **Keyboard**, not overlay |
| Launcher + AI + share | [Raycast iOS](https://www.raycast.com/ios) | Keyboard + Activity sheet + Shortcuts |
| Voice → tasks | [TickTick](https://ticktick.com/) Voice Capture | **In-app** |
| Shared tasks | [Todoist](https://www.todoist.com/), [Notion](https://www.notion.com/) | Own accounts |
| SSH on phone | [Termius](https://termius.com/), [Prompt 3](https://panic.com/prompt/) | Own terminal. [Warp](https://www.warp.dev/download) is **desktop only** |
| Coworking voice orb | **None found** | — |

Apple Reminders can ping you when you next message a named contact. That is Apple’s hook, not an SMS inbox. [Use Reminders](https://support.apple.com/en-us/102484)

---

## 10. OTP vs budget SMS (do not mix)

**OTP AutoFill ≠ reading bank SMS.**

- **iOS:** mark a field `oneTimeCode`. The **system** suggests a code from Messages. The app only gets the field value after the user accepts. No inbox API. [One-time codes](https://developer.apple.com/documentation/security/one-time-codes)
- **Android:** [SMS Retriever](https://developers.google.com/identity/sms-retriever/overview) delivers **one SMS you sent** that contains **your** app hash. [User Consent](https://developers.google.com/identity/sms-retriever/user-consent/overview) is one tap on one OTP-shaped SMS. Play’s official OTP path is these APIs, **not** `READ_SMS`.
- **Gmail:** do not scrape OTPs with `gmail.readonly`.

Safe OTP = we send the SMS, OS fills it, we verify on a server, we do not log the code.

---

## 11. Family budget vs team daily report (two products)

**Family budget v1:** shared household ledger, invite by email, cloud sync of **our** plan, manual entry + optional Gmail **forward**. Confirm drafts. Do not guess. This is [YNAB Together](https://support.ynab.com/en_us/ynab-together-B1nS78Cki) / [Spendee Shared Wallets](https://help.spendee.com/article/224-shared-wallets) minus bank OAuth and minus mailbox OAuth. [Family Link](https://families.google/familylink/) is **not** a budget app.

None of those official pages claim “connect Gmail and scrape receipts.”

**Team daily report v1:** shared task list + one EOD note per person + a compiled feed. That is [Geekbot](https://geekbot.com/) / [DailyBot](https://www.dailybot.com/) **check-in**, not SAP/Odoo ERP. If we do not ship GL, stock, and payroll, we are not shipping ERP.

---

## 12. Xiaomi “SS bol” → iOS

There is **no public Xiaomi API** that lets a third-party app hook Super XiaoAI’s wake word. [小爱开放平台](https://developers.xiaoai.mi.com/voiceservice/index) is for putting XiaoAI **inside hardware**, email-gated.

If the orb feels stronger on MI phones, the documented reason is Android [SYSTEM_ALERT_WINDOW](https://developer.android.com/reference/android/Manifest.permission#SYSTEM_ALERT_WINDOW) plus HyperOS toggles that default **off** ([后台弹出](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1625), [自启动](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1624)) — not a XiaoAI partnership.

**Port to iOS means: lose overlay, lose SMS, lose always-on wake word. Keep tap-to-talk and Share.**

---

## 13. BYO keys, OpenAPI, Cloudflare, guardrails

OpenAI and Gemini official docs: **do not put production API keys in mobile/web clients**; use a backend proxy. [OpenAI key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety) · [Gemini keys](https://ai.google.dev/gemini-api/docs/api-key)

| Mode | Auto-config | Multi-device | We see the key? |
|---|---|---|---|
| **A. Keychain / Keystore, phone → vendor** | Paste once per device | Paste again | No (still extractable from a **web** tab; use native Keychain or ephemeral mint) |
| **B. Worker / D1 stores the key** | Yes | Yes | **Yes** (Worker decrypts). This is the hosted mint already on green-team |
| **C. User’s own Worker URL** | They deploy | Yes | We never hold it |

Do not claim “encrypted in KV so we never see it” while our Worker holds the unwrap key.

[OpenAPI](https://www.openapis.org/what-is-openapi) is the contract for **our** task API (`tasks:read` / `tasks:write`). Provider `sk-` keys are a different hop.

Cloudflare [Workers](https://developers.cloudflare.com/workers/) / [D1](https://developers.cloudflare.com/d1/) / [KV](https://developers.cloudflare.com/kv/) / named [Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) are real. [trycloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/) is **test-only** (no SLA, 200 in-flight, no SSE). This environment does **not** have dashboard access to “their” Cloudflare account.

---

## 14. What this repo already has (do not rebuild)

`main` is the raw AI Studio “Copy of Audio Orb.”

All voice-product work is on **`cursor/green-team-voice-79c8`**: Talk UI, BYO Gemini, hosted Live token mint, transcripts, session machine, mobile runtime, **80 tests** in 24 files (as of `1943883`).

`visual-3d.ts` **already exists on `main`** (`IcosahedronGeometry(1, 10)` + UnrealBloomPass). Green-team lowered the orb to `(1, 6)` and dropped bloom; session-phase colors and dual analysers are the productized skin.

**Does not exist anywhere in the repo:** tasks DB, user accounts, MCP, iOS/Android native, WhatsApp, Hermes host, budget, team sync. Root **`LICENSE` is Apache-2.0** (Gosotek, 2026) plus **`NOTICE`**. Visual files already carry SPDX Apache-2.0. Do not copy AGPL servers or unlicensed parents into the tree.

Reuse green-team audio/session/transcript. **Slice A TTS is not net-new.** Accounts, MCP, iOS, Hermes host, and budget in sections 1–13 **are**.

---

## 15. Product-owner memo (this ask)

Written as an owner pass over the third follow-up: “use everything, market-scan, full-fledge SS, iOS, Hermes, family budget, OTP, BYO keys, daily reporting / ERP.”

### What I could actually use from this VM

| Surface | Used? |
|---|---|
| Official docs + store marketing pages (Firecrawl) | Yes |
| Taskkorb code on `cursor/green-team-voice-79c8` | Yes — read, not rewritten here |
| App Store / Play apps as a phone user (Wispr, Todoist, Termius, Gemini) | **No.** This VM has no iPhone, no Play account, no Xiaomi |
| “Aapka Cloudflare” dashboard / named Tunnel / Workers | **No.** This run’s environment has no `environment.json` and no Cloudflare credentials. Earlier Taskkorb tests used **trycloudflare** (ephemeral, no SLA) |
| OpenAPI spec in-repo | **None exists yet** |
| Hermes running behind each account | **Not deployed** |

Do not treat this memo as “I installed Todoist and lived in it.” It is docs + code evidence.

### Three products, not one ERP

If we ship everything in one app, Play/App Review, Gmail CASA, WhatsApp OBA, and Hermes ops all hit at once. Cut into:

| # | Product | Who | Sync | UI |
|---|---|---|---|---|
| **1. Voice companion** | Today’s orb | 1 person | Local transcript | Talk + More (already on green-team) |
| **2. Personal + family ledger** | Budget | Household | Our cloud + invite | Manual / forward / confirm |
| **3. Team EOD** | Shared tasks + daily note | 2–10 | Our REST + ACL | Today list + “submit EOD” |

**ERP** (GL, HR, stock, payroll) is [SAP](https://www.sap.com/products/erp.html)-class. We are not there. Daily reporting = [Geekbot](https://geekbot.com/)-class check-in.

### Market UI we can copy honestly

- Notes/tasks: list + today + share-in ([Todoist](https://www.todoist.com/), [TickTick](https://ticktick.com/), Apple Reminders)
- Voice: **in-app Talk** or **keyboard** ([Wispr](https://wisprflow.ai/), [Raycast iOS](https://www.raycast.com/ios)) — not a floating orb over ChatGPT
- Terminal-on-phone: [Termius](https://termius.com/) is SSH to a **host the user owns**, not “Hermes inside the phone”
- Other apps “andar dikhein”: **Share destinations + our own task rows**, not embedded Claude/ChatGPT UI (sandbox)

### Full-fledge “SS bol” (MI → iOS)

1. Confirm the Android build actually uses overlay (`SYSTEM_ALERT_WINDOW`). That is why it feels stronger on HyperOS — extra toggles, not XiaoAI partnership ([XiaoAI platform](https://developers.xiaoai.mi.com/voiceservice/index)).
2. **Do not port the overlay.** iOS v1 = open Taskkorb → tap Talk → Share.
3. Wake word = Hey Siri + App Shortcut only.
4. Hermes stays on a server; phone is client.

### Permission layers (keep this)

| Layer | Local | Needs account / server |
|---|---|---|
| Mic + on-device STT | Yes | No |
| Notes / tasks on one phone | SwiftData | No |
| Family / team sync | — | Login + our API |
| Gmail | Forward to us | Not `gmail.readonly` in v1 |
| OTP | AutoFill / Retriever for **our** login SMS | We issue+verify; never log |
| Provider keys | Keychain, phone→vendor | Or Worker (we **can see** the key) |
| Claude Code / Codex / Gemini agents | — | MCP on **our** task API, not their chat apps |

### What we already reuse

From **green-team**: Talk UI, BYO Gemini, transcript store, session machine, mobile mic policy. Tagline is still “Speak, and the orb answers.”

**Net-new for this memo:** accounts, task DB, OpenAPI, MCP, Telegram, family ledger, EOD feed, iOS SwiftUI, Hermes host. None of that is in `main`.

### Recommended ship order (owner)

This is **expansion after Q1**, not a second first-slice. If Q1 = A, stop after step 1 until you explicitly pick C.

1. Keep the orb honest (TTS for typed text if they still want that) — only if Q1 = A or you are already shipping the orb.
2. **Only if Q1 = C:** Task API + login + OpenAPI on **D1** (we already mint Live tokens on a Worker-shaped `/api/live-session`). Postgres only if we **leave** Workers — do not run both as the product store. This unblocks MCP, Telegram, EOD.
3. **Only if Q1 = B:** iOS SwiftUI Talk+Share. Do not also start a PWA rewrite.
4. Family ledger and Hermes only after the store in step 2 exists, and only if Q4 / Q5 say yes. Hermes = user-hosted or separate container per trust domain — not “one Docker, many strangers.”

---

## 16. Open-source inspiration (18-agent pass)

**Copy the pattern. Do not vendor AGPL. Do not invent a ball Hermes does not ship.**

This section does not change the hard walls in sections 1–15. It answers: Hermes kaise hai, ball kaise banate hain, memory/MCP/Telegram/budget OSS se kya chori karna safe hai.

Sibling FACT notes (other branches, not merged here): Three.js orbs, Pipecat/LiveKit, Mem0/OpenMemory, Goose, Actual/Firefly, Continue/Cline/Aider, A2A, Telegram bots, WhisperKit.

### 16.1 Hermes — what it actually is

**Source:** [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) — GitHub SPDX **MIT**, ~236k stars this run, tagline “The agent that grows with you.” Docs: [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/). NVIDIA + [NemoClaw](https://developer.nvidia.com/blog/deploy-self-evolving-agents-for-faster-more-secure-research-with-a-hermes-agent-and-nvidia-nemoclaw/).

| Pattern | How Hermes does it | What Taskkorb should do |
|---|---|---|
| One runtime, many users | Docker/CLI + **profiles** (`HERMES_HOME`, `~/.hermes/profiles/<id>/`). Official: one container *can* host all profiles. Profiles **do not sandbox**. Two writers on one home entangle state. [Profiles](https://hermes-agent.nousresearch.com/docs/user-guide/profiles) · [Docker](https://hermes-agent.nousresearch.com/docs/user-guide/docker) | **One trust domain per process.** One family on a host they own, or separate containers/volumes/credentials. Not “one Docker for all Taskkorb users” |
| Self-evolving | Skills + `MEMORY.md` / `USER.md` / `SOUL.md` / `AGENTS.md`. Prompt says learn permanently; cron can propose skill changes | Copy the **files + human review loop**. Do **not** let the model rewrite spend rules or the system prompt unsigned |
| Memory other agents can call | Gateway + `message_agent` + OpenAI-compat **`:8642/v1`** + optional MCP / Honcho | Host Hermes; Taskkorb talks HTTP/MCP. Budget/task specialists stay **in-process functions** first |
| Voice / “ball” | Desktop: chat + **mic level bars**, optional “Hey Hermes”. **No 3D orb** in the official UI | Keep Taskkorb’s Three.js orb. Hermes is the **brain**, not the ball |
| Mobile | Telegram / HTTP client / Termux. **No App Store Hermes SDK** | Never ship Hermes skills+shell **inside** the iOS IPA. Phone = Talk + API. Goose AI is a thin remote client, not a template to embed Goose |

**Must still have (cannot skip) unless they buy [Hermes Cloud](https://portal.nousresearch.com/cloud):** the Hermes **process**, an **LLM bill** (OpenRouter / Nous Portal / local), and **disk** for `~/.hermes`. Cloud is Nous’s hosted instance — not Taskkorb minting tenants, not `hermes.ai` as a plug-in.

**Do not copy blindly:** default `terminal` + `process` + `website` + `browser` + `cron` + `messaging` + `spawn` is a **personal computer agent**. Lock those tools for a family-budget product.

**NemoClaw (if we ever host Hermes for strangers):** copy no-secrets-in-the-agent-container, **deny-by-default egress**, snapshot **without** tokens. Do **not** treat Docker as enough isolation. v1 safer path: **user-hosted** Hermes (their laptop/VPS).

### 16.2 The ball — who actually has one

Taskkorb already **is** the ball. `visual-3d.ts` on **`main`**: `IcosahedronGeometry(1, 10)` + UnrealBloomPass. On **`cursor/green-team-voice-79c8`**: orb is `(1, 6)`, bloom **removed**, FFT **32**, dual analysers (mic + model), session-phase colors. Visual files SPDX Apache-2.0; root `LICENSE` is now Apache-2.0.

Hermes does **not** ship a ball. Pipecat and LiveKit Agents official docs **do not name an orb**.

| Project | License | What it is | Copy |
|---|---|---|---|
| **This repo** (`visual-3d.ts`) | Apache-2.0 file headers | Green-team: icosahedron `(1, 6)`, sine displacement, **no bloom**. `main` still has bloom + `(1, 10)` | **Keep green-team. This is the product ball.** |
| [desertcache/velvet](https://github.com/desertcache/velvet) | MIT (1★ — tiny) | Electron STT + Three.js “SoulOrb”. `fftSize` 512 → **mean of all bins** + noise gate. States `IDLE\|LISTENING\|PROCESSING\|SPEAKING` lerp colors/morph | Gate + **lerp visual states**. Voice-band weighting is **ours**, not velvet’s |
| [kuhung/audiovisualizer](https://github.com/kuhung/audiovisualizer) | Fork of unlicensed [WaelYasmina/audiovisualizer](https://github.com/WaelYasmina/audiovisualizer). Downstream MIT **cannot** relicense the parent | `IcosahedronGeometry(3, 30)` + bloom + Perlin × average frequency | **Ideas only.** Do not copy the tree |
| [dcyoung/r3f-audio-visualizer](https://github.com/dcyoung/r3f-audio-visualizer) | MIT | R3F `fluidBall`: `fftSize` 8192 → 1/12-octave bars → **polar radius**. Desktop-heavy | Spectrum-on-surface later; keep `fftSize` modest on phone |
| [nehasriva/phonon](https://github.com/nehasriva/phonon) | MIT | 800 Fibonacci particles, one bin per particle | Soft “thinking cloud” skin |
| [soniaboller/audible-visuals](https://github.com/soniaboller/audible-visuals) | Apache-2.0 | Radial **lines**, not a closed mesh. Old CanvasRenderer — do not copy the stack | Spike silhouette only |
| [pipecat-ai/pipecat](https://github.com/pipecat-ai/pipecat) + Voice UI Kit | BSD-2-Clause | Voice pipeline. Visual = **bars** / optional **circle**. Events: `UserStartedSpeaking`, `BotStartedSpeaking`, levels. [UIWorker](https://docs.pipecat.ai/pipecat/learn/ui-worker) is a **server LLM that drives this page** (click/type/scroll) — not an orb | Copy **events + levels** into our orb. Do not treat UIWorker as a visualizer |
| [livekit/agents](https://github.com/livekit/agents) | Apache-2.0 | `lk.agent.state` = `listening\|thinking\|speaking`. Closest official widgets: **Aura** and **Radial**. LiveKit **lists** OpenAI as a customer ([customers](https://livekit.io/customers)); OpenAI’s 2026 GPT-Live writeup may age that claim | Copy the **state+volume contract**. Leave Gemini Live unless we switch stacks |

**Looked at, do not copy:** [patrickheng/three-js-audio-experiment-v2](https://github.com/patrickheng/three-js-audio-experiment-v2) (CC BY-NC-SA 4.0); amunozdev/voiceorbs (React, not Three); mahdidavoodi7/expo-thinking-orbs (Skia).

**Honest line:** OSS gives **orbs** and **voice stacks**. Hermes gives **bars**. Glue is ours. Talk→UI is always **in-app**.

### 16.3 Memory OSS — pick by job

| Job | Project | License / catch | Use |
|---|---|---|---|
| Searchable user memory | [mem0ai/mem0](https://github.com/mem0ai/mem0) | Apache-2.0 OSS; Platform is paid. Official: **never put the key in the browser**. [API](https://docs.mem0.ai/api-reference) | After a backend exists: `add` then `search` with `user_id`. Platform `https://api.mem0.ai` **or** OSS Docker `:8888` (`cd server && make bootstrap`). Official voice pattern: [LiveKit + Mem0](https://docs.mem0.ai/integrations/livekit) |
| Local MCP memory | OpenMemory | **Sunset.** Docs 404; folder gone from `main`; last README says use OSS server. [Historical README](https://raw.githubusercontent.com/mem0ai/mem0/3e6ab394/openmemory/README.md) | **Do not build on it** |
| Hosted “memory API” without running their server | [Honcho](https://honcho.dev/) ([plastic-labs/honcho](https://github.com/plastic-labs/honcho)) | **Server AGPL-3.0**. Some SDKs Apache — check the package, not the monorepo `LICENSE` | Call **Honcho Cloud** if needed. Do **not** vendor the server |
| Agent with built-in memory | [letta-ai/letta](https://github.com/letta-ai/letta) | Apache-2.0 | Optional later. Not Todoist |
| Coding agent that already speaks MCP | [aaif-goose/goose](https://github.com/aaif-goose/goose) (`block/goose` redirects) | **Apache-2.0** in `LICENSE`. Marketing pages have said “MIT” — **trust the file**. AAIF / Linux Foundation (9 Dec 2025) | Be a **remote Streamable HTTP MCP** they attach (`goose://extension?url=…&type=streamable_http`). Do not embed Goose. Desktop QR tunnel is **removed**. Android “take over the phone” is an **experimental PoC**, not archived — still do not copy |
| Chat UI in front of Hermes | [open-webui/open-webui](https://github.com/open-webui/open-webui) | Branding-gated license after 0.6.6. Hermes docs: `OPENAI_BASE_URL=http://127.0.0.1:8642/v1` | Fine on **your** laptop. Mobile = PWA, not a native dock |

**A2A vs MCP (official):** MCP = agent-to-**tool**. [A2A](https://a2a-protocol.org/latest/) = independent services. A2A is **not** a sub-agent protocol. OpenAI Agents SDK **handoffs** stay in one process. For 2–10 people: **in-process specialists + MCP for tools**. No Agent Card mesh between household bots.

### 16.4 MCP — we are the server

Continue / Cline / Cursor / Claude Code / Codex / Goose are **clients**. Taskkorb ships **hosted Streamable HTTP**. Same auth as §4: short-lived scoped token for a private laptop demo; **OAuth 2.1** for team write. Aider has **no merged official MCP** as of Aug 2026 (open PRs exist — do not plan on them). stdio is a laptop hack.

Cline-style example only (`"type": "streamableHttp"`). Claude Code uses `--transport http` / `"type": "http"`. Goose uses `type=streamable_http`. Label the client before pasting.

```json
{
  "mcpServers": {
    "taskkorb": {
      "type": "streamableHttp",
      "url": "https://…/mcp",
      "headers": { "Authorization": "Bearer <short-lived-demo-token>" }
    }
  }
}
```

Real MIT/Apache **todo** MCP repos (pattern to copy, not to depend on as our store):

- [Doist/todoist-mcp](https://github.com/Doist/todoist-mcp) — official Todoist, remote HTTP
- [greirson/mcp-todoist](https://github.com/greirson/mcp-todoist) — MIT
- [hald/things-mcp](https://github.com/hald/things-mcp) — MIT, Things 3 (local Mac)
- [kazuph/mcp-taskmanager](https://github.com/kazuph/mcp-taskmanager) — MIT, file-backed
- [flesler/mcp-tasks](https://github.com/flesler/mcp-tasks) — MIT, git-friendly `.md`

Goose session **Todo** extension is an in-session checklist, **not** a team ACL product.

### 16.5 Telegram before WhatsApp (OSS)

Official Bot API: [core.telegram.org/bots](https://core.telegram.org/bots). Token from @BotFather. Privacy Mode **on** by default (bot misses most group chat). Telegram is **not** the task store.

| Repo | License | Pattern |
|---|---|---|
| [turag-ev/kanboard-telegram-bot](https://github.com/turag-ev/kanboard-telegram-bot) | MIT | Group ACL → shared Kanboard API. Closest “teammates R/W each other’s tasks” |
| [amarcu/vikunja-telegram-assistant](https://github.com/amarcu/vikunja-telegram-assistant) | MIT | Allowlist + one Vikunja token + Done/Undo buttons |
| [maddevsio/mad-telegram-standup-bot](https://github.com/maddevsio/mad-telegram-standup-bot) | MIT | Group standup + **own** MySQL |
| [ihoru/todoist_bot](https://github.com/ihoru/todoist_bot) | MIT | Per-user Todoist OAuth — **not** a shared board |
| [5hay/tg2notion](https://github.com/5hay/tg2notion) | MIT | Write-only; unofficial Notion cookie — do not copy that auth |

**Ship:** BotFather → webhook (`secret_token` + `X-Telegram-Bot-Api-Secret-Token`) → commands + inline Done → **our** task API. Map `chat.id` / `from.id` only after an **expiring link** to a Taskkorb user; still check ACLs. For ambient group text, disable Privacy Mode or require `/commands`. Hermes already speaks Telegram as an **agent gateway**, not a tracker.

### 16.6 Budget OSS — contracts, not AGPL servers

| App | License | Official email/SMS | Household share |
|---|---|---|---|
| [actualbudget/actual](https://github.com/actualbudget/actual) | **MIT** | Neither. File import + optional bank sync | Local-first file; multi-device sync with **conflict risk** on concurrent edits ([sync](https://actualbudget.org/docs/getting-started/sync/)) |
| [firefly-iii/firefly-iii](https://github.com/firefly-iii/firefly-iii) | **AGPL-3.0** | Outbound SMTP only. Community “send an SMS” ≠ inbox read. Author **refuses official AI categories** (hallucinate) | Isolated administrations; couples = **shared password** until sharing ships |
| GnuCash / Sure / Ghostfolio | GPL / AGPL | No official iOS SMS | Wrong job or AGPL |

**Copy:** Actual envelope fields (account, payee, amount, date, category, transfer, reconciled); Firefly’s “don’t guess”; invite-by-email **own logins** (YNAB Together shape); user Share/Shortcut/forward. **Do not vendor Firefly PHP.** No official OSS app reads the iOS Messages inbox.

### 16.7 Notes / cowork OSS (if the product is a workspace)

- [AppFlowy-IO/AppFlowy](https://github.com/AppFlowy-IO/AppFlowy) — **AGPL-3.0** (client and Cloud repos). Self-host cloud has a **separate commercial** license, **not** Elastic License 2.0. Inspiration for the **surface**, or self-host. Do not relicense.
- [toeverything/AFFiNE](https://github.com/toeverything/AFFiNE) — MIT editor + **AFFiNE Enterprise Edition** on `packages/backend` (not Elastic License). Cloud ~10-seat. Closer to small-team notes than Logseq.
- [outline/outline](https://github.com/outline/outline) — BSL. Docs API if the team is **wiki**, not tasks.
- Logseq **file Sync** is single-user ([2023 setup](https://blog.logseq.com/how-to-setup-and-use-logseq-sync/)). Logseq **DB / RTC** is paid/alpha multi-person — still not a tasks product.

### 16.8 iOS speech v1

[argmaxinc/WhisperKit](https://github.com/argmaxinc/WhisperKit) → [argmaxinc/argmax-oss-swift](https://github.com/argmaxinc/argmax-oss-swift) — **MIT**, SPM, iOS **16** package / WhisperAX **17**. On-device. First Talk+Share slice.

[whisper.cpp](https://github.com/ggml-org/whisper.cpp) — MIT, official iOS samples, but XCFramework + C, not one-step Swift.

Apple [SpeechAnalyzer](https://developer.apple.com/documentation/speech/speechanalyzer) — iOS **26+** (live helper sample iOS 27). Official: transcriber modules **do not** send voice to Apple. Use later as optional path, not the floor.

Default [SFSpeechRecognizer](https://developer.apple.com/documentation/speech/sfspeechrecognizer) **may** send audio to Apple unless `requiresOnDeviceRecognition` is set **and** available.

### 16.9 Requests with no honest OSS path (blocked — see Hard facts)

These are **not** a backlog: floating iOS dock over Claude/ChatGPT, last-5-chats from other apps, ChatGPT Plus as an API key, WhatsApp personal inbox / Baileys, Hermes-inside-App-Store, Xiaomi “SS bol” as a public wake-word SDK.

### 16.10 Steal-list (Q1–Q7 accepted — “do all”)

Owner accepted the defaults. **Only item 2 is in flight** (typed TTS). Do not start items 3–8 (iOS, tasks/MCP, Telegram, memory, Hermes, budget) and do not start C.

1. **Orb:** keep green-team `visual-3d.ts` (`(1, 6)`, no bloom); steal velvet **state lerp + noise gate** if we want a second skin.
2. **Typed → voice:** `speechSynthesis` on the web orb; prefer `localService === true` (no new OSS).
3. **iOS v1:** WhisperKit + share sheet (only if Q1 = B).
4. **Tasks API + MCP (only if Q1 = C):** **D1** on Workers + Streamable HTTP + OAuth 2.1, shaped like `mcp-tasks` / [Todoist MCP](https://github.com/Doist/todoist-mcp) / [Cline remote HTTP](https://docs.cline.bot/mcp/mcp-overview). Postgres only if we leave Workers.
5. **Telegram (only if Q6 = Telegram):** Bot API + our store + webhook secret (Kanboard/Vikunja as reference).
6. **Memory (optional):** Mem0 Platform or OSS REST; or Honcho **Cloud**. Not OpenMemory.
7. **Hermes (only if Q4 = user-hosted or Nous Cloud):** gateway only, tools locked, **one trust domain**. See §2 / §16.1 — not “one Docker, many strangers.”
8. **Budget (only if Q5 = yes):** Actual-like ledger in **our** DB; Firefly only as optional user backend. Do **not** start Google Restricted-scope / CASA until a lawyer + Q5 = yes + a company that can pass verification.

---

## 17. Consider list — now locked (26 Aug 2026 “Go”)

These were leftover 18-model “consider” items. They are **hard recommendations** until you override them in chat.

| Item | Lock |
|---|---|
| Repo license | **Apache-2.0** (`LICENSE` + `NOTICE`). Matches visual SPDX. Commercial-friendly; do not relicense to AGPL. |
| Store if Q1 = C | **D1**. Not D1 *and* Postgres. |
| Gmail OAuth / CASA | **Do not start.** v1 budget (if Q5 later) = forward + confirm. Restricted `gmail.readonly` is uncertain + high friction. |
| Hermes isolation | One container = one trust domain. Profiles ≠ sandbox. |
| Hermes Cloud | Nous hosts it. We may *link* a user there. We do not mint tenants. |
| Hermes in IPA | **No.** Desktop/CLI/Docker/Termux only. |
| OpenMemory | **Sunset.** Mem0 REST or Honcho Cloud. |
| Firefly III | Do not vendor the AGPL server. |
| `kuhung/audiovisualizer` | Ideas only. Unlicensed parent. |
| Velvet “voice-band” | Do not copy as ours. Steal lerp + gate only. |
| Auth split | Demo: short-lived scoped token. Team write: OAuth 2.1. `/me` ≠ `/mcp` tools. |
| WhatsApp | Cloud API business number only. Groups OBA **max 8**. No Baileys. |
| iOS wake | Vocal Shortcuts / Hey Siri → App Shortcut. No third-party always-on. |
| Plus / Pro / Advanced | **≠ API.** No login-with-Plus. |
| Claude Code / Codex CLI quota | **≠** a license for Taskkorb. |
| Default product | **Accepted (“do all”).** Q1 = **A**, Q3 = typed TTS. Do not code C or Swift. |

---

## Honesty / UNVERIFIED

- Firecrawl was often **keyless** / rate-limited. Some community pages (Reddit, unofficial URL schemes) are marked UNVERIFIED in the agent briefs and are **not** product contracts.
- `parallel-cli` is **installed** but **unauthenticated** (`PARALLEL_API_KEY` missing). Deep Research skill could not run. Do not claim a Parallel report exists.
- Live Gemini on a physical phone for the current orb is still **UNVERIFIED** from earlier work.
- No durable host or user-auth in this environment. This note does not invent one.
- CASA / Play exception **prices and approval odds** are not official numbers; do not quote blogs as Google policy.
- A domain literally `hermes.ai` as a plug-in SaaS was **not found**. Closest official products are Nous Hermes Agent and [Hermes Cloud](https://portal.nousresearch.com/cloud).
- The old Gemini “Advanced ≠ API” community thread (`support.google.com/gemini/thread/342070024`) now **404s**. Use [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing).
- 18-model review (26 Aug 2026) corrected: Hermes profiles ≠ sandbox; AppFlowy/AFFiNE licenses; green-team orb `(1, 6)` / no bloom; grill Q1–Q7 inlined; MCP OAuth vs Bearer; BYO vs production keys; kuhung ideas-only; test count 80.
- “Go” pass locked remaining consider items: Apache-2.0 `LICENSE` + `NOTICE`; D1 if Q1 = C; no Gmail CASA start; Q1–Q7 defaults (A / BYO / TTS / none / skip / none / Keychain-or-mint).
- Owner **“do all”** (27 Aug 2026) accepted those Q1–Q7 defaults. First slice = typed TTS on the green-team orb. Do not start C.

---

## Sources

**Models / billing**

- [What is ChatGPT Plus?](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus)
- [API usage is not the ChatGPT subscription](https://community.openai.com/t/api-chatgpt-subscription-cannot-use-api-with-chatgpt-subscription/875542)
- [OpenAI Terms](https://openai.com/policies/row-terms-of-use/)
- [Claude paid plan vs API](https://support.claude.com/en/articles/9876003)
- [Claude Pro plan](https://support.claude.com/en/articles/8325606-what-is-the-pro-plan)
- [Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing)
- [Introducing apps in ChatGPT](https://openai.com/index/introducing-apps-in-chatgpt/)
- [OpenRouter FAQ](https://openrouter.ai/docs/faq)
- [Nous Portal](https://hermes-agent.nousresearch.com/docs/integrations/nous-portal)

**Hermes / agents / MCP**

- [Hermes Agent docs](https://hermes-agent.nousresearch.com/docs/)
- [Hermes Cloud](https://portal.nousresearch.com/cloud)
- [Hermes GitHub](https://github.com/NousResearch/hermes-agent)
- [Hermes Bot Mode](https://hermes-agent.nousresearch.com/docs/user-guide/bot-mode)
- [Hermes API server](https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server)
- [Hermes memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory)
- [NVIDIA Hermes + NemoClaw](https://developer.nvidia.com/blog/deploy-self-evolving-agents-for-faster-more-secure-research-with-a-hermes-agent-and-nvidia-nemoclaw/)
- [MCP intro](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Codex MCP](https://developers.openai.com/codex/mcp)
- [Cursor MCP](https://cursor.com/docs/mcp)
- [A2A protocol](https://a2a-protocol.org/latest/)
- [Mem0](https://docs.mem0.ai/introduction)
- [Honcho](https://honcho.dev/)
- [plastic-labs/honcho](https://github.com/plastic-labs/honcho)

**Chat / budget / stores**

- [WhatsApp Cloud API](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform)
- [WhatsApp Groups API](https://developers.facebook.com/documentation/business-messaging/whatsapp/groups)
- [Telegram bots](https://core.telegram.org/bots)
- [Play SMS / Call Log](https://support.google.com/googleplay/android-developer/answer/10208820)
- [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)
- [Restricted scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)
- [Sheets scopes](https://developers.google.com/workspace/sheets/api/scopes)
- [Gmail forwarding](https://support.google.com/mail/answer/10957)
- [Apple SMS filtering](https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering)

**iOS**

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Runtime sandbox](https://support.apple.com/guide/security/security-of-runtime-process-sec15bfe098e/web)
- [Custom keyboard](https://developer.apple.com/documentation/uikit/creating-a-custom-keyboard)
- [Run a Shortcut from a URL](https://support.apple.com/guide/shortcuts/run-a-shortcut-from-a-url-apd624386f42/ios)
- [SpeechAnalyzer](https://developer.apple.com/documentation/speech/speechanalyzer)
- [Asking permission to use speech recognition](https://developer.apple.com/documentation/speech/asking-permission-to-use-speech-recognition)
- [SpeechSynthesisVoice.localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService)
- [Vocal Shortcuts](https://support.apple.com/guide/iphone/iph7f242ea2c/ios)
- [WhisperKit](https://github.com/argmaxinc/WhisperKit)
- [Claude mobile links](https://support.claude.com/en/articles/14898120-open-the-claude-mobile-app-with-a-link)
- [Work with Codex from anywhere](https://openai.com/index/work-with-codex-from-anywhere/)
- [Antigravity](https://antigravity.google/)
- [Gemini iOS get started](https://support.google.com/gemini/answer/14554984?hl=en&co=GENIE.Platform%3DiOS)
- [SwiftUI](https://developer.apple.com/swiftui/)
- [SwiftData](https://developer.apple.com/documentation/swiftdata)

**Market / OTP / family / Xiaomi / keys**

- [Wispr Flow](https://wisprflow.ai/)
- [Raycast iOS](https://www.raycast.com/ios)
- [Termius](https://termius.com/)
- [One-time codes (Apple)](https://developer.apple.com/documentation/security/one-time-codes)
- [SMS Retriever](https://developers.google.com/identity/sms-retriever/overview)
- [YNAB Together](https://support.ynab.com/en_us/ynab-together-B1nS78Cki)
- [Geekbot](https://geekbot.com/)
- [XiaoAI voice platform](https://developers.xiaoai.mi.com/voiceservice/index)
- [SYSTEM_ALERT_WINDOW](https://developer.android.com/reference/android/Manifest.permission#SYSTEM_ALERT_WINDOW)
- [OpenAI API key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [trycloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/)
- [What is OpenAPI?](https://www.openapis.org/what-is-openapi)

**OSS inspiration (section 16)**

- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- [Hermes profiles](https://hermes-agent.nousresearch.com/docs/user-guide/profiles)
- [Hermes Docker](https://hermes-agent.nousresearch.com/docs/user-guide/docker)
- [AppFlowy LICENSE](https://github.com/AppFlowy-IO/AppFlowy/blob/main/LICENSE)
- [AFFiNE root LICENSE](https://github.com/toeverything/AFFiNE/blob/canary/LICENSE)
- [Cline MCP overview](https://docs.cline.bot/mcp/mcp-overview)
- [Goose AI on the App Store](https://apps.apple.com/app/goose-ai/id6752889295)
- [desertcache/velvet](https://github.com/desertcache/velvet)
- [kuhung/audiovisualizer](https://github.com/kuhung/audiovisualizer)
- [dcyoung/r3f-audio-visualizer](https://github.com/dcyoung/r3f-audio-visualizer)
- [Pipecat UIWorker](https://docs.pipecat.ai/pipecat/learn/ui-worker)
- [LiveKit prebuilt visualizers](https://docs.livekit.io/frontends/agents-ui/audio-visualizer/prebuilt/)
- [LiveKit customers](https://livekit.io/customers)
- [Mem0 API overview](https://docs.mem0.ai/api-reference)
- [Mem0 OpenMemory sunset README](https://raw.githubusercontent.com/mem0ai/mem0/3e6ab394/openmemory/README.md)
- [aaif-goose/goose LICENSE](https://github.com/aaif-goose/goose/blob/main/LICENSE)
- [Goose mobile tunnel removed](https://github.com/aaif-goose/goose/blob/main/documentation/docs/experimental/remote-access/mobile-access.md)
- [A2A protocol](https://a2a-protocol.org/latest/)
- [Cline MCP](https://docs.cline.bot/mcp/mcp-overview)
- [Continue MCP](https://docs.continue.dev/customize/deep-dives/mcp)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [actualbudget/actual](https://github.com/actualbudget/actual)
- [Firefly III license](https://docs.firefly-iii.org/explanation/more-information/license/)
- [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [argmaxinc/argmax-oss-swift](https://github.com/argmaxinc/argmax-oss-swift)
- [Apple SpeechAnalyzer](https://developer.apple.com/documentation/speech/speechanalyzer)
