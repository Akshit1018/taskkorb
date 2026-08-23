# Absent Capabilities

Only things a **voice companion** user would reasonably expect. Career/resume/job features are excluded.

Class: MUST HAVE / EXPECTED / DIFFERENTIATOR / POWER / NICE / IRRELEVANT.

| Absent thing | Next to which journey | Class | Why it matters | Frequency |
| --- | --- | --- | --- | --- |
| Account / no BYO key | First open | MUST HAVE | Gemini app and ChatGPT start from a login the user already has ([Gemini Live overview](https://gemini.google/overview/gemini-live/), [ChatGPT Voice how-to](https://jjtechish.substack.com/p/how-to-use-chatgpt-voice)). | Every new user |
| Authenticated token mint | Hosted mode | MUST HAVE | `/api/live-session` is anyone-who-passed-the-shared-password. ElevenLabs’ documented pattern is signed URL behind **your** auth ([ElevenLabs Next.js guide](https://elevenlabs.io/docs/eleven-agents/guides/quickstarts/next-js)). | Every session |
| Durable host | Entry | MUST HAVE | 1033 already happened. Quick tunnels are not a product. | Every share |
| Conversation history you can reopen | Return | EXPECTED | Gemini keeps Live in one thread ([Gemini Live](https://gemini.google/overview/gemini-live/)). We keep a capped local string. | Daily |
| Voice picker | Connect | EXPECTED | ChatGPT and Gemini expose voice settings ([Gemini Apps Help](https://support.google.com/gemini/answer/15274899), [Engadget](https://www.engadget.com/2230975/how-to-use-chatgpt-voice-mode/)). We hardcode Orus. | First session + preference |
| Language control | Talk | EXPECTED | Live API documents 70 languages ([Gemini Live API](https://ai.google.dev/gemini-api/docs/live-api)). We have a prompt sentence. | Every multilingual user |
| Mute / volume | Hear | EXPECTED | Playback can start loud. No control. | Every listen |
| Always-on or hands-free mode | Talk | EXPECTED | Competitors are tap-once live, not hold-a-button. Hold-to-talk is safer for cost; it is also more work. | Every turn |
| Proven barge-in | Speaking | EXPECTED | Gemini Live barge-in is a documented default ([Live API reference](https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/models/multimodal-live)). Ours is an untested interrupt flag. | Often |
| Session resume after drop | Disconnect | EXPECTED | Live tokens need resumption within expire windows ([ephemeral tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens.md.txt)). We remint or ask for the key again. | Common on mobile |
| Privacy policy / retention | First open | EXPECTED | Audio leaves the device. Footer is not a policy. | First trust decision |
| Cost / quota meter | Talk | EXPECTED | User’s or operator’s Gemini bill is unbounded except 180s bursts + silence RMS. | Every heavy user |
| Landing that explains the product | Entry | EXPECTED | `/` is the app or a password box. | First visit |
| Settings | Ready | EXPECTED | No voice, language, transcript on/off, reduced motion toggle. | Recurring |
| Undo Clear | Clear | EXPECTED | Confirm exists; no undo. | Occasional |
| Transcript search / turns / timestamps | Memory | POWER | Timestamped turns are how people find “what did it say.” | Return users |
| Tools / search / calendar | After talk | DIFFERENTIATOR for incumbents, IRRELEVANT until JTBD is “do things” | Gemini Live reaches Gmail/Drive/Calendar ([Gemini Live](https://gemini.google/overview/gemini-live/)). Taskkorb cannot act. | High for incumbents |
| Camera / screen share | Talk | IRRELEVANT unless vision is the job | Gemini Live has camera and screen ([Gemini Apps Help](https://support.google.com/gemini/answer/15274899)). Copying it would not create a reason to exist. | — |
| Collaboration | — | IRRELEVANT | One mouth, one orb. | — |
| Notifications | — | NICE | “Come back” has nothing to come back to. | — |
| Public API | — | NICE | We are a client of an API, not a platform. | — |
| Evals | Operator | MUST HAVE for quality | Prompt and model IDs can rot silently. | Continuous |
| Remote analytics | Operator | MUST HAVE for a launch | Console events answer nothing at 3 AM. | Continuous |
| iOS/Android app | Mobile persona | EXPECTED vs market | This audit’s users have been on iOS. Incumbents are apps. | Every mobile user |

## “They have this — why don’t we?”

| Capability | Problem it solves | Our method | Verdict |
| --- | --- | --- | --- |
| App login, no cloud key | Activation | BYO key or shared preview + server key | MUST HAVE — we lose before talk |
| Signed/ephemeral creds behind **user** auth | Stolen long-lived keys | Vite mint if env set | FOUNDATION — exists, unauthenticated |
| History thread | Return value | localStorage scraps | EXPECTED |
| Voice + language settings | Identity / accessibility | Hardcoded Orus | EXPECTED |
| Full-duplex | Natural interruption | Hold-to-talk + interrupt handler | EXPECTED to prove, not to copy blindly |
| Camera | Visual grounding | Absent | IRRELEVANT to current JTBD |
| Workspace tools | Do work | Absent | Only if Taskkorb becomes a task product |
| Distinct orb | Memory/identity | Shader sphere | DIFFERENTIATOR only if it becomes the product, not chrome |

## What would a user try next that is missing?

After first successful reply:

- Save this
- Hear that again
- Change the voice
- Switch to Hindi explicitly
- Make a task from what I said
- Come back tomorrow and continue

None of those actions exist except Export (a `.txt` download) and a capped local string.
