# Xiaomi XiaoAI / overlay vs iOS port

Research only. **No product code in this change.** Written 26 Aug 2026 after the owner said: *“MI ke phone ke andar ye zyada aata hai, ye SS bol jo apne banayi hai”* — the voice thing they built works more on Xiaomi, and they want it full-fledged on iOS.

Method: Firecrawl search + scrape of official Xiaomi / Android / Apple pages; official URLs fetched again when Firecrawl’s keyless tier rate-limited. This is **not legal advice**. Store and OEM rules change.

**Honest headline:** there is **no public Xiaomi API** that lets a third-party phone app hijack Super XiaoAI’s wake word or become the system assistant. If “SS bol” feels stronger on MI, the documented explanation is **Android overlay + HyperOS extra permission toggles**, not a secret XiaoAI hook. Porting to iOS **loses overlay and SMS inbox**. It **keeps tap-to-talk and Share**.

---

## What you asked, answered first

| Question | Fact |
|---|---|
| Can a third-party app hook XiaoAI / HyperOS wake word? | **No public hook.** Official XiaoAI SDK is for **device OEMs** embedding XiaoAI. SDKs are emailed, not on Maven/Play. HyperOS “Agent/Skill/MCP” is a **gated marketplace** into Xiaomi’s own agent (MiClaw), not a wake-word API. |
| Can a third-party app overlay like XiaoAI? | **On Android, yes, with user grant:** `SYSTEM_ALERT_WINDOW` + `TYPE_APPLICATION_OVERLAY`. HyperOS adds extra OEM switches (background popup, autostart) that are **denied by default**. **On iOS: no overlay API exists.** |
| Why “zyada aata hai” on MI? | If SS used a floating ball / draw-over-apps, that path **exists only on Android**. Xiaomi users are used to granting floating-window / autostart. iPhone cannot do this. It is **not** evidence of an undocumented XiaoAI partnership. |
| What “port to iOS” actually means | **Lose** overlay, always-on wake word, SMS inbox, HyperOS Super Island / System Memory. **Keep** in-app tap-to-talk + Share out (and Share in if you add an extension). Optional: Siri/App Shortcut the user sets up — not “Hey SS”. |

---

## 1. XiaoAI / HyperOS — official surface, then the gap

### 1.1 Super XiaoAI is Xiaomi’s system assistant

