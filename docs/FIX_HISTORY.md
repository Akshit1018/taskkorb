# Fix History

## 2026-08-24 Green Team credential-error loop

- Symptom: a dummy Gemini key could pass `connect()`, then `onerror` marked `session` and `onclose` auto-reconnected three times while hiding the key gate.
- Root Cause: auth strings like `PERMISSION_DENIED` were treated as a flaky socket; `CLOSED` wiped `errorKind`. `humanizeError` also mapped any “permission” text to a blocked microphone.
- Fix: `classifyLiveFailure`; key rejections stay in `error` with the paste gate; no auto-reconnect; health status is unit-tested and secret-free; `session_reconnect_gave_up` when backoff is exhausted.
- Verification:  classify/health/reconnect unit tests + full suite + typecheck. Live Google 401 path UNVERIFIED.

## 2026-08-24 first-tester activation

- Symptom: a pasted ownership prompt described a career OS; real testers still died on mic deny, hold-to-talk, and “where is the key?”
- Root Cause: the repo is the Audio Orb. Mic errors used the hard `error` phase. Desktop hold was the default. The key gate had no official get-key path. A hung issuer left “Opening session…” forever.
- Fix: reject career OS again; mic deny stays `ready`; phones default to tap; AI Studio key link; disable Connect until the draft validates; 4s hosted-session timeout.
- Verification: unit tests for machine/prefs/copy/issuer timeout + typecheck. Live Gemini and physical phones remain UNVERIFIED.

## 2026-08-24 mobile runtime

- Symptom: unclear whether the floating orb could auto-listen or bounce people into iOS/Android Settings, and hosted connect created Web Audio before a tap.
- Root Cause: iOS/Android web rules require a user gesture for mic + AudioContext; Settings URL schemes are private; Chrome records only on the visible tab; Safari can drop WebGL when backgrounded.
- Fix: create/resume AudioContext on Talk; `play-and-record` hint; denied-mic copy with manual Safari/Chrome steps and no `App-Prefs`; stop mic on tab hide; WebGL context-lost `preventDefault`; in-app browser + silent-switch warnings; research in `docs/MOBILE_RUNTIME.md`.
- Verification: unit tests for runtime/unlock helpers + typecheck. Physical iPhone/Android Gemini talk remains UNVERIFIED.

## 2026-08-23 remaining session work

- Symptom: leftover critic/product gaps were still visible: doubled transcripts, speaking tint that never ended, hold-only Talk on mobile, English chrome for Hindi users, issuer 404 noise, no in-product privacy copy.
- Root Cause: fragments were blindly concatenated; playback end did not re-enter the reducer; Talk had one gesture; UI strings were hardcoded English; missing issuer used 404.
- Fix: cumulative transcript merge; SPEAKING_DONE; tap-to-talk; Hindi UI + `lang`; issuer 200 `{available:false}`; mint-log prune; privacy copy; reduce-motion preference.
- Verification: 67 unit tests + typecheck + browser Hindi/tap/More. Live Gemini still UNVERIFIED. Host and user-auth still BLOCKED.

## 2026-08-23 leftover reliability

- Symptom: hosted reconnect minted a new token even when a resumption handle existed; fallback model could spend `uses:1`; XFF made the mint cooldown spoofable; “Use my key” was one-way.
- Root Cause: reconnect always reminted; hosted used the BYO two-model loop; rate limit trusted the first forwarded hop.
- Fix: reuse a non-expired token when resuming; hosted tries only the primary model; remint 30s before expiry; CF-Connecting-IP / socket for mint limits; hosted return button; apply voice/language after releasing Talk.
- Verification: 62 unit tests + typecheck. Live mint/resume still UNVERIFIED.

## 2026-08-23 green-team critic loop

- Symptom: the first reliability pass stored a resumption handle, then threw it away mid-reply; GoAway killed the live socket; hosted connect failures opened the paste-key overlay; the orb never tinted speaking after a normal release.
- Root Cause: `resumable=false` was treated as “forget the session”; GoAway was implemented as a hard close; every `connect()` throw used `kind: 'key'`; `AUDIO_OUT` was ignored from `ready`.
- Fix: keep the last good handle; leave GoAway to the grace window and `onclose`; hosted failures stay `connect`; remint failure clears `reconnectArmed`; speaking after release; Escape restores Talk focus; hide Talk/More under the key gate.
- Verification: 57 unit tests + typecheck. Live 10-minute drop still UNVERIFIED.

## 2026-08-23 green-team reliability loop

- Symptom: unexpected Live close left users stranded; voice/language remint could 429; Space did nothing until Talk was tapped; the 3-minute cap was invisible; More had no Escape; `http://` hosts failed the mic silently.
- Root Cause: the first Green Team pass raised the conversation surface but left session lifetime, mint cooldown, and Talk feedback as adjacent gaps.
- Fix: official Gemini session resumption + GoAway-aware backoff reconnect; mint `Retry-After` + one client retry + 400ms settings debounce; remaining talk time; auto-focus Talk; Escape/outside dismiss; insecure-context warning; reduced-motion on Talk and the orb pulse.
- Verification: 57 unit tests + typecheck + local Talk/More browser pass. Live resume against Google is UNVERIFIED.
- Related: durable host, user-auth in front of mint, and a real microphone E2E remain open.

## 2026-08-23 green-team voice baseline

- Symptom: Talk was one of five equal buttons; hold died on finger slide; talk-cap bypassed the reducer; preview cookie stored the password; transcripts were a silent scrap; dead EXR still shipped.
- Root Cause: remediations made the demo safer but left the conversation surface looking like a developer console.
- Fix: Talk-first UI, pointer capture, LISTEN_CAPPED, opaque preview session, dated transcript turns + undo + clip notice, voice/language/volume, orb phase tint, `/api/health`, remove EXR/`utils.ts`.
- Verification: unit tests + typecheck + production build. Live talk still UNVERIFIED.
- Related: no durable host, no user-auth in front of mint, incumbents still win onboarding.

## 2026-08-23 hosted token + remaining P0 leaks

- Symptom: public preview still required a long-lived Gemini key in the tab; preview gate leaked `/src` without a cookie; form accepted junk keys and double-submit.
- Root Cause: P0/P1 pass removed storage/bundle leaks but left the credential boundary and gate holes.
- Fix: Vite `/api/live-session` mints a v1alpha ephemeral token when `GEMINI_API_KEY` is server-side; preview gate requires the cookie for all app files; key validation; connect lock; confirm clear; telemetry rejects secret-like values.
- Verification: unit tests for validation/token helpers/issuer client. Live mint against Google is UNVERIFIED (no key in this environment).
- Related: durable hosting and authenticated minting remain open.

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
