# Frontend Findings

## RT-030 — God component
- AREA: Frontend
- EVIDENCE: `index.tsx` is 573 lines: key gate, session, capture, playback, transcripts, telemetry, styles.
- IMPACT: Every change risks the live loop. Untestable in the browser layer.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED

## RT-031 — 833 KB JS + 3.2 MB EXR for a talk button
- AREA: Performance
- EVIDENCE: `dist/assets/index-vLR7Ad_2.js` 833 KB; `public/piz_compressed.exr` 3.2 MB. Vite warns >500 KB.
- IMPACT: Slow 4G in India can wait several seconds before the key card is even interactive if EXR starts with the canvas.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED
- AFFECTED: cheap Android, slow networks

## RT-032 — rAF loop and resize listener never die
- AREA: Frontend / Reliability
- EVIDENCE: `visual-3d.ts` `animation()` calls `requestAnimationFrame` forever. `window.addEventListener('resize', onWindowResize)` has no `disconnectedCallback` remove.
- IMPACT: Navigate away or HMR → leaked GPU/CPU. Two visuals if the element is recreated.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED

## RT-033 — Unused frontend
- AREA: Frontend
- EVIDENCE: `visual.ts` is not imported. `@lit/context` is in `package.json` unused.
- IMPACT: Dead weight, false surface area.
- SEVERITY: LOW
- CONFIDENCE: CONFIRMED

## RT-034 — Inter is not loaded
- AREA: UI
- EVIDENCE: CSS `font-family: Inter, system-ui` with no `<link>` or `@font-face`.
- IMPACT: Inconsistent type across devices. Looks like an unfinished template.
- SEVERITY: POLISH
- CONFIDENCE: CONFIRMED

## RT-035 — No focus ring
- AREA: Accessibility
- EVIDENCE: `button { outline: none; }` and no `:focus-visible` replacement.
- IMPACT: Keyboard users cannot see focus.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-036 — No `prefers-reduced-motion`
- AREA: Accessibility
- EVIDENCE: Bloom + continuous camera orbit always run.
- IMPACT: Vestibular discomfort.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED

## RT-037 — Worklet posts raw Float32 every render quantum
- AREA: Performance
- EVIDENCE: `pcm-recorder-worklet.js` `postMessage` on every process. Main thread base64-encodes and `sendRealtimeInput`s continuously.
- IMPACT: Main-thread jank + quota burn on silence.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-038 — Shadow DOM + no skip link / landmark
- AREA: Accessibility
- EVIDENCE: No `<main>`, no heading in the live view, controls are unlabeled for sighted users.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED
