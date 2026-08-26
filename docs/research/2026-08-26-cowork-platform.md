# Taskkorb cowork / personal-assistant direction

Research only. **No product code in this change.** Written 26 Aug 2026 after the owner asked for notes + tasks coworking, BYO ChatGPT, Hermes-per-user, budget from mail/SMS, MCP / Claude Code / Codex, WhatsApp, and an iOS floating dock that can drop voice into Claude / ChatGPT / Gemini / Codex.

Thirteen research tracks ran in parallel (Firecrawl + official docs). The Parallel deep-research CLI was **not installed** in this environment; that gap is noted, not hidden.

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
| Use ChatGPT Plus / Claude Pro / Gemini Advanced **inside our app** | **No.** Consumer chat plans do **not** include API. Separate billed keys. | [What is ChatGPT Plus?](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus) · [Claude Pro vs API](https://support.claude.com/en/articles/9876003) · [Gemini Advanced ≠ API](https://support.google.com/gemini/thread/342070024) |
| Login-with-Plus / scrape ChatGPT cookies | **ToS + technically blocked** (credential sharing, other-origin cookies) | [OpenAI Terms](https://openai.com/policies/row-terms-of-use/) |
| iOS app reads SMS / bank texts | **No public inbox API** | [IdentityLookup filtering](https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering) |
| iOS Message Filter as a secret inbox | **Unknown senders only**; extension **cannot write** to the containing app | Same Apple page |
| Android SMS for a notes/tasks/voice app | Play lists **SMS-based money management** as a **review exception**, not a right. Core-functionality + declaration. Budget apps **must not** exfiltrate non-finance SMS. Bluecoins was **denied** in 2018–19. | [Play SMS policy](https://support.google.com/googleplay/android-developer/answer/10208820) · [Bluecoins](https://www.bluecoinsapp.com/google-policy-removing-sms-permissions/) |
| Floating dock over Claude / ChatGPT like AssistiveTouch | **Blocked on iOS.** No `SYSTEM_ALERT_WINDOW`. AssistiveTouch is system-only. | [Review 2.5.1 / 2.5.8 / 5.2.5](https://developer.apple.com/app-store/review/guidelines/) · [AssistiveTouch](https://support.apple.com/en-us/111794) |
| Read last 3–5 chats from Claude / ChatGPT / Gemini / Codex | **Blocked.** Sandbox. Those apps do not publish a list API. | [iOS sandbox](https://support.apple.com/guide/security/security-of-runtime-process-sec15bfe098e/web) |
| “Hey Listen” always-on wake word | **Blocked** for third-party iOS. Gemini on iPhone is still **tap Live**. | [Review 2.5.4 / 2.5.14](https://developer.apple.com/app-store/review/guidelines/) · [Gemini Live iOS](https://support.google.com/gemini/answer/15274899?hl=en&co=GENIE.Platform%3DiOS) |
| Embed Hermes Python in the App Store binary | **No.** Official Hermes is Desktop / CLI / Docker / Termux. Review 2.5.2 forbids downloading/executing new code. | [Hermes platforms](https://hermes-agent.nousresearch.com/docs/getting-started/platform-support) |
| WhatsApp reads personal chats / joins the team group as a bot | **No.** Cloud API is a **business number**, 1:1. Groups API is Official Business Account, max 8, gated. | [WhatsApp platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform) |
| Gmail “connect inbox, auto-import all receipts” in v1 | `gmail.readonly` is **Restricted**. Verification + often annual CASA if a server sees mail. Budget is **not** a listed Gmail use case. | [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes) |

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

| Model | What the user does | Honest? |
|---|---|---|
| **A. BYO key** (already Gemini) | Paste AI Studio / OpenAI / Claude Console / OpenRouter key | Yes |
| **B. We bill** | We hold keys, meter tokens, charge the user | Yes; we pay providers |
| **C. “Use your Plus”** | Login as ChatGPT | **No. Do not ship.** |

Aggregators ([OpenRouter](https://openrouter.ai/), [Nous Portal](https://hermes-agent.nousresearch.com/docs/integrations/nous-portal)) are **new** paid pipes. They do not attach Plus/Pro/Advanced.

**Speak typed text (your first small ask):** use the browser/device [SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) (free, on-device). Gemini Live and OpenAI TTS are **separate billed APIs**, not Plus.

---

## 2. Hermes — confirm which one, then host it

Closest match to “hermes.ai / self-evolve with the user”:

**[Hermes Agent](https://hermes-agent.nousresearch.com/docs/)** by [Nous Research](https://nousresearch.com/) — MIT, [GitHub](https://github.com/NousResearch/hermes-agent). Self-improving loop: skills from experience, `MEMORY.md` / `USER.md`, Honcho-class user modeling. Desktop + CLI. Telegram and 20+ gateways. **Not** a hosted “paste hermes.ai and we mint per-user SaaS.”

NVIDIA writeup of the same agent + NemoClaw: [self-evolving Hermes](https://developer.nvidia.com/blog/deploy-self-evolving-agents-for-faster-more-secure-research-with-a-hermes-agent-and-nvidia-nemoclaw/).

### “Har user ke peeche Hermes”

Official isolation is a **profile** (`~/.hermes/profiles/<name>/`), not a VM per user. Official Docker: **one container, all profiles**. Two processes on one home **corrupt memory**. [Profiles](https://hermes-agent.nousresearch.com/docs/user-guide/profiles) · [Docker](https://hermes-agent.nousresearch.com/docs/user-guide/docker)

Mobile story official docs actually give: **phone = Telegram (or our HTTP client). Hermes stays on a server.** No iOS SDK. Termux is Android CLI only.

MIT lets us **fork and host**. It does not let us ship Python+shell+browser inside the App Store ([Review 2.5.2](https://developer.apple.com/app-store/review/guidelines/)).

---

## 3. Shared memory and agents calling agents

Cowork memory is an **HTTP store keyed by user/team**, called from **our backend**. MCP is an **agent/IDE protocol**, not a phone SDK. Files (`MEMORY.md`) are single-writer local state.

| Tool | License | Role |
|---|---|---|
| [Mem0](https://docs.mem0.ai/introduction) | Apache 2.0 | REST memory API, SaaS or Docker |
| [Honcho](https://honcho.dev/) | AGPL-3.0 | Multi-peer memory; Hermes already plugs in |
| [Zep Cloud](https://help.getzep.com/) / [Graphiti](https://help.getzep.com/graphiti/getting-started/welcome) | Cloud / Apache 2.0 | Graph memory. Zep **Community Edition is discontinued** |
| [Letta](https://docs.letta.com/agent-sdk/memory/) | Apache 2.0 | Agent runtime with git memory, not a generic notes API |
| Hermes built-in files | MIT | Local only; do not share one home |

**MCP** = tools (Sheets, our task API). **[A2A](https://a2a-protocol.org/latest/)** = separate agent *services*. **OpenAI Agents SDK** = in-process handoffs. **Hermes `message_agent`** = Hermes-proprietary, not A2A.

Google’s own guide: use local sub-agents first; A2A when the other agent is a **different service**. [ADK A2A](https://google.github.io/adk-docs/a2a/intro/)

For 2–10 people: **one backend, in-process specialists, MCP for tools.** Do not start with a VM-per-user A2A mesh.

---

## 4. MCP / Claude Code / Codex — no partnership required

Ship a **task API the mobile app already needs**, then a thin **remote MCP** on streamable HTTP (`https://…/mcp`) with **OAuth 2.1**.

Users add it themselves:

```text
claude mcp add --transport http taskkorb https://…/mcp
```

Same pattern for [Cursor MCP](https://cursor.com/docs/mcp) and [Codex MCP](https://developers.openai.com/codex/mcp). Directory listing is optional review, not a deal. [Claude Code MCP](https://code.claude.com/docs/en/mcp)

```text
Phone  ──REST──►  our API + task store
Claude Code / Cursor / Codex / ChatGPT App  ──MCP+OAuth──►  same store
```

stdio MCP on a laptop is a personal hack, not a multi-device product.

---

## 5. WhatsApp vs Telegram

**WhatsApp Cloud API** is a dedicated **business inbox**. Consumer WhatsApp cannot be registered. Incoming webhooks are only “user → *your* business number.” Unauthorized WhatsApp-Web bridges are prohibited. [About the platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform)

After 24h without a user message, only **approved templates** (and those are billed). [Send messages](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages)

**Telegram Bot API** is free, no phone, groups work, Hermes already first-class. [Telegram bots](https://core.telegram.org/bots) · [Hermes Telegram](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram)

**Simplest cowork chat: Telegram first. WhatsApp later as a shared business number, not “our WhatsApp group.”**

Teammates reading/writing **each other’s tasks** is **our task store + auth**, not WhatsApp history.

---

## 6. My Budget

### Email

- **v1:** unique inbound address + Gmail **filter/forward**. Official, no Restricted scope. [Forward Gmail](https://support.google.com/mail/answer/10957)
- **Not v1:** `gmail.readonly` OAuth. Restricted + verification + often [CASA](https://appdefensealliance.dev/casa). Budget is not a listed Gmail approved use. [Workspace policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy)

Parse → **draft** → user confirms. If unsure: *“I am unable to tell whose sale this was.”*

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
3. **Claude official:** Share / Ask Claude intent; Code only: `claude://code/new?q=`. [Claude mobile links](https://support.claude.com/en/articles/14898120-open-the-claude-mobile-app-with-a-link) · [Claude iOS intents](https://support.claude.com/en/articles/10263469)
4. **ChatGPT / Gemini:** no official prefill URL. Community Shortcuts exist; do not treat `?q=` or `googlegemini://` as a contract.
5. **Codex on phone** lives **inside ChatGPT** after QR-pair to a host. `codex://` is **desktop**. [Work with Codex from anywhere](https://openai.com/index/work-with-codex-from-anywhere/)
6. **Antigravity** is Google’s **desktop agent IDE** (2025–26), not Gemini iOS widgets. Mobile = **browser Remote Control** of a desktop. [Antigravity](https://antigravity.google/) · [Remote Control](https://antigravity.google/docs/remote-control/)
7. **Custom keyboard** can `insertText` into the **focused** composer after the user switches keyboards. Must not launch other apps ([Review 4.4.1](https://developer.apple.com/app-store/review/guidelines/)).

### Transcribe

| Path | On-device? | Notes |
|---|---|---|
| [SpeechAnalyzer / SpeechTranscriber](https://developer.apple.com/documentation/speech/speechanalyzer) | Yes (Apple: modules do not send audio to Apple) | iOS 26+ |
| [SFSpeechRecognizer](https://developer.apple.com/documentation/speech/sfspeechrecognizer) + `requiresOnDeviceRecognition` | Only if flagged | ~1 minute cap; default path **does** send audio to Apple |
| [WhisperKit](https://github.com/argmaxinc/WhisperKit) (MIT) | Yes | iOS 16+ |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) (MIT) | Yes | Official iOS samples |

**v1:** user taps Talk → on-device STT → we send **text** (not audio) to our backend. Orange mic indicator. Do not start the mic at launch.

**Wake word:** only supported always-on entry is **Hey Siri → our App Shortcut**. A custom “Listen me” with the screen off fails Review 2.5.4 / 2.5.14.

Auto-assign tasks from a transcript is **our NLP**, not an Apple entitlement.

---

## 8. Smallest stacks (pick one first product)

These are **different products**. Building all of them at once is how this dies.

### A. Keep shipping the existing web orb (already in repo)

PWA. Tap Talk. Typed text → `speechSynthesis`. BYO Gemini key (already). Hindi chrome already on `cursor/green-team-voice-79c8`.

**This is the only slice that already has code.**

### B. iOS personal assistant (new Xcode app)

SwiftUI + SwiftData, **local-only**. Talk button + Share/Copy. Optional CloudKit later. Hermes, if any, on a Mac/VPS you already own via [API server](https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server) or Telegram.

Do **not** WKWebView-wrap the Vite orb as the App Store client ([Review 4.2](https://developer.apple.com/app-store/review/guidelines/) “repackaged website”).

### C. Cowork for 2–10 people (new backend)

User accounts + task store + REST. Later: remote MCP. Later: Telegram bot. Later: Mem0/Honcho. WhatsApp and Gmail OAuth last.

Supabase/Firebase are optional when you need non-Apple accounts. They are not required for B.

---

## Recommended first slice (this agent’s answer)

Until you confirm the grill below, **do not start C or a Swift rewrite**.

1. If the goal is “typed note bolke sunao” → **A**: Web Speech Synthesis on the existing orb.
2. If the goal is “iPhone pe meri voice, Share to Claude” → **B** without overlay, without wake word, without last-5-chats.
3. If the goal is “team tasks + Claude Code EOD” → **C** API + MCP, Telegram not WhatsApp.

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
| **A. Keychain / Keystore, phone → vendor** | Paste once per device | Paste again | No |
| **B. Worker / D1 stores the key** | Yes | Yes | **Yes** (Worker decrypts) |
| **C. User’s own Worker URL** | They deploy | Yes | We never hold it |

Do not claim “encrypted in KV so we never see it” while our Worker holds the unwrap key.

[OpenAPI](https://www.openapis.org/what-is-openapi) is the contract for **our** task API (`tasks:read` / `tasks:write`). Provider `sk-` keys are a different hop.

Cloudflare [Workers](https://developers.cloudflare.com/workers/) / [D1](https://developers.cloudflare.com/d1/) / [KV](https://developers.cloudflare.com/kv/) / named [Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) are real. [trycloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/) is **test-only** (no SLA, 200 in-flight, no SSE). This environment does **not** have dashboard access to “their” Cloudflare account.

---

## 14. What this repo already has (do not rebuild)

`main` is the raw AI Studio “Copy of Audio Orb.”

All voice-product work is on **`cursor/green-team-voice-79c8`**: Talk UI, BYO Gemini, hosted Live token mint, transcripts, session machine, mobile runtime, ~73 tests.

**Does not exist anywhere in the repo:** tasks DB, user accounts, MCP, iOS/Android native, WhatsApp, Hermes host, budget, team sync.

Reuse green-team audio/session/transcript. Everything in sections 1–13 is net-new product.

---

## Honesty / UNVERIFIED

- Firecrawl was often **keyless** / rate-limited. Some community pages (Reddit, unofficial URL schemes) are marked UNVERIFIED in the agent briefs and are **not** product contracts.
- `parallel-cli` deep research was **not available** (`command not found`).
- Live Gemini on a physical phone for the current orb is still **UNVERIFIED** from earlier work.
- No durable host or user-auth in this environment. This note does not invent one.
- CASA / Play exception **prices and approval odds** are not official numbers; do not quote blogs as Google policy.
- A domain literally `hermes.ai` as a plug-in SaaS was **not found**. Closest official product is Nous Hermes Agent.

---

## Sources

**Models / billing**

- [What is ChatGPT Plus?](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus)
- [API usage is not the ChatGPT subscription](https://community.openai.com/t/api-chatgpt-subscription-cannot-use-api-with-chatgpt-subscription/875542)
- [OpenAI Terms](https://openai.com/policies/row-terms-of-use/)
- [Claude paid plan vs API](https://support.claude.com/en/articles/9876003)
- [Claude Pro plan](https://support.claude.com/en/articles/8325606-what-is-the-pro-plan)
- [Gemini Advanced API thread](https://support.google.com/gemini/thread/342070024)
- [Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- [Gemini API billing](https://ai.google.dev/gemini-api/docs/billing)
- [Introducing apps in ChatGPT](https://openai.com/index/introducing-apps-in-chatgpt/)
- [OpenRouter FAQ](https://openrouter.ai/docs/faq)
- [Nous Portal](https://hermes-agent.nousresearch.com/docs/integrations/nous-portal)

**Hermes / agents / MCP**

- [Hermes Agent docs](https://hermes-agent.nousresearch.com/docs/)
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

**Chat / budget / stores**

- [WhatsApp Cloud API](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform)
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
