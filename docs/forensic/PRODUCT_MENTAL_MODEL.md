# Product Mental Model

Built before attacking individual features.

## What this product is actually trying to become

A **visible voice**. The user talks; a sphere proves it heard; a voice answers.

The architecture is a single-tab Gemini Live client with a Three.js mascot. Later docs say tasks/memory/tools can attach later. Those layers are not present and must not be inferred.

The name “Taskkorb” and the system instruction (“plan next steps”) lean toward a thinking partner. The implementation is a **stateless audio pipe with a leftover transcript**.

## Target user

**Intended (from code + vision):** a person who wants to think out loud and see listening.

**Actual reachable user today:** a developer or tester who already has a Gemini API key, or an operator who put `GEMINI_API_KEY` on the Vite process and shared a preview password.

**Not the user:** a non-technical mobile person who already has Gemini or ChatGPT installed. That person will never complete onboarding here.

## Job to be done

Primary JTBD the code can serve: “Talk to Gemini Live in a browser without installing an app.”

That job is already served by [Gemini Live in the Gemini app](https://gemini.google/overview/gemini-live/) and [ChatGPT Voice / GPT-Live](https://www.engadget.com/2230975/how-to-use-chatgpt-voice-mode/).

A second JTBD the name implies — “capture and keep work from speech” — is not implemented.

## Expected aha

The aha is supposed to be: hold Talk → orb moves → voice answers.

Time-to-aha on the default path:

1. Survive the URL (tunnel 1033 is a known failure)
2. Preview password (if set)
3. Obtain or already possess a Gemini key (unless hosted mint works)
4. Allow microphone
5. Speak

That is not a 10-second aha. ChatGPT’s aha is: tap the waveform icon ([HOW TO: Use ChatGPT Voice](https://jjtechish.substack.com/p/how-to-use-chatgpt-voice)).

## Recurring value

None accumulates.

- Transcripts are a 2400-character local scrap.
- The model does not remember the user tomorrow.
- No tasks, no saved voices, no personalization, no connected apps.

A 30-day user is a first-day user with a slightly longer `localStorage` string.

## Where the user should spend time

On the orb, talking.

Where they actually spend time: the key gate, Google Cloud key creation, reconnect, and wondering whether they are connected.

## Supposed moat

The only non-copied asset is the **orb as identity**. It is currently wallpaper. Incumbents already use orbs/waveforms ([Engadget on ChatGPT Voice](https://www.engadget.com/2230975/how-to-use-chatgpt-voice-mode/)). A custom shader is not a moat.

There is no proprietary data, no distribution, no workflow lock-in.

## What the architecture says the founders intended

AI Studio “Audio Orb” export (`metadata.json` still requests only `microphone`). Someone renamed it Taskkorb and added a session reducer, PCM tests, and a Vite token issuer.

Intent in the code: make the demo trustworthy enough to show people.

Intent in the name: something about tasks.

Those are different products.

## Where implementation drifted

| Intended (docs/name) | Implemented |
| --- | --- |
| Companion with memory | localStorage scraps |
| Task helper | 7-line system prompt |
| Production voice app | Vite middleware + BYO key |
| Hosted service | trycloudflare + shared password |
| Hindi-capable | Prompt line + Orus voice |

## Glued-on parts

- Three.js postprocessing stack for a sphere that does not need a composer
- Orphan `piz_compressed.exr` (3.3 MB, unused)
- `utils.ts` compatibility re-export
- Preview password as a stand-in for auth
- Product memory markdown larger than the application surface

The voice loop is one system. Everything else is either a lock in front of it or documentation about what it is not.

## Inconsistencies to attack later

1. Name vs capability (Taskkorb stores no tasks).
2. Tagline vs onboarding (speak vs paste a cloud key).
3. Vision journey still says “paste a key / reset” after hosted token and Clear replaced Reset.
4. Footer says “not a hosted production service” even in hosted-token mode.
5. System instruction forbids asking for secrets while the UI’s first job is collecting a secret.

## Hypothesis (not fact)

The owner wants a distinctive voice object they can put on a link. Reality will punish that if the link asks for a Google Cloud key and then dies with 1033.
