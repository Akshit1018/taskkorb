# Fix History

## 2026-08-23 red-team P0/P1

- Symptom: Browser Gemini key leaked via sessionStorage and Vite `define`; bad keys trapped users; live loop had races and unlabeled controls.
- Root Cause: AI Studio demo treated the long-lived key as product auth and hid failures.
- Fix: Memory-only key, no client `define`, dist secret scan, change-key UI, hold-to-talk, silence gate, play all audio parts, serialized connect/listen, human errors, CSP, preview password gate, transcript cap/export.
- Verification: unit tests, typecheck, production build + secret scan.
- Related: ephemeral Google tokens remain EXTERNAL_DEPENDENCY_REQUIRED.

## Silent live-session failure

- Symptom: orb loaded, talking did nothing, no useful status
- Root cause: `initSession` swallowed exceptions; UI rendered `error` and ignored `status`
- Fix: session reducer, visible status/error, connect failures surfaced
- Verification: unit tests for reducer; build/typecheck
- Related: any future tool/API call must fail into the same state machine

## Microphone echo / deprecated capture

- Symptom: capture used ScriptProcessor size 256 and connected it to destination
- Root cause: leftover AI Studio demo wiring
- Fix: AudioWorklet first, ScriptProcessor 2048 fallback, no speaker tap
- Verification: code path review; runtime worklet file is served from `/public`

## PCM overflow and buffer views

- Symptom: full-scale samples could overflow; decode ignored `byteOffset`
- Root cause: `* 32768` and `new Int16Array(data.buffer)`
- Fix: clamp to `32767`; decode with offset/length
- Verification: `src/audio/pcm.test.ts`

## Cloudflare 1033

- Symptom: public test link showed Error 1033
- Root cause: Quick Tunnel QUIC drop
- Fix: restarted HTTP/2 tunnel (operational). Product hosting remains unresolved.
- Related: any trycloudflare URL is temporary
