# Hostile Benchmark

Research date: 2026-08-23. Consumer products reconstructed from public docs and reviews, not from running those apps in this VM.

Sources used in this file are listed at the bottom.

## Capability graph

| Capability | Taskkorb | Gemini Live (app) | ChatGPT Voice / GPT-Live | ElevenLabs Agents (build) | Best pattern |
| --- | --- | --- | --- | --- | --- |
| Start talking | Password and/or API key, then hold Talk | Tap Live after Google login | Tap waveform after ChatGPT login | Signed URL from **your** backend | App login → one tap |
| Full-duplex | Hold-to-talk; interrupt handler untested | Partial / low-latency turn-based | Full-duplex GPT-Live | Full-duplex / WebRTC | Phone-call quality |
| History | localStorage scraps | Continuous thread + memories | Chat thread | Platform conversations | Account-scoped history |
| Camera / screen | Absent | Yes | Advanced Voice / planned on GPT-Live | Product-dependent | Only if JTBD needs vision |
| Tools | Absent | Search, Workspace, Maps, Home | Search / cards / delegated GPT | `clientTools` | Tools behind a job |
| Voices | Orus hardcoded | Voice picker | Voice + model quality settings | Voice IDs in session | User-chosen voice |
| Languages | Prompt sentence | App language + Live multilingual | Settings | Agent language override | Explicit control |
| Mobile | Mobile web, 812 KB | Native apps | iOS/Android/web/desktop | SDK + RN examples | Native or tiny PWA |
| Creds in browser | Ephemeral token **or** long-lived key | Platform session | Platform session | Signed URL / conversation token | Short-lived, server-minted, user-auth’d |
| Price to user | User’s Gemini bill or operator’s | Free tier + Google AI plans | Free mini / Plus | Usage (~$0.10–0.20/min cited) | No surprise BYO cloud key |
| Distinct visual | Custom orb | Gemini UI | Floating orb | Widget / custom | Identity that does work |

## Them vs us vs best-in-class

### Onboarding

- **Them:** account the user already has.
- **Us:** create a Google API key or share an operator key via Vite.
- **Best:** ElevenLabs private-agent pattern — browser never sees the long-lived key; backend issues a signed URL after **application** auth ([ElevenLabs Next.js](https://elevenlabs.io/docs/eleven-agents/guides/quickstarts/next-js)).

We implemented the mint half. We skipped the user-auth half.

### Conversation quality

- **Them:** GPT-Live is sold as listen-while-speaking ([andrew.ooo July 2026 comparison](https://andrew.ooo/answers/gpt-live-vs-advanced-voice-vs-gemini-live-full-duplex-july-2026/), [Apidog](https://apidog.com/blog/gpt-live-vs-gemini-live/)). Gemini Live is camera + ecosystem ([Gemini Live](https://gemini.google/overview/gemini-live/)).
- **Us:** UNVERIFIED audio quality. Hold-to-talk is a cost control, not a quality win.
- **Best:** measure latency and barge-in on a script. We have no eval harness.

### Retention

- **Them:** threads, memories, connected apps.
- **Us:** refresh keeps a paragraph.
- **Best:** history that creates the next session’s context automatically.

### Why a user would still open Taskkorb

Honest list:

1. They want to test Gemini Live with their own key.
2. They like the orb enough to tolerate the key gate.
3. The operator hosted a token and sent a password.

That is a demo audience, not a market.

## Open-source intelligence

Did we spend time building an inferior version of a solved problem?

| Problem | Existing work | Our version | Verdict |
| --- | --- | --- | --- |
| Gemini Live browser client | `google-gemini/gemini-live-api-examples`; community Next templates | Custom Lit god component | ADAPT — we already have the loop; replacing Lit is prestige |
| Ephemeral / signed creds | Google `authTokens.create`; ElevenLabs signed URL | Vite `/api/live-session` | REIMPLEMENT PATTERN — correct idea, missing user auth |
| Conversational SDK | `@elevenlabs/client` session lifecycle | Hand-rolled connectGeneration | KEEP ours — different vendor |
| 3D orb | Three.js examples; ChatGPT already has an orb | Custom shaders + unused EXR | SIMPLIFY — EXR is dead weight |
| Analytics | any event pipeline | console.info | IRRELEVANT until there are users |

We did not need another agent framework. We needed a reason the Gemini app is insufficient.

## Industry standard vs actual

| Subsystem | Expected | Actual | Gap | Consequence |
| --- | --- | --- | --- | --- |
| Authentication | User identity → short-lived cred | Shared password + optional server key or BYO | No identity | Stolen preview password = stolen mint |
| Onboarding | Value before credentials | Credentials before value | Inverted | Bounce |
| Form design | Validate, loading, errors | Now present for the key form | Older findings outdated | Still a developer form |
| API design | Versioned, authn, idempotent | One GET, IP cooldown | Fine for a demo | Not a product API |
| Database | None required if no accounts | None | Honest | No return value |
| Observability | Know when Live is down | Console | Blind | 3 AM silence |
| Mobile UX | Thumb-first, one tap | Hold disc on WebGL | High cost | Missed talks |
| Accessibility | Landmarks, reduced motion | Partial | Incomplete | AT users guess |
| AI tool use | Only if the job needs it | None | Correct until JTBD changes | Orb cannot act |

## Sources

- [Gemini Live – Ask AI a question in any mode you choose](https://gemini.google/overview/gemini-live/)
- [Talk naturally with Gemini Live - Gemini Apps Help](https://support.google.com/gemini/answer/15274899)
- [Gemini Live API overview](https://ai.google.dev/gemini-api/docs/live-api)
- [Gemini Live API reference](https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/models/multimodal-live)
- [HOW TO: Use ChatGPT Voice - Techish](https://jjtechish.substack.com/p/how-to-use-chatgpt-voice)
- [How To Use ChatGPT's New Voice Mode - Engadget](https://www.engadget.com/2230975/how-to-use-chatgpt-voice-mode/)
- [GPT-Live vs Gemini Live - Apidog](https://apidog.com/blog/gpt-live-vs-gemini-live/)
- [GPT-Live vs Advanced Voice vs Gemini Live - andrew.ooo](https://andrew.ooo/answers/gpt-live-vs-advanced-voice-vs-gemini-live-full-duplex-july-2026/)
- [ChatGPT Voice vs Gemini Live vs Siri comparison](https://tools.inyourleague.net/en/chatgpt-voice-vs-gemini-live-vs-siri-comparison-en/)
- [ElevenLabs Agents Next.js quickstart](https://elevenlabs.io/docs/eleven-agents/guides/quickstarts/next-js)
- [ElevenLabs JS client README](https://github.com/elevenlabs/packages/blob/f61e7282/packages/client/README.md)
- [Ephemeral tokens - Gemini API](https://ai.google.dev/gemini-api/docs/ephemeral-tokens.md.txt)
