# Architecture

## Current shape

This is a **browser-only Vite app**.

- UI: Lit custom elements
- Voice: `@google/genai` Live API
- Visual: Three.js orb + bloom
- Domain: session reducer, PCM converters, product identity, telemetry

There is no server, database, queue, or auth provider.

## Intended boundaries

```
src/product     product identity and model/voice constants
src/session     conversation lifecycle
src/audio       PCM encode/decode
src/telemetry   structured events
index.tsx       live session UI and capture/playback
visual-3d.ts    renderer only
```

`visual.ts` is leftover 2D visual code and is not mounted.

## Why this stack stays

Lit + Vite + Three already implement the orb. Replacing them would be prestige, not value. The missing work is reliability, state, and honesty, not a new framework.

## Future backend boundary

Production must not ship a long-lived Gemini key in the browser.

Required later:

- ephemeral token issuer
- rate limits
- session logging without raw audio unless the user consents

See `EXTERNAL_DEPENDENCIES.md`.