[HyperOS 4](https://hyperos.mi.com/) (scraped 26 Aug 2026) markets **超级小爱 2.0** as first-party UI:

- “小白条，随时唤起” — hold the bottom bar, speak, lift to leave, without breaking the current app.
- 灵感球 — point at screen content and speak (navigate, same-item search, calendar, edit photo).
- System execution (gallery, travel planning) on Xiaomi’s **MiMo** model.
- Super XiaoAI IME, AI notes, AI call.

[xiaoai.mi.com](https://xiaoai.mi.com/) is the same first-party product (陪伴模式, multimodal UI). This is **Xiaomi’s app**, not a third-party SDK you call from Taskkorb.

Xiaomi’s own [HyperAI Engine Third Party Data Sharing Statement](https://privacy.mi.com/AIEngine-Share/en_US/) (v20260803) shows what **Hyper XiaoAI** can read for “System Memory” / unified search: **SMS**, calendar, notifications, location, notes, recordings, contacts, call history, album. That sharing is **Xiaomi Inc. → Xiaomi Hyper XiaoAi**. It is **not** a documented API for your app to read the same data.

### 1.2 Official XiaoAI developer platform exists — for embedding XiaoAI into hardware

[小爱开放平台 · 语音服务](https://developers.xiaoai.mi.com/voiceservice/index): “让您的产品内置小爱同学” — put XiaoAI **inside your product**. Target devices listed: phone, TV, speaker, wearables, smart home, car, and applications. Capabilities: ASR, chat, customer service, knowledge graph, IoT control, third-party **skills**.

[Android AIVS-SDK 接入文档](https://developers.xiaoai.mi.com/documents/Home?type=/api/doc/render_markdown/VoiceserviceAccess/Device/develop/SDKDocument/AndroidInstruction) (scraped 26 Aug 2026):

> 设备接入小爱语音能力需要接入几个部分的内容，分别是鉴权SDK，唤醒SDK和小爱SDK。
>
> 唤醒SDK由**设备端厂商**开发或直接采用小爱研发的SDK…  
> 企业开发者请联系小爱产品经理或发邮件至 **xiaoai@xiaomi.com** 获取这三个SDK。

Wake-word SDK is for **device manufacturers**. Auth modes include device OAuth, device token, and **App OAuth** (“应用程序通过小米帐号访问小米小爱开放平台”) with Xiaomi Account SDK and scopes (docs point at [开放数据接口权限列表](https://dev.mi.com/console/doc/detail?pId=762)). That is **your app talking to XiaoAI cloud**, not hooking the phone’s “小爱同学” hotword.

**Undocumented / gated (say this out loud):** there is no public Maven artifact, no Play-store-app wake-word registration guide, and no HyperOS page titled “third-party apps: replace Super XiaoAI wake word.” If a partner program exists, the official path is email (`xiaoai@xiaomi.com`), not a published phone-app API.

Firecrawl search also hit an official protocol page whose snippet mentions `ThirdPartyWakeupState` for **reporting** when a third-party H5/Intent **launches the XiaoAI app** ([Endpoint 指令集](https://developers.xiaoai.mi.com/documents/Home?type=/api/doc/render_markdown/VoiceserviceAccess/Device/develop/ProtocolDocument/Endpoint)). That is “start XiaoAI,” not “steal XiaoAI’s mic.” The page is a JS app; we could not get a clean full scrape. Treat the snippet as **indicative, not a complete spec**.

### 1.3 HyperOS developer portal — real docs, none of them are a wake-word hook

[dev.mi.com/xiaomihyperos](https://dev.mi.com/xiaomihyperos) and [文档中心](https://dev.mi.com/xiaomihyperos/documentation) publish:

- System adaptation (permissions, desktop, widgets, Super Island, VoIP, …).
- Store permission / privacy rules.
- **Agent 生态**: MCP / Skill / Agent **publish** guides.

[Agent 生态公测公告](https://dev.mi.com/xiaomihyperos/announcement/detail?id=41) (21 Apr 2026): **Xiaomi miclaw** is Xiaomi’s **system-level AI Agent** (MiMo). Developers may upload MCP / Skill / Agent **into MiClaw** after emailing `developer@xiaomi.com`. Invite / review gated. This is “ship a skill into Xiaomi’s agent,” the Alexa-skill pattern — **not** “my APK listens for 小爱同学.”

Related publish docs: [Skill](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=2307), [MCP](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=2308), [Agent](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=2305).

**Bottom line:** official Xiaomi docs for third-party phone apps cover **permissions, store, Island, and publishing into Xiaomi’s agent**. They do **not** document a public wake-word or assistant-role API for an independent voice orb.

---

## 2. Overlay: why MI can feel “more,” and why iPhone cannot

### 2.1 Android has a real overlay API

[Manifest.permission.SYSTEM_ALERT_WINDOW](https://developer.android.com/reference/android/Manifest.permission#SYSTEM_ALERT_WINDOW):

> Allows an app to create windows using the type `WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY`, shown on top of all other apps. Very few apps should use this permission; these windows are intended for system-level interaction with the user.

If `targetSdk >= 23`, the user must grant it via `Settings.ACTION_MANAGE_OVERLAY_PERMISSION`. The app checks `Settings.canDrawOverlays()`.

[TYPE_APPLICATION_OVERLAY](https://developer.android.com/reference/android/view/WindowManager.LayoutParams#TYPE_APPLICATION_OVERLAY) (API 26): windows sit **above all activity windows**, below status bar / IME. Requires `SYSTEM_ALERT_WINDOW`. Older types (`TYPE_SYSTEM_ALERT`, `TYPE_PHONE`, …) are deprecated for non-system apps.

That is the legal, public way to do a floating mic / AssistiveTouch-like ball **over Claude, WhatsApp, Chrome**.

### 2.2 HyperOS extra switches (official, and they default to OFF)

These are **OEM**, documented on the HyperOS developer site — not AOSP:

| OEM control | Official page | Default |
|---|---|---|
| 后台弹出页面 (start a page from background) | [pId=1625](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1625) (27 Nov 2024) | **Denied.** Whitelist examples: music lyrics, sports, VoIP incoming. Abuse → permanent removal. Special ask: `miui-security-open@xiaomi.com`. |
| 自启动 (autostart after boot / after kill) | [pId=1624](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1624) (25 Sep 2024) | **Off.** User must enable. |
| Process kills (one-key clean, lock-screen clean, …) | [MIUI 进程管理 pId=1607](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1607) | After user kill, restart needs autostart. |

HyperOS also restates AOSP overlay in store security text ([体育运动类检测 pId=1733](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1733)): `SYSTEM_ALERT_WINDOW` + settings jump + `canDrawOverlays()`. [Android 15 适配 pId=1826](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1826): holding overlay is **not** enough to start a foreground service from the background unless a **visible** `TYPE_APPLICATION_OVERLAY` window exists.

So Xiaomi is **not** “more open by default.” It is **more configurable**. If the owner granted 悬浮窗 + 后台弹出 + 自启动 (common on MI because XiaoAI itself lives that way), SS’s overlay **survives**. On stock Android the same overlay is easier to kill. On iOS it **cannot exist**.

### 2.3 iOS has no SYSTEM_ALERT_WINDOW

There is no Apple equivalent. [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (scraped 26 Aug 2026):

- **2.5.1** — public APIs only, intended purpose.
- **2.5.4** — background only for intended services (VoIP, audio, location, …). Always-on mic as a “wake word daemon” is not an intended background mode.
- **2.5.8** — apps that create alternate desktop / home-screen environments are rejected.
- **2.5.14** — explicit consent + visual/audible indication when recording mic.
- **2.5.11** — SiriKit/Shortcuts phrases must relate to **your** app; no generic aliases, no third-party app names.
- **5.2.5** — do not look like an Apple product / interface (AssistiveTouch clones are the classic fail).

A floating ball over ChatGPT / Claude **cannot ship** on the App Store. AssistiveTouch is [system-only](https://support.apple.com/en-us/111794).

That is the honest “zyada aata hai on MI” mechanism **if SS used overlay**. Confirm in the Android APK/PWA: `SYSTEM_ALERT_WINDOW` in the manifest, or a WebView that never left the app (then the MI gap is just Xiaomi speech / battery, not overlay).

---

## 3. What “port to iOS” actually keeps and loses

### Lose

| Capability | Why |
|---|---|
| Floating overlay over other apps | No iOS API. Review 2.5.1 / 2.5.8 / 5.2.5. |
| Always-on custom wake word (“Hey SS” like 小爱) | Third-party apps do not get the system hotword layer. Background mic is 2.5.4 + 2.5.14. Apple’s own Speech sample is **tap Start Recording**. |
| SMS inbox / bank SMS for budget | [IdentityLookup SMS/MMS filtering](https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering) is **unknown-sender filter only**. Extension answers “spam?” — it is **not** an inbox API and does not write into the containing app. |
| HyperOS Super Island / 小白条 / 灵感球 | Xiaomi first-party. |
| Hyper XiaoAI System Memory (SMS, call recents, …) | First-party sharing statement, not your entitlement. |
| Play SMS even on Android (if you hoped to “keep SMS on MI and add iOS later”) | [Play SMS/Call Log policy](https://support.google.com/googleplay/android-developer/answer/10208820): default SMS / Phone / Assistant handler, or a listed exception. **SMS-based money management** is an exception, not a right. Invalid uses explicitly include **text-to-voice / speech-to-text when not the default handler**. A voice orb that also slurps SMS is the wrong core-function story. |

### Keep (public Apple APIs)

| Capability | Official API | Honest limit |
|---|---|---|
| **Tap-to-talk** inside the app | [Speech](https://developer.apple.com/documentation/speech) — live or file audio → transcript. Sample [Recognizing speech in live audio](https://developer.apple.com/documentation/speech/recognizing-speech-in-live-audio) starts on a **Start Recording** button; asks mic permission. | Foreground (or documented audio session). Not a lock-screen hotword. |
| **Speak typed text** | AVSpeechSynthesizer / web `speechSynthesis` | On-device, free. Not Plus/Advanced. |
| **Share out** | [UIActivityViewController](https://developer.apple.com/documentation/uikit/uiactivityviewcontroller) — “standard services… copying… email or SMS, and more.” | User picks Messages / copy / Claude / WhatsApp. You do not inject into another app’s chat. |
| **Share in** | Share extension / `NSExtension` | User shares **to you** from another app. |
| **Siri / Shortcuts / Action button** | [App Intents](https://developer.apple.com/documentation/appintents) — actions discoverable by Siri, Spotlight, Shortcuts, widgets. [Hardware interactions](https://developer.apple.com/documentation/appintents/hardware-interactions): user assigns **your App Shortcut** to the Action button. Side-button conversational launch is documented for **Japan** only. | User must set the phrase / button. Not always-on. Review 2.5.11 forbids generic “Hey Listen.” |
| **Legacy SiriKit** | [SiriKit](https://developer.apple.com/documentation/sirikit) | Apple now points new work at App Intents. Fixed domains only. |

### “Full-fledged iOS” that is still honest

Ship a **native or PWA iOS app** that:

1. User opens (or Action-button / Shortcut opens) Taskkorb.
2. Taps Talk → Speech + your model (BYO key — already the honest money model).
3. Shares the transcript / reply via the system Share sheet into Claude / ChatGPT / Messages.

Do **not** promise: floating orb over Claude, “Listen me” like Siri, last-5-chats from those apps, or SMS budget on iPhone.

---

## 4. Decision table for the owner

| If the goal is… | Do this | Do not do this |
|---|---|---|
| Same floating SS on iPhone as on MI | **Impossible** on App Store. | Clone AssistiveTouch. |
| Voice that works in **our** app on iPhone | Tap-to-talk + TTS + Share. | Pretend overlay will “come later.” |
| Wake word on Xiaomi only | You still do **not** get XiaoAI’s hotword. Use Android `VoiceInteractionService` / assistant role (AOSP/Play, not Xiaomi-specific) **or** stay tap-to-talk. OEM overlay + autostart is the MI boost. | Email-only XiaoAI device SDK as if it were a phone-app API. |
| SMS budget | Android-only, Play exception, core = budget, no exfil of non-finance SMS. iOS = user forwards / Share / photo of statement. | Attach SMS to the voice orb and hope both stores agree. |
| “Be inside XiaoAI” | Apply to [MiClaw Agent 生态](https://dev.mi.com/xiaomihyperos/announcement/detail?id=41) (`developer@xiaomi.com`). That is **their** shell, not iOS. | Treat approval as a wake-word license. |

---

## Sources

Official, used above:

- [XiaoAI 语音服务平台](https://developers.xiaoai.mi.com/voiceservice/index)
- [XiaoAI Android AIVS-SDK](https://developers.xiaoai.mi.com/documents/Home?type=/api/doc/render_markdown/VoiceserviceAccess/Device/develop/SDKDocument/AndroidInstruction)
- [XiaoAI 产品站](https://xiaoai.mi.com/)
- [HyperOS 4](https://hyperos.mi.com/)
- [HyperOS 开发者平台](https://dev.mi.com/xiaomihyperos) · [文档中心](https://dev.mi.com/xiaomihyperos/documentation)
- [后台弹出页面权限 pId=1625](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1625)
- [自启动权限 pId=1624](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1624)
- [MIUI 进程管理 pId=1607](https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1607)
- [Agent 生态公测](https://dev.mi.com/xiaomihyperos/announcement/detail?id=41)
- [HyperAI Engine sharing statement](https://privacy.mi.com/AIEngine-Share/en_US/)
- [SYSTEM_ALERT_WINDOW](https://developer.android.com/reference/android/Manifest.permission#SYSTEM_ALERT_WINDOW)
- [TYPE_APPLICATION_OVERLAY](https://developer.android.com/reference/android/view/WindowManager.LayoutParams#TYPE_APPLICATION_OVERLAY)
- [Play SMS / Call Log](https://support.google.com/googleplay/android-developer/answer/10208820)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Speech](https://developer.apple.com/documentation/speech) · [live audio sample](https://developer.apple.com/documentation/speech/recognizing-speech-in-live-audio)
- [SMS and MMS Message Filtering](https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering)
- [UIActivityViewController](https://developer.apple.com/documentation/uikit/uiactivityviewcontroller)
- [App Intents](https://developer.apple.com/documentation/appintents) · [Hardware interactions](https://developer.apple.com/documentation/appintents/hardware-interactions)
- [SiriKit](https://developer.apple.com/documentation/sirikit)

Scrapes under `.firecrawl/` (gitignored). Firecrawl was unauthenticated (keyless); later official pages used direct fetch after rate limits.

**Still undocumented after this pass:** a Xiaomi public API that lets an independent Play/App Store voice app register a custom wake word or draw over apps *without* `SYSTEM_ALERT_WINDOW` + user OEM grants. If someone claims one, demand the `dev.mi.com` / `developers.xiaoai.mi.com` URL. We did not find it.
