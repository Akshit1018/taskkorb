# Security Findings

## RT-090 — Gemini API key in the browser is the product
- AREA: Security
- EVIDENCE: User paste → `sessionStorage`. Optional Vite `define` inlines `process.env.GEMINI_API_KEY` into shipped JS (`vite.config.ts` lines 19–21).
- IMPACT: XSS, shared PC, shoulder surf, or a built artifact leaks a paid Google key. Attacker spends the victim’s quota / accesses their GenAI project.
- SEVERITY: CRITICAL
- CONFIDENCE: CONFIRMED
- TEST THAT SHOULD EXIST: build with a dummy env key and fail if the string appears in `dist/`.
- STATUS: PARTIALLY RESOLVED (2026-08-23) — key is no longer stored or bundled. Browser still must hold a user-pasted key to open Gemini Live until a token issuer exists.

## RT-091 — No CSP, no Trusted Types, no auth
- AREA: Security
- EVIDENCE: `index.html` has no Content-Security-Policy. Any future third-party script can read sessionStorage.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-092 — Microphone audio is sent to Google with no privacy UX
- AREA: Security / Privacy
- EVIDENCE: `getUserMedia` then immediate `sendRealtimeInput`. No privacy policy, no “audio is sent to Google,” no retention statement.
- IMPACT: Legal and trust failure if this is shown to real users.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-093 — Public tunnel is an unauthenticated open mic app
- AREA: Security
- EVIDENCE: trycloudflare URL has no password. Anyone with the link can paste *their* key and talk, or phish others to paste keys into a lookalike.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-094 — Telemetry secret guard is incomplete
- AREA: Security
- EVIDENCE: `assertNoSecrets` checks *keys* named key/token/secret, not *values*. A detail `{reason: apiKey}` would pass. `console.info` of events is fine; leaking the key in status text is still possible if Google echoes it.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED

## RT-095 — Dependency surface
- AREA: Security
- EVIDENCE: `npm audit` was clean at last install. Three.js + genai + Vite is a large browser attack surface with no lockstep policy.
- SEVERITY: LOW
- CONFIDENCE: POSSIBLE
