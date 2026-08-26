# Market scan: notes + tasks + voice + launcher + mobile terminal

Research only. **No product code.** Scraped 26 Aug 2026 with Firecrawl from **official product / support / store listing pages** only. Community blogs, Reddit, and YouTube are not used as facts.

This is **not legal advice**. Store copy and privacy pages change.

Scope: apps that sit near Taskkorb’s mix (notes, tasks, voice capture, launcher/shortcuts, “terminal on a phone”). For each: what it is, platforms, key feature, and whether official pages claim SMS inbox, other apps’ chat history, or a draw-over overlay. Those last three are **almost never** claimed.

---

## What Taskkorb must **not** copy

These are the three anti-patterns. Official peers do not ship them as core product. Existing Taskkorb cowork research already marks them blocked on iOS / ToS.

| Do not ship | Why (this scan + prior official facts) | What peers actually ship instead |
|---|---|---|
| **SMS inbox** (auto-read bank/OTP/personal texts) | No notes, tasks, voice, launcher, or SSH app in this scan advertises SMS inbox access on its official page. Apple has no public SMS inbox API; Play treats SMS as a restricted permission. | User types, dictates, or shares **into** the app. Apple Reminders can ping you **when you next chat with a named contact in Messages** — that is Apple’s own Messages hook, not an SMS dump. [Use Reminders](https://support.apple.com/en-us/102484) |
| **Overlay / floating orb over Claude, ChatGPT, WhatsApp** | No official iOS peer in this scan claims `SYSTEM_ALERT_WINDOW`-style draw-over. iOS does not give third parties AssistiveTouch. | **Custom keyboard** (Wispr Flow App Store title is “AI Voice Keyboard”; Raycast iOS: “Available wherever you type”) and **Share / Activity sheet**. [Wispr Flow iOS listing](https://apps.apple.com/us/app/wispr-flow-ai-voice-keyboard/id6497229487) · [Raycast for iOS](https://www.raycast.com/ios) |
| **Plus-login** (sign in with ChatGPT Plus / Claude Pro / Gemini Advanced and reuse that plan inside Taskkorb) | None of these productivity apps authenticate as “your ChatGPT Plus.” They use **their own accounts**, Apple/Google IDs, or a pasted API key. Consumer chat plans are not an API. | BYO key, vendor-billed tokens, or stay local. See [What is ChatGPT Plus?](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus) in the cowork note. |

**Honest iOS pattern the category already uses:** tap-to-talk **inside** the app, **Share sheet**, **Shortcuts / Siri / Action Button / widgets**, and (if you must type into other apps) a **keyboard extension**. That is what Raycast and Wispr document. Do not prototype an overlay and hope Review agrees.

---

## Comparison table

SMS / other-app chats / overlay: **No** = official page does not claim it. **Keyboard / Share** = types into the focused field or uses the system share sheet (not overlay, not inbox read).

| App | Category | Platforms (official) | Key feature | SMS inbox | Other apps’ chats | Overlay |
|---|---|---|---|---|---|---|
| [Apple Notes](https://support.apple.com/en-us/118442) | Notes | iPhone, iPad, iPod touch, Mac, iCloud, Apple Watch (watchOS 26) | Checklists, Share-into-Notes, in-note audio transcript (iOS 18) | No | No (Share **from** other apps **into** Notes) | No |
| [Apple Reminders](https://support.apple.com/en-us/102484) | Tasks | iPhone, iPad, iPod, Apple Watch, iCloud | Time/location alerts; Siri; widgets; Action Button; shared lists | No | Messages **when-messaging-this-person** hook only | No |
| [Google Keep](https://workspace.google.com/products/keep/) | Notes | Web + phone + computer + smartwatch; [iOS](https://apps.apple.com/us/app/google-keep-notes-and-lists/id1029207872) + [Play](https://play.google.com/store/apps/details?id=com.google.android.keep) | Notes, lists, photos, drawings, **audio**, reminders, Workspace share | No | No | No |
| [Google Tasks](https://workspace.google.com/products/tasks/) | Tasks | Inside Gmail / Calendar / Chat / Docs + [iOS](https://apps.apple.com/us/app/google-tasks-get-things-done/id1353634006) + [Play](https://play.google.com/store/apps/details?id=com.google.android.apps.tasks) | Tasks next to Google apps; date → Calendar | No | Google **Chat spaces** (own product), not WhatsApp/SMS | No |
| [Notion](https://www.notion.com/) | Notes + tasks workspace | Web, desktop, [iOS & Android](https://www.notion.com/mobile) | AI workspace; mobile AI widget / Siri / Spotlight / Action Button | No | Slack **use-case pages**, not “read Slack inbox” | No |
| [Todoist](https://www.todoist.com/) | Tasks | Linux, Mac, Windows, iPhone, iPad, Android, Watch, Wear OS, browsers, email | Natural-language capture; personal + team tasks | No | No | No |
| [TickTick](https://ticktick.com/) | Tasks + calendar | iOS, Android, Windows, macOS, Linux, web, extensions | Voice capture → tasks; Pomodoro; habits; list share | No | No | No |
| [Wispr Flow](https://wisprflow.ai/) | Voice-to-text | Mac, Windows, iPhone, Android | Dictate polished text **in any app you can type in** | No | No (writes **into** Slack/Messages/etc.) | No — iOS listing is a **keyboard** |
| [Superwhisper](https://superwhisper.com/) | Voice-to-text | Mac, Windows, [iOS](https://superwhisper.com/ios) | On-device / offline dictation; modes per app style | No | No | No (official: talk → text in any app) |
| [Voicenotes](https://voicenotes.com/) | Voice notes / meetings | macOS, iOS, Windows, Android, web, Watch | Record meetings; transcript + summary; “no bot” | No | No chat-history API; **records audio** | No |
| [Raycast](https://www.raycast.com/) / [iOS](https://www.raycast.com/ios) | Launcher + notes + AI | macOS, Windows, iOS 18+, iPadOS (not Android) | Spotlight-class launcher; iOS keyboard + share sheet | No | No | No — **keyboard + Activity sheet** |
| [Spotlight](https://support.apple.com/en-ca/guide/mac-mini/apd10f8d1038/mac) | System search / launcher | Apple OS only | Search, open apps, run shortcuts / quick actions | No | Can **search** Mail/Messages if user allows categories | System UI, not a third-party overlay |
| [iOS Shortcuts](https://support.apple.com/guide/shortcuts/welcome/ios) | Automation | iPhone, iPad, Mac (Apple) | User-built multi-step actions; Gallery; Siri | No | Only via **user-granted** app actions | No |
| [Termius](https://termius.com/) | SSH / terminal | macOS, Windows, Linux, iOS, Android | Cross-device SSH, SFTP, vault, team sessions | No | No | No |
| [Blink](https://blink.sh/) | SSH / terminal | iOS / iPad (official site) | Mosh always-on SSH, local Unix tools, Blink Code | No | No | No |
| [Prompt 3](https://panic.com/prompt/) | SSH / terminal | macOS, iPhone, iPad, visionOS | Fast SSH, MOSH, Panic Sync, custom iOS keyboard | No | No | No |
| [Warp](https://www.warp.dev/download) | AI terminal | **macOS, Windows, Linux only** | Agentic desktop terminal | n/a | n/a | n/a |
| [iSH](https://ish.app/) / [a-Shell](https://apps.apple.com/us/app/a-shell/id1473805438) | Local shell on iPhone | iOS App Store | Local Linux/userland or Unix shell — **not** a hosted SSH suite | No | No | No |
| Coworking voice orb | — | **None found** | No official notes+tasks+orb cowork product | — | — | — |

---

## Notes + tasks

### Apple Notes

- Built-in Apple notes app: thoughts, checklists, sketches, attachments; iCloud keeps notes on all signed-in devices. [Use Notes](https://support.apple.com/en-us/118442)
- Platforms: iPhone, iPad, iPod touch; Mac User Guide exists; Watch notes on watchOS 26; iCloud web. [Use Notes](https://support.apple.com/en-us/118442) · [Notes on iCloud](https://www.icloud.com/notes) · [App Store](https://apps.apple.com/us/app/notes/id1110145109)
- Key: Share button **from another app into Notes**; iOS 18 record + transcribe audio **inside a note**; collaboration on shared notes. [Use Notes](https://support.apple.com/en-us/118442)
- SMS / other chats / overlay: **not claimed**. Ingest is Share-in or user-recorded audio, including optional Phone/FaceTime call transcript **via Apple’s own path**. [Use Notes](https://support.apple.com/en-us/118442)

### Apple Reminders

- Built-in to-dos with subtasks, attachments, time and location alerts. [Use Reminders](https://support.apple.com/en-us/102484)
- Platforms: iOS / iPadOS devices signed into the same Apple Account + iCloud; Siri on iPhone and Apple Watch; widgets, Control Center, Action Button (iOS 26). [Use Reminders](https://support.apple.com/en-us/102484) · [App Store](https://apps.apple.com/us/app/reminders/id1108187841) · [iCloud Reminders](https://www.icloud.com/reminders)
- Key: Siri create; Share-from-another-app; shared lists and assign; optional “when messaging [this person]” in **Messages**. [Use Reminders](https://support.apple.com/en-us/102484)
- SMS / overlay: **not claimed**. The Messages hook is “next time you chat with this contact,” not an SMS inbox. [Use Reminders](https://support.apple.com/en-us/102484)

### Google Keep

- Google’s notes: “Create and share notes, lists, photos, drawings, and audio.” [Keep product](https://workspace.google.com/products/keep/) · [keep.google.com](https://keep.google.com/)
- Platforms: official copy says phone, computer, smartwatch; store listings for [Play](https://play.google.com/store/apps/details?id=com.google.android.keep) and [iOS](https://apps.apple.com/us/app/google-keep-notes-and-lists/id1029207872); Chrome extension in search hits.
- Key: realtime sync, labels/colors, reminders, offline, collaborative notes, Keep ↔ Docs / Workspace. [Keep product](https://workspace.google.com/products/keep/)
- SMS / chats / overlay: **not claimed**.

### Google Tasks

- Lightweight to-dos “right in the Google apps you use daily.” [Tasks product](https://workspace.google.com/products/tasks/)
- Platforms: Gmail, Calendar, Chat, Docs on web; mobile push; [Play](https://play.google.com/store/apps/details?id=com.google.android.apps.tasks) · [App Store](https://apps.apple.com/us/app/google-tasks-get-things-done/id1353634006)
- Key: email → task, dated task → Calendar, assign in Docs (some Workspace plans), assign in Chat **spaces**. [Tasks product](https://workspace.google.com/products/tasks/)
- SMS / overlay: **not claimed**. Chat tasks are Google Chat, not third-party messengers.

### Notion

- “The AI workspace” — notes, docs, tasks, agents. [Notion](https://www.notion.com/)
- Platforms: web, [desktop](https://www.notion.com/desktop), [mobile iOS & Android](https://www.notion.com/mobile) · [App Store](https://apps.apple.com/us/app/notion-notes-tasks-ai/id1232780281) · [Play](https://play.google.com/store/apps/details?id=notion.id) · [Help: mobile](https://www.notion.com/help/notion-for-mobile)
- Key on phone: Notion AI home-screen widget (chat / camera / voice); Siri “open Notion AI”; Spotlight; Action Button. Separate **Notion Agents** app for on-the-go AI. [Notion for mobile](https://www.notion.com/help/notion-for-mobile)
- SMS / chats / overlay: **not claimed**. Home-page Slack examples are agent **use cases**, not a Slack-history scraper.

### Todoist

- “The world’s #1 to-do list app”; capture with natural language; Today / Upcoming / filters; calendar; personal tasks **alongside** a team space. [Todoist](https://www.todoist.com/)
- Platforms: Linux, Mac, Windows, iPhone, iPad, Android, Apple Watch, Wear OS, browsers, email add-ons. [Downloads](https://www.todoist.com/downloads) · [App Store](https://apps.apple.com/us/app/todoist-to-do-list-calendar/id572688855) · [Play](https://play.google.com/store/apps/details?id=com.todoist)
- Key: fast typed capture, recurring dates, teamwork product, SOC 2 Type II. [Todoist](https://www.todoist.com/)
- SMS / chats / overlay: **not claimed**.

### TickTick

- To-do + calendar + habits + Pomodoro. [TickTick](https://ticktick.com/)
- Platforms: iOS & iPadOS, Android, Windows, macOS, Linux, web, extensions. [Download](https://ticktick.com/download) · [App Store](https://apps.apple.com/us/app/ticktick-to-do-list-calendar/id626144601) · [Play](https://play.google.com/store/apps/details?id=com.ticktick.task)
- Key: **Voice Capture** (speak → dates/priorities/multiple tasks); audio summary of recordings; NLP dates; share lists; Notion/calendar integrations; MCP/CLI mentioned on the marketing page. [TickTick](https://ticktick.com/)
- SMS / chats / overlay: **not claimed**. Voice is **in-app** capture, not a floating orb.

---

## Voice-to-text

### Wispr Flow

- “The voice-to-text AI that turns speech into clear, polished writing in every app.” [Wispr Flow](https://wisprflow.ai/)
- Platforms: Mac, Windows, iPhone, Android. [Wispr Flow](https://wisprflow.ai/) · [App Store: Wispr Flow: AI Voice Keyboard](https://apps.apple.com/us/app/wispr-flow-ai-voice-keyboard/id6497229487) · [Play](https://play.google.com/store/apps/details?id=com.wispr.flowapp)
- Key: cleanup (ums, mid-sentence corrections), works “anywhere you can type, with no plugins”; iPhone post: Slack, Messages, Email, Docs; personal dictionary; notes shortcut synced with desktop. [Wispr Flow](https://wisprflow.ai/) · [Flow on iPhone](https://wisprflow.ai/post/flow-on-iphone)
- SMS / chats: **does not read inboxes**. It **writes** into whichever field has focus.
- Overlay: official iOS name is a **keyboard**, not a floating overlay. [App Store](https://apps.apple.com/us/app/wispr-flow-ai-voice-keyboard/id6497229487)

### Superwhisper

- Desktop-first AI dictation; “Works in Slack, Gmail and any other site or app.” [Superwhisper](https://superwhisper.com/)
- Platforms: Mac, Windows, iOS. [Home](https://superwhisper.com/) · [iOS](https://superwhisper.com/ios) · [App Store](https://apps.apple.com/us/app/superwhisper-ai-dictation/id6471464415)
- Key on iOS: “Talk into your phone, get formatted text in any app”; **offline / on-device** models; 100+ languages; modes (casual iMessage vs professional email). [Superwhisper for iOS](https://superwhisper.com/ios)
- SMS / chats / overlay: **not claimed**. “Reads the situation” on the iOS page is **dictation style / modes**, not chat-history access. [Superwhisper for iOS](https://superwhisper.com/ios)

### Voicenotes (voicenotes.com)

- AI notetaker: “turns every meeting into perfect notes”; works with Zoom, Meet, Teams, Webex, Slack huddles **without a meeting bot**. [Voicenotes](https://voicenotes.com/)
- Platforms: official line lists iOS, Android, macOS, Windows, web, Watch. [Voicenotes](https://voicenotes.com/) · [App Store](https://apps.apple.com/us/app/voicenotes-ai-notes-meetings/id6483293628) · [Play](https://play.google.com/store/apps/details?id=com.app.voicenotes)
- Key: user hits record (online or in-person); transcript + summary + action items; SOC 2 / GDPR marketing. [Voicenotes](https://voicenotes.com/)
- SMS / chats: **not claimed**. “Works with meeting apps” = **audio capture**, not reading Slack/WhatsApp threads.
- Overlay: **not claimed**.

---

## Launchers / shortcuts

### Raycast

- Desktop: “Your shortcut to everything” — launcher, extensions, AI, notes. [Raycast](https://www.raycast.com/) · [App Store](https://apps.apple.com/us/app/raycast-ai-notes-and-more/id6503428327)
- Platforms: macOS, Windows, **iOS 18+ / iPadOS**. Official FAQ: **not Android**. [Raycast for iOS](https://www.raycast.com/ios)
- iOS key: AI chat (many models), Notes, Snippets, Quicklinks; **Whisper tap-and-hold**; **custom keyboard**; **Activity Sheet** (“Access Raycast from almost every app”); widgets, bundled Shortcuts, Control Center, Action Button. Sync of chats/notes/snippets needs Raycast Pro. [Raycast for iOS](https://www.raycast.com/ios)
- SMS / chats / overlay: **not claimed**. Cross-app reach is **keyboard + share sheet**, which is the legal iOS pattern Taskkorb should copy instead of an orb.

### Spotlight (Apple)

- System search and quick actions on Apple devices. Mac: find files, open apps, run a shortcut, Focus, conversions. [Spotlight on your Mac](https://support.apple.com/en-ca/guide/mac-mini/apd10f8d1038/mac)
- Platforms: macOS / iOS (system). iPhone search guide URL from Apple Support search: [Search with Spotlight on iPhone](https://support.apple.com/guide/iphone/search-on-iphone-iph3c511548/ios) (scrape of that URL was rate-limited this pass; Mac page was retrieved).
- Key: Command–Space (Mac); can include/exclude Mail or Messages **as search categories** in System Settings — that is Apple search, not a third-party inbox API. [Spotlight on your Mac](https://support.apple.com/en-ca/guide/mac-mini/apd10f8d1038/mac)
- Overlay: Spotlight **is** system UI. Third-party apps cannot replace it.

### iOS Shortcuts

- User-built automations: a shortcut is one or more **actions** that talk to apps on the device and internet services. Gallery to install examples. [Shortcuts User Guide](https://support.apple.com/guide/shortcuts/welcome/ios)
- Platforms: Apple only (guide is iOS; Mac Shortcuts exists in the same family).
- Key: mix actions; Siri; URL-run shortcuts (documented in prior cowork note). Notion and Raycast both tell users to wire **Apple** Shortcuts, not a private overlay. [Shortcuts User Guide](https://support.apple.com/guide/shortcuts/welcome/ios) · [Notion for mobile](https://www.notion.com/help/notion-for-mobile) · [Raycast for iOS](https://www.raycast.com/ios)
- SMS / chats / overlay: **not claimed** as a generic inbox. A shortcut only does what **the user** and **each app’s actions** allow.

---

## SSH / “terminal on the phone”

### Termius

- “Modern SSH Client” for productivity and collaboration. [Termius](https://termius.com/)
- Platforms: macOS, Windows, Linux, iOS, Android. [Termius](https://termius.com/) · [iOS store](https://apps.apple.com/us/app/termius-modern-ssh-client/id549039908) · [Play](https://play.google.com/store/apps/details?id=com.server.auditor.ssh.client) · [Free SSH for iPhone](https://termius.com/free-ssh-client-for-iphone)
- Key: full terminal, SFTP, encrypted vault / key sync, biometric unlock, team multiplayer sessions. [Termius](https://termius.com/)
- SMS / chats / overlay: **not claimed**. It is an SSH client, not a notes overlay.

### Blink Shell

- iOS/iPad terminal: Mosh, SSH, local CLI tools, SFTP & Files.app, open source. [Blink](https://blink.sh/)
- Platforms: official site is iOS/iPad-centric (external keyboard, AirPlay, iPad workstation). App Store listing was **not retrieved** this pass (keyless rate limit); official site is [blink.sh](https://blink.sh/).
- Key: Mosh “always on” across sleep/networks; Blink Code → VS Code / Codespaces; vim + Unix userland on device. [Blink](https://blink.sh/)
- SMS / chats / overlay: **not claimed**.

### Prompt 3 (Panic)

- Paid SSH client: “one price, one app… four platforms.” [Prompt](https://panic.com/prompt/)
- Platforms: macOS, iPhone, iPad, visionOS. [Prompt](https://panic.com/prompt/) · [App Store](https://apps.apple.com/us/app/prompt-3/id1594420480)
- Key: fast SSH, MOSH & Eternal Terminal, Clips, Panic Sync for servers/keys, Face ID / YubiKey, jump hosts, **customizable iOS keyboard** for terminal typing. [Prompt](https://panic.com/prompt/)
- SMS / chats / overlay: **not claimed**.

### Warp

- Official download page: **Warp Terminal is available for macOS, Windows, and Linux.** Agent CLI same three desktops. [Warp Downloads](https://www.warp.dev/download)
- **No iOS or Android product** on the official download page as of this scrape. A GitHub issue titled “Warp for iOS and Android” appeared in search; that is **not** a shipped store app.
- Do not tell users Warp is “terminal on mobile.” It is not, on official pages.

### iSH / a-Shell (local shells)

- [iSH](https://ish.app/) — Alpine-like userland on iPhone; [App Store: iSH Shell](https://apps.apple.com/us/app/ish-shell/id1436902243).
- [a-Shell](https://apps.apple.com/us/app/a-shell/id1473805438) — App Store local Unix environment (search hit; home site not scraped).
- These are **on-device shells**, not Termius-class hosted SSH suites. No SMS/overlay claims on the official/store URLs we have.

---

## “Coworking voice orb”

**No official product found** that is: shared notes + shared tasks + a floating voice orb + cowork for 2–10 people.

Search hits that are **not** that product:

- [VoiceTask AI – Notes & To-Do](https://apps.apple.com/us/app/voicetask-ai-notes-to-do/id6753657106) — App Store listing only; no official marketing site retrieved. Personal notes/to-do, not a documented cowork orb.
- Play hit “Idea Note-Floating Voice Note” — Android floating-note; **not** used as a design target (overlay is exactly what Taskkorb must not copy on iOS).
- Gemini / ChatGPT orbs are **those vendors’ own chat UIs**, not a third-party cowork workspace.

Closest **shippable** cousins: TickTick or Todoist (tasks + some voice) + Wispr/Superwhisper/Raycast keyboard (voice into other apps) + Termius (real SSH). None are a floating cowork orb.

---

## What *is* fair to learn from (not copy as overlay/SMS/Plus)

| Pattern | Who documents it | Use for Taskkorb |
|---|---|---|
| In-app Talk + transcript | Apple Notes audio; TickTick Voice Capture; Voicenotes record | Yes — tap Talk in **our** UI |
| Share sheet / Activity sheet | Notes, Reminders, [Raycast iOS](https://www.raycast.com/ios) | Yes — hand text to Claude/ChatGPT |
| Keyboard extension | [Wispr Flow](https://apps.apple.com/us/app/wispr-flow-ai-voice-keyboard/id6497229487), [Raycast iOS](https://www.raycast.com/ios), Prompt’s terminal keyboard | Optional later; Review 4.4 rules apply |
| Siri / Shortcuts / Action Button / widgets | Reminders, Notion, Raycast, Shortcuts guide | Yes — system entry points |
| Own account or BYO key | Entire category | Yes — **not** ChatGPT Plus login |
| Real mobile terminal | Termius, Blink, Prompt — **SSH to a host you own** | If “terminal on phone” is a wish: ship SSH to **user’s** server, or don’t claim Warp-on-iPhone |

---

## Honesty / UNVERIFIED

- Firecrawl ran **keyless** and hit rate limits. Failed or empty scrapes this pass: Raycast homepage body, TickTick first attempt (later OK), Blink App Store listing, iSH homepage body, Google Keep Help Center, Google Tasks Help article, iPhone Spotlight guide. Facts above use the pages that **did** return markdown, plus store/official URLs from Firecrawl search.
- App Store / Play **permission lists** were not reliably present in the markdown we got. Absence of “SMS” on a marketing page is not a Play Console declaration. Still: **no official marketing page in this set sells SMS inbox or chat-history scrape.**
- Superwhisper “reads the situation” and Wispr “works in every app” mean **dictation into the focused field**, not reading WhatsApp/SMS. Do not stretch those sentences.
- VoiceTask AI beyond the App Store URL is **UNVERIFIED**.

---

## Sources

**Notes / tasks**

- [Use Notes on iPhone, iPad, and iPod touch](https://support.apple.com/en-us/118442) (scraped 26 Aug 2026)
- [Notes – App Store](https://apps.apple.com/us/app/notes/id1110145109)
- [Notes on iCloud](https://www.icloud.com/notes)
- [Use Reminders on iPhone, iPad, or iPod touch](https://support.apple.com/en-us/102484) (scraped 26 Aug 2026)
- [Reminders – App Store](https://apps.apple.com/us/app/reminders/id1108187841)
- [Reminders on iCloud](https://www.icloud.com/reminders)
- [Google Keep product](https://workspace.google.com/products/keep/) (scraped 26 Aug 2026)
- [Google Keep web](https://keep.google.com/)
- [Google Keep – Play](https://play.google.com/store/apps/details?id=com.google.android.keep)
- [Google Keep – App Store](https://apps.apple.com/us/app/google-keep-notes-and-lists/id1029207872)
- [Google Tasks product](https://workspace.google.com/products/tasks/) (scraped 26 Aug 2026)
- [Google Tasks – Play](https://play.google.com/store/apps/details?id=com.google.android.apps.tasks)
- [Google Tasks – App Store](https://apps.apple.com/us/app/google-tasks-get-things-done/id1353634006)
- [Notion](https://www.notion.com/) · [Notion mobile download](https://www.notion.com/mobile) · [Notion for mobile help](https://www.notion.com/help/notion-for-mobile)
- [Notion – App Store](https://apps.apple.com/us/app/notion-notes-tasks-ai/id1232780281)
- [Notion – Play](https://play.google.com/store/apps/details?id=notion.id)
- [Todoist](https://www.todoist.com/) · [Todoist downloads](https://www.todoist.com/downloads)
- [Todoist – App Store](https://apps.apple.com/us/app/todoist-to-do-list-calendar/id572688855)
- [Todoist – Play](https://play.google.com/store/apps/details?id=com.todoist)
- [TickTick](https://ticktick.com/) · [TickTick download](https://ticktick.com/download)
- [TickTick – App Store](https://apps.apple.com/us/app/ticktick-to-do-list-calendar/id626144601)
- [TickTick – Play](https://play.google.com/store/apps/details?id=com.ticktick.task)

**Voice**

- [Wispr Flow](https://wisprflow.ai/)
- [Flow is now on iPhone](https://wisprflow.ai/post/flow-on-iphone) (2 Jun 2025)
- [Wispr Flow: AI Voice Keyboard – App Store](https://apps.apple.com/us/app/wispr-flow-ai-voice-keyboard/id6497229487)
- [Wispr Flow – Play](https://play.google.com/store/apps/details?id=com.wispr.flowapp)
- [Superwhisper](https://superwhisper.com/) · [Superwhisper for iOS](https://superwhisper.com/ios)
- [Superwhisper – App Store](https://apps.apple.com/us/app/superwhisper-ai-dictation/id6471464415)
- [Voicenotes](https://voicenotes.com/)
- [Voicenotes – App Store](https://apps.apple.com/us/app/voicenotes-ai-notes-meetings/id6483293628)
- [Voicenotes – Play](https://play.google.com/store/apps/details?id=com.app.voicenotes)

**Launchers**

- [Raycast](https://www.raycast.com/)
- [Raycast for iOS](https://www.raycast.com/ios)
- [Raycast – App Store](https://apps.apple.com/us/app/raycast-ai-notes-and-more/id6503428327)
- [Spotlight on your Mac](https://support.apple.com/en-ca/guide/mac-mini/apd10f8d1038/mac)
- [Search with Spotlight on iPhone](https://support.apple.com/guide/iphone/search-on-iphone-iph3c511548/ios)
- [Shortcuts User Guide](https://support.apple.com/guide/shortcuts/welcome/ios)

**Terminal**

- [Termius](https://termius.com/)
- [Termius – App Store](https://apps.apple.com/us/app/termius-modern-ssh-client/id549039908)
- [Termius – Play](https://play.google.com/store/apps/details?id=com.server.auditor.ssh.client)
- [Blink](https://blink.sh/)
- [Prompt 3](https://panic.com/prompt/)
- [Prompt 3 – App Store](https://apps.apple.com/us/app/prompt-3/id1594420480)
- [Warp Downloads](https://www.warp.dev/download)
- [iSH](https://ish.app/) · [iSH Shell – App Store](https://apps.apple.com/us/app/ish-shell/id1436902243)
- [a-Shell – App Store](https://apps.apple.com/us/app/a-shell/id1473805438)

**Orb (negative result)**

- [VoiceTask AI – App Store](https://apps.apple.com/us/app/voicetask-ai-notes-to-do/id6753657106) (listing only; not a documented cowork orb)
