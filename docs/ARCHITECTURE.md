# Architecture

## Current shape

This is a **Vite app** with a thin local middleware layer.

- UI: Lit custom elements
- Voice: `@google/genai` Live API
- Visual: Three.js orb
- Domain: session reducer, reconnect/resumption policy, PCM converters, product identity, telemetry, mobile runtime policy
- Local backend: preview password gate + optional ephemeral Live token issuer

There is no database, queue, or user-account provider.

## Intended boundaries

```
src/product     product identity and model/voice constants
src/session     conversation lifecycle
src/audio       PCM encode/decode + unlock/resume
src/platform    iOS/Android permission policy (no auto-mic, no Settings deep-link)
src/auth        key validation + hosted token client
src/vite        preview gate + token issuer + health
src/telemetry   structured events
index.tsx       live session UI and capture/playback
visual-3d.ts    renderer only
```

## Why this stack stays

Lit + Vite + Three already implement the orb. Replacing them would be prestige, not value. The missing work is reliability, state, and honesty, not a new framework.

## Credential boundary

```
optional GEMINI_API_KEY (server env)
        ↓
GET /api/live-session
        ↓
ephemeral auth token (browser memory)
        ↓
Gemini Live WebSocket (v1alpha)
```

If the server key is absent, the UI falls back to a pasted key.

See `EXTERNAL_DEPENDENCIES.md`.
