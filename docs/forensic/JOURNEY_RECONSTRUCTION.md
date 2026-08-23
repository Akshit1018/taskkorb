# Journey Reconstruction

Reconstructed from implementation, not from README claims. Criticism is deferred to later files.

## What exists

One Vite + Lit page. Two custom elements: `gdm-live-audio` (`index.tsx`) and `gdm-live-audio-visuals-3d` (`visual-3d.ts`). Two local HTTP surfaces: `POST /__preview` and `GET /api/live-session`. One external system: Gemini Live over WebSocket.

There are no other pages, no user accounts, no database, no queue, no agents, no tools, no feature flags.

```
USER
 ↓
[optional preview password page]
 ↓
SINGLE SCREEN (orb + overlay)
 ↓
ACTION (Connect / Hold Talk / Reconnect / Change key / Export / Clear)
 ↓
FRONTEND STATE (session reducer + Lit @state)
 ↓
API: GET /api/live-session  OR  pasted Gemini key in memory
 ↓
DOMAIN: validate key → GoogleGenAI.live.connect → PCM in/out
 ↓
STORE: localStorage taskkorb.transcripts  (text only)
 ↓
RESULT: spoken audio + transcript fragments + orb motion
 ↓
NEXT: hold Talk again, or leave
```

## Journey A — First open (preview locked)

Observed 2026-08-23 on this VM: `PREVIEW_PASSWORD` is set.

```
Open http://127.0.0.1:3000
 → HTTP 401 HTML “This preview is locked.”
 → Enter shared password
 → cookie taskkorb_preview (HttpOnly)
 → reload /
```

Unauthenticated `/src/auth/api-key.ts` also returned 401. The earlier red-team claim that `/src` bypassed the gate is **OUTDATED**.

## Journey B — Hosted token

```
GET /api/live-session
 → 404 {available:false} if no server GEMINI_API_KEY
 → 200 {token, expireTime} if server key mints
 → Lit sets authMode=hosted, hides key gate
 → live.connect with v1alpha + ephemeral token
 → phase ready
```

Mint against Google is **UNVERIFIED** in this environment.

## Journey C — Bring-your-own key

```
Key gate
 → paste Gemini key (memory only, 20–200 chars)
 → Connect (double-submit locked)
 → initClient → live.connect (primary model, then fallback)
 → ready OR key-gate returns with humanized error
```

No `sessionStorage`. No Vite `define` of the key. Dist build is scanned for `AIza…` / `sk-…`.

## Journey D — Talk

```
phase === ready
 → pointerdown / Space on Talk
 → getUserMedia
 → AudioWorklet pcm-recorder (RMS ≥ 0.012) or ScriptProcessor 2048
 → sendRealtimeInput PCM 16 kHz
 → model audio parts all scheduled
 → interrupt flag stops playback sources
 → pointerup stops tracks, phase ready
 → 180s cap auto-stops
```

Microphone, barge-in quality, and Hindi/Orus behavior are **UNVERIFIED**.

## Journey E — Memory

```
Refresh
 → transcripts reload from localStorage (2400-char cap each)
 → key/token die
 → hosted mode remints; BYO asks again
```

There is no Reset control. Clear asks for confirm, then wipes localStorage.

## Journey F — Failure

| Failure | Code path | User sees |
| --- | --- | --- |
| Bad key | both models throw → ERROR kind key | Gate returns, humanized copy |
| Mic deny | getUserMedia catch → ERROR kind mic | Talk disabled; Reconnect / Change key |
| Socket close | onclose → CLOSED | “Tap Reconnect” |
| Hosted mint fail | 502 / fetch error | BYO gate with message, or BYO silent fallback |

## Persistence map

| Data | Lives where | Refresh |
| --- | --- | --- |
| Transcripts | `localStorage` `taskkorb.transcripts` | Survives |
| Preview cookie | `taskkorb_preview` | Survives |
| API key / token | Lit state | Dies |
| Session / mic | Process memory | Dies |

## Layers that do not exist

Routes, dashboard, search, accounts, database, migrations, workers, cache, MCP, agents, evals, remote analytics, CI, Docker, landing, pricing, settings, voice picker, volume, camera, tools.
