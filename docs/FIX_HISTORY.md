# Fix History

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
