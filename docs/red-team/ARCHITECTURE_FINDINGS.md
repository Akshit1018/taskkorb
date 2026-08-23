# Architecture Findings

## RT-070 — Domain folders are decorative
- AREA: Architecture
- EVIDENCE: `src/session`, `src/audio`, `src/telemetry` exist. `index.tsx` still owns connect, capture, playback, and UI.
- IMPACT: Next change will keep growing the god class.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED

## RT-071 — No environment boundary
- AREA: Architecture
- EVIDENCE: `vite.config.ts` `define` inlines `GEMINI_API_KEY` into the client bundle for every mode that has the env var.
- IMPACT: A “local .env.local” becomes a public secret in `dist/`.
- SEVERITY: CRITICAL
- CONFIDENCE: CONFIRMED

## RT-072 — Hosting is a Quick Tunnel
- AREA: Infrastructure
- EVIDENCE: User already hit Cloudflare **Error 1033**. Tunnel process logs showed QUIC timeout then reconnect. Old hostname returned 530 after restart.
- IMPACT: Testers conclude the product is down.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED (observed earlier this run)

## RT-073 — No health check, no metrics backend, no alert
- AREA: SRE
- EVIDENCE: `track()` is `console.info`. Nothing ships off-box.
- IMPACT: Production failures are invisible.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## Failure map

```
User
 → Browser (only runtime)
    → sessionStorage KEY          [leak]
    → Vite-defined process.env    [bundle leak]
    → getUserMedia                [permission / insecure context]
    → AudioWorklet / ScriptProcessor
    → Gemini Live WebSocket       [preview model, no resume]
    → Three.js + 3.2MB EXR        [jank]
 → Cloudflare trycloudflare       [1033 / 530]
```

Single-point failures: Google key, Google Live, the tab, the tunnel.
