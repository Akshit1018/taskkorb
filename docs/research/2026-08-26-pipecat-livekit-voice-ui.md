# Pipecat vs LiveKit Agents: official facts for an in-app voice orb

Research only. **No product code in this change.** Written 26 Aug 2026.

Question: what do the **official** Pipecat and LiveKit Agents docs actually ship for realtime voice, a visual “orb,” licenses, mobile, and **how talk maps to UI inside our app** (not drawing over other apps).

**Hard rule:** neither official stack documents an OS overlay (`SYSTEM_ALERT_WINDOW`, draw-over-other-apps, iOS overlay window). Visualizers, Aura, Radial, VoiceVisualizer, and UIWorker all render **inside the host app or host webpage**. LiveKit’s embed is a script-tag pop-up **on that site**, not an overlay of third-party apps.

Firecrawl CLI in this environment was **unauthenticated** and the keyless free tier was rate-limited. Facts below are from official docs/repos fetched the same day. This is **not legal advice**. Licenses and hosted products change.

---

## Answer first

**Copy the event→UI contract, not an overlay. Neither vendor ships a named “orb.”**

| Copy into an in-app voice orb | Do not copy / do not claim |
|---|---|
| **Talk → UI is first-class.** Pipecat: VAD + audio-level events on every official client (JS/React/RN/iOS/Android). LiveKit: `lk.agent.state` (`listening` / `thinking` / `speaking`) + `audioTrack` volume into Agents UI visualizers. | That either product is a floating orb over Messages, Safari, or other apps. Official UIs are **in-app components**. |
| LiveKit **Aura** (shader “pulsing energy field”) or **Radial** (circular, expands outward) as the closest official “orb-like” widgets. [Prebuilt visualizers](https://docs.livekit.io/frontends/agents-ui/audio-visualizer/prebuilt/) · [Aura](https://docs.livekit.io/reference/components/agents-ui/component/agent-audio-visualizer-aura/) | That official docs contain a component named “orb.” They do not. |
| Pipecat **VoiceVisualizer** (canvas bars) plus Voice UI Kit’s `visualization?: "bar" \| "circle"` on `BotAudioPanel`. Drive a custom orb from `LocalAudioLevel` / `RemoteAudioLevel` + `BotStartedSpeaking` / `UserStartedSpeaking`. [Components](https://docs.pipecat.ai/api-reference/client/react/components) · [Media](https://docs.pipecat.ai/client/concepts/media-management) · [Events](https://docs.pipecat.ai/client/concepts/events-and-callbacks) | That Pipecat ships a shader orb. Official visualizer is bars (plus a circle option in Voice UI Kit source). |
| **Pipecat UIWorker**: voice agent talks; a second worker **drives the same app’s GUI** (scroll, highlight, click, fill). Parallel pattern: every user turn silently updates the screen. [Controlling the UI](https://docs.pipecat.ai/pipecat/learn/ui-worker) | Using UIWorker to control **other** apps. Snapshots/commands are the **client’s own** accessibility tree. |
| **LiveKit RPC + state sync** for the same pattern (talk → form fields on the frontend). Official Anam tutorial: tools call `perform_rpc()`; the React page updates. [Agent state](https://docs.livekit.io/frontends/build/agent-state/) · [Healthcare + Anam](https://livekit.com/blog/build-healthcare-intake-assistant-anam-avatar) | Treating LiveKit web embed as an OS overlay. It is a **bottom-right launcher on your website**. [Embed](https://docs.livekit.io/agents/start/embed/) |
| **Mobile is official on both.** Pipecat: React Native, native Swift, native Kotlin. LiveKit: SwiftUI (iOS/macOS/visionOS/tvOS), Android Compose, Flutter, React Native — each with a bar visualizer. | That mobile is web-only or unofficial. |
| Study **BSD-2-Clause** Pipecat / Voice UI Kit with attribution. Study **Apache-2.0** LiveKit Agents with NOTICE/attribution. Both allow closed-source products. | Claiming either is AGPL. Pipecat Cloud / LiveKit Cloud billing is separate from the OSS licenses. |

**v1 orb model to copy:** in-app surface that binds **agent state + audio level** to one visual (Aura/Radial/custom shader, or a circle driven by Pipecat levels). Talk mutates **our** screens via UIWorker / RPC, never other apps.

---

## Comparison (official facts only)

| | **Pipecat** (Daily) | **LiveKit Agents** |
|---|---|---|
| **Official docs** | [docs.pipecat.ai](https://docs.pipecat.ai/overview/pipecat) · [llms.txt](https://docs.pipecat.ai/llms.txt) | [docs.livekit.io/agents](https://docs.livekit.io/agents/) · [llms.txt](https://docs.livekit.io/llms.txt) |
| **Source** | [github.com/pipecat-ai/pipecat](https://github.com/pipecat-ai/pipecat) | [github.com/livekit/agents](https://github.com/livekit/agents) |
| **What it is** | Open-source **Python** framework: pipeline of STT → LLM → TTS (or speech-to-speech). Transport-agnostic (Daily, SmallWebRTC, LiveKit, phone, WhatsApp). [Intro](https://docs.pipecat.ai/pipecat/get-started/introduction) | Open-source **Python + Node.js** framework: `AgentSession` joins a LiveKit room as a participant. STT-LLM-TTS or realtime S2S. [Agents](https://docs.livekit.io/agents/) |
| **Realtime voice** | Official: 500–800 ms typical round-trip. VAD (Silero in quickstart). Cascaded **or** OpenAI Realtime / other S2S. [Intro](https://docs.pipecat.ai/pipecat/get-started/introduction) · [Quickstart](https://docs.pipecat.ai/pipecat/get-started/quickstart) | Official: voice in **browser, telephone, or native app**. Pipeline types + realtime models (e.g. OpenAI Realtime). [Voice AI](https://docs.livekit.io/agents/start/voice-ai/) |
| **Named “orb”** | **None** in official docs. | **None** in official docs. |
| **Closest official visual** | `VoiceVisualizer` canvas bars. Voice UI Kit `BotAudioPanel` `visualization?: "bar" \| "circle"`. [React components](https://docs.pipecat.ai/api-reference/client/react/components) · [voice-ui-kit BotAudioPanel](https://github.com/pipecat-ai/voice-ui-kit/blob/main/package/src/components/panels/BotAudioPanel.tsx) | Agents UI: Bar, Grid, **Radial** (circular), Wave, **Aura** (glowing organic field, Unicorn Studio). Same props: `audioTrack`, `state`, `size`. Swift `AgentBarAudioVisualizer`, Android `VoiceAssistantBarVisualizer`, Flutter `SoundWaveformWidget`. [Prebuilt](https://docs.livekit.io/frontends/agents-ui/audio-visualizer/prebuilt/) |
| **Talk → UI (same app)** | RTVI events + **UIWorker** (`ui-snapshot` / `ui-command`: scroll, highlight, click, fill). [UIWorker](https://docs.pipecat.ai/pipecat/learn/ui-worker) · [Events](https://docs.pipecat.ai/client/concepts/events-and-callbacks) | `useAgent()` / `rememberAgent()` state getters + **RPC** + state sync. [Agent state](https://docs.livekit.io/frontends/build/agent-state/) |
| **Overlay other apps** | **Not documented.** Clients are in-app. | **Not documented.** Embed = in-page widget. iOS `UIBackgroundModes` audio/PiP is **this app’s** media, not drawing on other apps. [Embed](https://docs.livekit.io/agents/start/embed/) · [Publish](https://docs.livekit.io/transport/media/publish/) |
| **License (core)** | **BSD-2-Clause**, Copyright Daily 2024–2026. [LICENSE](https://github.com/pipecat-ai/pipecat/blob/main/LICENSE) · [Intro](https://docs.pipecat.ai/pipecat/get-started/introduction) | **Apache License 2.0**. [LICENSE](https://github.com/livekit/agents/blob/main/LICENSE) · GitHub license badge |
| **UI kit license** | Voice UI Kit **BSD-2-Clause**, Copyright Daily 2024–2025. [LICENSE](https://github.com/pipecat-ai/voice-ui-kit/blob/main/LICENSE) | Agents UI is shadcn-style components you copy into the app ([blog](https://livekit.com/blog/design-voice-ai-interfaces-with-agents-ui)); client SDKs are Apache-class LiveKit OSS. Confirm the specific repo before vendoring. |
| **Mobile official** | JS, React, **React Native**, **iOS Swift**, **Android Kotlin**, desktop/embedded. [Clients](https://docs.pipecat.ai/client/introduction) · [iOS](https://docs.pipecat.ai/api-reference/client/ios/overview) · [Android](https://docs.pipecat.ai/api-reference/client/android/overview) | **SwiftUI** iOS/macOS/visionOS/tvOS, **Android Compose**, **Flutter**, **React Native**, web. [Swift starter](https://docs.livekit.io/frontends/start/starter-apps/swiftui/) · [Android starter](https://docs.livekit.io/frontends/start/starter-apps/android/) · [RN starter](https://docs.livekit.io/frontends/start/starter-apps/react-native/) |
| **Hosted runtime** | [Pipecat Cloud](https://www.daily.co/pricing/pipecat-cloud) (pay providers + Daily). | LiveKit Cloud (free tier advertised: 1,000 agent session minutes / month on [customers](https://livekit.io/customers)). |

---

## 1. Pipecat — official

### Realtime voice

[Introduction](https://docs.pipecat.ai/pipecat/get-started/introduction): open-source Python framework for voice and multimodal agents. **BSD-2 license.** Choose STT / LLM / TTS; host yourself or Pipecat Cloud.

Typical voice loop ([same page](https://docs.pipecat.ai/pipecat/get-started/introduction) · [overview](https://docs.pipecat.ai/overview/pipecat)):

1. Transport receives user audio (browser, phone, …)
2. Speech recognition → text
3. LLM responds
4. TTS → speech
5. Transport streams audio back

Official latency claim: **500–800 ms** round-trip in most cases.

[Quickstart](https://docs.pipecat.ai/pipecat/get-started/quickstart): browser mic over WebRTC → Silero VAD → Deepgram STT → OpenAI GPT → Cartesia TTS → browser playback. **RTVI is on by default** so web/mobile clients get the event stream.

Server can also use speech-to-speech (OpenAI Realtime, etc.) instead of cascaded STT/LLM/TTS.

### Visual “orb”

**Official docs do not name an orb.**

What they do ship:

| Official piece | What it is |
|---|---|
| [`VoiceVisualizer`](https://docs.pipecat.ai/api-reference/client/react/components) | React canvas: audio-level **bars** (`participantType` local or bot; bar color/count/gap/width/maxHeight). |
| [Media management](https://docs.pipecat.ai/client/concepts/media-management) | Same bars on web; RN/iOS/Android examples bind `LocalAudioLevel` / `RemoteAudioLevel` to **your** `View` / SwiftUI / Compose. |
| [Voice UI Kit](https://docs.pipecat.ai/client/voice-ui-kit) · [voiceuikit.pipecat.ai](https://voiceuikit.pipecat.ai/) | Pre-built React: `VoiceVisualizer`, control bar, transcripts. README example puts `<VoiceVisualizer participantType="bot" />` in a full-screen container. |
| Voice UI Kit `BotAudioPanel` | Prop `visualization?: "bar" \| "circle"` in [source](https://github.com/pipecat-ai/voice-ui-kit/blob/main/package/src/components/panels/BotAudioPanel.tsx). That is the only official “circle” visual found. |

To build an orb: subscribe to levels + speaking events and draw it. Docs show a bar/meter, not a shader sphere.

### How talk maps to UI (in-app)

Two official layers.

**A. Events (every client SDK)** — [Events & callbacks](https://docs.pipecat.ai/client/concepts/events-and-callbacks)

Voice activity (VAD, not raw RMS):

| Event | When | Typical UI |
|---|---|---|
| `UserStartedSpeaking` / `UserStoppedSpeaking` | VAD turn | Orb → listening / idle |
| `BotStartedSpeaking` / `BotStoppedSpeaking` | Bot audio | Orb → speaking |
| `LocalAudioLevel` / `RemoteAudioLevel` | Gain 0–1, continuous | Pulse amplitude |
| `UserMuteStarted` / `UserMuteStopped` | Server ignoring mic | Muted chrome (mic still open) |
| `UserTranscript` / `BotOutput` | Partial + final text | Transcript |
| `BotLlmStarted` / `BotLlmStopped` | Inference | Thinking |
| `LLMFunctionCallStarted` / `InProgress` / `Stopped` | Tools | Spinner / “working on…” |
| `ServerMessage` | Custom bot→client | App-defined UI |

Same events exist on **React, JS, React Native, iOS (`PipecatClientDelegate`), Android (`PipecatEventCallbacks`)**. iOS: hop to `@MainActor` before touching UI.

**B. UIWorker (talk drives the same GUI)** — [Controlling the UI](https://docs.pipecat.ai/pipecat/learn/ui-worker)

Official split: voice agent owns conversation; `UIWorker` owns the screen over RTVI:

- Client → server: accessibility **`ui-snapshot`** + `sendUIEvent`
- Server → client: **`ui-command`** — `scroll_to`, `highlight`, `select_text`, `click`, `set_input_value`, or app-defined `send_command`

Two patterns:

| | Delegation | Parallel handling |
|---|---|---|
| Trigger | Voice LLM calls a tool | Every `on_user_turn_stopped` |
| Who speaks | Often the worker, or voice LLM phrases it | Voice agent; worker is silent |
| Best when | Only some turns need the screen | Every turn should mutate UI |

Official shopping-list example: user says “check eggs”; worker sends `set_checked` — **on the client page**, not another process.

This is **not** overlaying other apps. The snapshot is **this** client’s tree.

### Licenses

| Artifact | License | Source |
|---|---|---|
| `pipecat-ai` core | **BSD-2-Clause**, Copyright (c) 2024–2026 Daily | [LICENSE](https://github.com/pipecat-ai/pipecat/blob/main/LICENSE) · docs: “free to use under the BSD-2 license” |
| Voice UI Kit | **BSD-2-Clause**, Copyright (c) 2024–2025 Daily | [LICENSE](https://github.com/pipecat-ai/voice-ui-kit/blob/main/LICENSE) |
| Pipecat Cloud | Hosted; you pay Daily + model vendors | [Intro](https://docs.pipecat.ai/pipecat/get-started/introduction) |

BSD-2: keep copyright + disclaimer. Closed-source product is allowed. Not legal advice.

### Mobile

[Client introduction](https://docs.pipecat.ai/client/introduction): official SDK family is **JavaScript, React, React Native, iOS, Android, desktop/embedded**. They implement [RTVI 1.0](https://docs.pipecat.ai/client/rtvi-standard) (June 2025).

| Platform | Official entry |
|---|---|
| iOS | Swift PM: `pipecat-client-ios` + Daily / SmallWebRTC / Gemini / OpenAI transports. [iOS overview](https://docs.pipecat.ai/api-reference/client/ios/overview) |
| Android | Kotlin, e.g. `ai.pipecat:daily-transport:1.2.0`. [Android overview](https://docs.pipecat.ai/api-reference/client/android/overview) |
| React Native | RN SmallWebRTC + `DailyMediaManager`. [Building a voice UI](https://docs.pipecat.ai/client/guides/building-a-voice-ui) — audio playback is automatic (no hidden `<audio>`). |

Docs do not describe a system overlay permission. Media is the app’s mic/speaker.

---

## 2. LiveKit Agents — official

### Realtime voice

[Agents](https://docs.livekit.io/agents/): Python or Node.js program joins a LiveKit room as a realtime participant. `AgentSession` collects input, runs the pipeline, publishes output, **emits events**.

[Voice AI quickstart](https://docs.livekit.io/agents/start/voice-ai/): speak in **browser, telephone, or native app**. Two pipelines:

- STT–LLM–TTS (Deepgram / LLM / Cartesia in the GitHub README example)
- Realtime speech-to-speech (`openai.realtime.RealtimeModel`)

[Sessions](https://docs.livekit.io/agents/logic/sessions/): `RoomIO` bridges session ↔ room tracks (audio, optional vision).

### Visual “orb”

**Official docs do not name an orb.** They do ship orb-adjacent visuals.

[Prebuilt audio visualizers](https://docs.livekit.io/frontends/agents-ui/audio-visualizer/prebuilt/): driven by **volume + agent state** (`listening`, `thinking`, `speaking`). Swap variants; same props.

| Component | Official description | Orb-like? |
|---|---|---|
| `AgentAudioVisualizerBar` | Vertical bars | No |
| `AgentAudioVisualizerGrid` | Pulsing grid | No |
| `AgentAudioVisualizerRadial` | **Circular, expands outward.** “Centered, prominent agent displays.” | **Yes (circle)** |
| `AgentAudioVisualizerWave` | Waveform | No |
| `AgentAudioVisualizerAura` | **“Glowing, organic aura”** / “pulsing energy field.” Unicorn Studio. Shader. | **Yes (closest official orb)** |

[Aura reference](https://docs.livekit.io/reference/components/agents-ui/component/agent-audio-visualizer-aura/): `size` (`icon`…`xl`), `state`, `color`, `colorShift`, `audioTrack`. States in the storybook include `idle`, `listening`, `thinking`, `speaking`, `connecting`, `failed`.

[Custom shaders](https://docs.livekit.io/frontends/agents-ui/audio-visualizer/custom/): copy Aura; Framer Motion between states; pulse on thinking, volume on speaking, settle when idle.

Native (same prebuilt page):

- Swift: `AgentBarAudioVisualizer` + `participant.agentState`
- Android: `rememberVoiceAssistant()` + `VoiceAssistantBarVisualizer`
- Flutter: `RoomOptions(enableVisualizer: true)` + `SoundWaveformWidget`

Face-style visuals are **avatars** (Tavus, Anam, LemonSlice plugins) — video tracks, not orbs.

### How talk maps to UI (in-app)

**A. Published agent state** — [Agent state](https://docs.livekit.io/frontends/build/agent-state/)

Agent publishes `lk.agent.state`. Official states: `connecting`, `pre-connect-buffering`, `initializing`, `idle`, `listening`, `thinking`, `speaking`, `disconnected`, `failed`.

Prefer getters over raw enum:

| Getter | Meaning | States |
|---|---|---|
| `canListen` | User may speak | buffering, listening, thinking, speaking |
| `isConnected` | In room | listening, thinking, speaking |
| `isPending` | Connecting / setup | connecting, initializing, idle |
| `isFinished` | Terminal | disconnected, failed |

React `useAgent()`, Swift `session.agent`, Android `rememberAgent()`. Official example: show chat chrome iff `canListen`; show error iff `isFinished` + `failureReasons`.

**B. Custom talk → screen** — same page: **state sync** + **RPC** (not the built-in lifecycle). Official Anam healthcare post: tools call `local_participant.perform_rpc()`; frontend `registerRpcMethod()` fills the **same** form. [Blog](https://livekit.com/blog/build-healthcare-intake-assistant-anam-avatar)

**C. Web embed is still your page** — [Agent Embed Widget](https://docs.livekit.io/agents/start/embed/): script tag → launcher **bottom-right of that website** → pop-up to talk. Allowed origins. Not an OS overlay. Open-source sibling: [agent-starter-embed](https://github.com/livekit-examples/agent-starter-embed) (“floating widget **or inline**”).

**D. iOS background / PiP** — [Publish](https://docs.livekit.io/transport/media/publish/): `UIBackgroundModes` audio + Picture in Picture so **this app** can keep audio (and optional PiP of **its** video). That is not drawing a UI on other apps.

### Licenses

| Artifact | License | Source |
|---|---|---|
| `livekit/agents` | **Apache License 2.0** | [LICENSE](https://raw.githubusercontent.com/livekit/agents/main/LICENSE) · GitHub “Apache License 2.0” |
| Client / component SDKs | LiveKit OSS (confirm each repo; typically Apache-2.0) | [client-sdk-android](https://github.com/livekit/client-sdk-android), [components-swift](https://github.com/livekit/components-swift), [components-android](https://github.com/livekit/components-android) |
| LiveKit Cloud | Hosted; OSS can self-host | [About](https://docs.livekit.io/intro/about/) |

Apache-2.0: keep license + NOTICE; patent grant; closed-source product allowed. Not legal advice.

### Mobile

Official agent frontends:

| Starter | Platforms | Visual |
|---|---|---|
| [SwiftUI](https://docs.livekit.io/frontends/start/starter-apps/swiftui/) | iOS, macOS, **visionOS, tvOS** | “Native SwiftUI interface with audio visualizer” — [agent-starter-swift](https://github.com/livekit-examples/agent-starter-swift) |
| [Android](https://docs.livekit.io/frontends/start/starter-apps/android/) | Jetpack Compose | Material + audio visualizer — [agent-starter-android](https://github.com/livekit-examples/agent-starter-android) |
| [React Native](https://docs.livekit.io/frontends/start/starter-apps/react-native/) | iOS + Android | Audio visualizer — [agent-starter-react-native](https://github.com/livekit-examples/agent-starter-react-native) |
| [Flutter](https://docs.livekit.io/reference/components/android/) (index lists Flutter starter) | Cross-platform | `SoundWaveformWidget` |

Voice AI quickstart explicitly includes **native app**.

---

## 3. Talk → UI map (neither is an overlay)

```
User speaks
    │
    ├─ Pipecat: UserStartedSpeaking + LocalAudioLevel
    │         → orb listening / pulse
    │         → optional UIWorker command on THIS page
    │
    └─ LiveKit: state=listening + mic track volume
              → Aura/Radial/Bar
              → optional RPC into THIS React/Swift/Compose tree

Bot thinks / speaks
    │
    ├─ Pipecat: BotLlmStarted → BotStartedSpeaking + RemoteAudioLevel + BotOutput
    └─ LiveKit: state=thinking|speaking + agent audioTrack
```

| Want | Official mechanism | Not official |
|---|---|---|
| Orb reacts to talk | Levels + speaking / `agent.state` | A packaged “Orb” component |
| Voice fills a form in **our** app | Pipecat UIWorker or LiveKit RPC | Accessibility APIs on other apps |
| Widget on **our** website | LiveKit embed / Voice UI Kit full-screen | Overlay of Mail, Maps, other apps |
| Face instead of orb | Tavus / Anam / LemonSlice **video** plugins | — |

---

## 4. Six real projects (official customer or product URLs)

Starters are omitted here. These are **shipped products** named on Daily or LiveKit official customer pages, plus their public sites.

| # | Product | Stack (as claimed officially) | Why it matters | URLs |
|---|---|---|---|---|
| 1 | **ChatGPT voice** | LiveKit: “OpenAI uses LiveKit to deliver voice to millions of ChatGPT users.” | Largest production LiveKit voice client. In-app / in-web, not an OS overlay. | [livekit.io/customers](https://livekit.io/customers) · product: [chatgpt.com](https://chatgpt.com) |
| 2 | **Lemon Slice** | Daily case study: **Pipecat + Daily** for realtime talking characters (1M+ clips, 25 fps). **Also** official LiveKit Agents avatar plugin. | Voice + **visual character in the product UI**. Homepage demos. | [daily.co/customers/lemonslice](https://www.daily.co/customers/lemonslice/) · [lemonslice.com](https://lemonslice.com/) · [LiveKit plugin](https://docs.livekit.io/agents/models/avatar/plugins/lemonslice/) |
| 3 | **Tavus** | Daily: “Tavus is building the OS of human-AI interaction **with Pipecat and Daily**.” LiveKit: official avatar plugin + demo. | Face/video presence, not an orb; same “talk has a visual.” | [daily.co/customers](https://www.daily.co/customers/) · [tavus.io](https://www.tavus.io/) · [LiveKit Tavus](https://docs.livekit.io/agents/models/avatar/plugins/tavus/) |
| 4 | **SuperDial** | Daily: “Superdial uses **Pipecat** to scale automated AI phone calls for healthcare.” | Phone-first Pipecat in production (RCM). Little visual orb — voice maps to **backend workflows**, not a floating UI. | [daily.co/customers](https://www.daily.co/customers/) · [superdialplus.com](https://superdialplus.com/) |
| 5 | **Vapi** | Daily: “Vapi leverages Daily to power its realtime infrastructure for low latency voice AI.” | Voice-agent **platform** on Daily transport (Pipecat-adjacent ecosystem). | [daily.co/customers](https://www.daily.co/customers/) · [vapi.ai](https://vapi.ai) |
| 6 | **NVIDIA digital humans / Voice Agents blueprint** | Daily: “NVIDIA builds digital humans **with Pipecat**.” NVIDIA × Daily blueprint: Voice Agents for Conversational AI **powered by Pipecat and NVIDIA NIM**. | Official enterprise reference, not a consumer orb. | [daily.co/customers](https://www.daily.co/customers/) · [Daily × NVIDIA post](https://www.daily.co/blog/daily-and-nvidia-collaborate-to-simplify-voice-agents-at-scale/) |

Also on [LiveKit customers](https://livekit.io/customers) (voice, not orb): **SAP** enterprise voice; **Skydio** (video/teleop, not a voice orb). Do not treat those as orb references.

Official **reference UIs** (not customer products): [Voice UI Kit](https://voiceuikit.pipecat.ai/) · [Agents UI / Aura](https://livekit.com/blog/design-voice-ai-interfaces-with-agents-ui) · [agent-starter-swift](https://github.com/livekit-examples/agent-starter-swift) · [agent-starter-android](https://github.com/livekit-examples/agent-starter-android).

---

## 5. What Taskkorb / an in-app orb should take

1. **In-app only.** Official talk→UI is events + commands on **our** tree. Do not market overlay-of-other-apps; neither vendor documents it.
2. **Prefer LiveKit Aura or Radial** if we want a shipped orb-like widget (shader + `listening`/`thinking`/`speaking`). **Prefer Pipecat levels + custom circle** if we want BSD-2 and transport choice (including LiveKit as a Pipecat transport).
3. **Do not wait for an official “Orb” component.** It is not in either docs index.
4. **Mobile:** both have native iOS + Android. LiveKit also Flutter + visionOS starters.
5. **Licenses are product-friendly** (BSD-2 / Apache-2). Keep notices. Cloud minutes are optional.

---

## Sources

- [Pipecat overview](https://docs.pipecat.ai/overview/pipecat)
- [Pipecat introduction (BSD-2, 500–800 ms)](https://docs.pipecat.ai/pipecat/get-started/introduction)
- [Pipecat quickstart / RTVI](https://docs.pipecat.ai/pipecat/get-started/quickstart)
- [Pipecat docs index](https://docs.pipecat.ai/llms.txt)
- [Pipecat client SDKs](https://docs.pipecat.ai/client/introduction)
- [Pipecat events](https://docs.pipecat.ai/client/concepts/events-and-callbacks)
- [Pipecat media / visualizer](https://docs.pipecat.ai/client/concepts/media-management)
- [Pipecat React components](https://docs.pipecat.ai/api-reference/client/react/components)
- [Pipecat Voice UI Kit docs](https://docs.pipecat.ai/client/voice-ui-kit)
- [Pipecat UIWorker](https://docs.pipecat.ai/pipecat/learn/ui-worker)
- [Pipecat iOS SDK](https://docs.pipecat.ai/api-reference/client/ios/overview)
- [Pipecat Android SDK](https://docs.pipecat.ai/api-reference/client/android/overview)
- [Pipecat LICENSE](https://github.com/pipecat-ai/pipecat/blob/main/LICENSE)
- [Voice UI Kit](https://github.com/pipecat-ai/voice-ui-kit/) · [LICENSE](https://github.com/pipecat-ai/voice-ui-kit/blob/main/LICENSE)
- [LiveKit Agents](https://docs.livekit.io/agents/)
- [LiveKit Voice AI quickstart](https://docs.livekit.io/agents/start/voice-ai/)
- [LiveKit AgentSession](https://docs.livekit.io/agents/logic/sessions/)
- [LiveKit agent state](https://docs.livekit.io/frontends/build/agent-state/)
- [LiveKit prebuilt visualizers](https://docs.livekit.io/frontends/agents-ui/audio-visualizer/prebuilt/)
- [LiveKit Aura](https://docs.livekit.io/reference/components/agents-ui/component/agent-audio-visualizer-aura/)
- [LiveKit custom visualizer](https://docs.livekit.io/frontends/agents-ui/audio-visualizer/custom/)
- [LiveKit Agents UI blog](https://livekit.com/blog/design-voice-ai-interfaces-with-agents-ui)
- [LiveKit embed](https://docs.livekit.io/agents/start/embed/)
- [LiveKit media publish / PiP](https://docs.livekit.io/transport/media/publish/)
- [LiveKit Agents LICENSE](https://raw.githubusercontent.com/livekit/agents/main/LICENSE)
- [LiveKit customers](https://livekit.io/customers)
- [Daily + Pipecat customers](https://www.daily.co/customers/)
- [Lemon Slice case study](https://www.daily.co/customers/lemonslice/)
- [Lemon Slice](https://lemonslice.com/)
- [Tavus](https://www.tavus.io/)
- [SuperDial](https://superdialplus.com/)
- [Daily × NVIDIA](https://www.daily.co/blog/daily-and-nvidia-collaborate-to-simplify-voice-agents-at-scale/)
