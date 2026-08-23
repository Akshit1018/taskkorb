# Feature Truth Map

Classifications are against **current code**, not the original AI Studio export and not the stale specialist red-team files.

A feature that exists in code but has never been proven live is **UNVERIFIED**, not REAL.

| ID | Claimed / implied feature | Classification | Evidence | User consequence |
| --- | --- | --- | --- | --- |
| FT-01 | Live voice companion: speak → hear reply | UNVERIFIED | `index.tsx` `live.connect` + PCM path exists. No live Gemini conversation in this environment. | The only product loop is unproven. |
| FT-02 | 3D orb that moves with speech | PARTIAL | `visual-3d.ts` analyser-driven scale/shaders. Sphere is visible without EXR. Motion quality on phones unmeasured. | Visual exists; it is not a conversation surface with states of its own. |
| FT-03 | “Speak, and the orb answers” (title/tagline) | MISLEADING | Copy implies zero-setup talk. Default path is preview password and/or Gemini API key. | Activation dies before the aha. |
| FT-04 | Taskkorb as a task companion | COSMETIC | Name + system instruction say “plan next steps.” No tasks, no notes, no follow-ups. | Name overpromises work the app cannot keep. |
| FT-05 | Hosted ephemeral Live token | PARTIAL | `src/vite/live-token.ts` + `fetchHostedCredential`. Mint vs Google UNVERIFIED. No user auth in front of mint. | Safer than BYO when configured; still not a product login. |
| FT-06 | Bring-your-own Gemini key | REAL (for the form) / UNVERIFIED (for connect) | Validation, memory-only, change-key. Connect needs a real key. | Testers with a key can attempt the loop. Everyone else cannot. |
| FT-07 | Preview password | REAL | `curl /` → 401 HTML. `curl /src/...` → 401. | Shared secret, not identity. Anyone with the password is “in.” |
| FT-08 | Hold-to-talk | REAL (UI) / UNVERIFIED (mic) | Pointer + Space, 180s cap, listen lock. Physical hold not exercised here. | Correct control model; unproven on iOS. |
| FT-09 | Silence gate | PARTIAL | Worklet RMS 0.012 + `isAudible`. Threshold uncalibrated on real rooms. | Reduces some silence cost; not a VAD product. |
| FT-10 | Interrupt / barge-in | PARTIAL | Server `interrupted` stops buffer sources. Full-duplex listen-while-speaking is UNVERIFIED. | Code can cut playback; market baseline is listen-while-talk. |
| FT-11 | Transcripts | PARTIAL | Incremental fragments, 2400-char cap, localStorage, export/clear. No turns, timestamps, or search. | A notepad of scraps, not history. |
| FT-12 | Conversation memory across days | COSMETIC | localStorage survives refresh until Clear/quota/another browser. No account, no server history. | Returning user gets a leftover paragraph, not a relationship. |
| FT-13 | Human errors + reconnect | REAL | `humanize.ts`, Change key, Reconnect. | Recoverable for testers. Still not “it just works.” |
| FT-14 | Privacy disclosure | PARTIAL | Gate + footer say audio goes to Google while Talk is held. No policy, retention, or region. | Honest enough for a test; insufficient for a launched product. |
| FT-15 | CSP | PARTIAL | Meta CSP in `index.html`. Allows `'unsafe-inline'` `'unsafe-eval'` for Vite. | Blocks random third-party scripts; not a hardened host. |
| FT-16 | Telemetry | PARTIAL | `console.info` + `taskkorb:event`. Secret-like keys/values rejected. No product analytics backend. | Developers can watch a console. The business cannot. |
| FT-17 | Dist secret scan | REAL | `scripts/check-dist-secrets.mjs` on `npm run build`. | Prevents the Vite-inline class of leak. |
| FT-18 | Model fallback | REAL (code) / UNVERIFIED (live) | Tries `…12-2025` then `…09-2025`. | May survive one retirement; both IDs are dated previews. |
| FT-19 | Hindi / Hinglish replies | UNVERIFIED | System instruction asks for it. Voice is hardcoded `Orus`. | Language claim is a prompt, not a product setting. |
| FT-20 | Reduced motion | PARTIAL | Skips camera orbit only. Shaders still animate. | Incomplete a11y. |
| FT-21 | Focus-visible / labels | REAL | Talk labeled; `:focus-visible` on buttons. No landmarks/`<main>`. | Keyboard users can see focus. Screen readers get a sparse tree. |
| FT-22 | EXR environment map | DEAD | `public/piz_compressed.exr` ~3.3 MB, zero references. | Ships weight for nothing if copied to hosts. |
| FT-23 | `utils.ts` PCM re-export | DEAD | Nothing imports it. | Noise. |
| FT-24 | Session `RESET` event | DEAD | Defined in reducer, never dispatched. | Dead API surface. |
| FT-25 | Career / resume / jobs | ABSENT (not even mocked) | No modules. | Do not audit as a missing feature of this product. |
| FT-26 | Accounts, billing, landing | ABSENT | Single `index.html`. | There is no product company surface. |
| FT-27 | Tools / search / camera | ABSENT | Live config has no tools, no video. | Orb cannot do anything except talk. |
| FT-28 | Durable hosting | BROKEN / ABSENT | trycloudflare 1033 already observed this project. No Dockerfile/CI. | Public links die. |

## Quality scores for the only core feature (voice loop)

Scored as a shipped consumer feature, not as a demo.

| Dimension | Score | Why |
| --- | --- | --- |
| Completeness | 4/10 | Loop is wired; no account, history, voice, volume, language. |
| UX | 3/10 | Hold-to-talk is clear; onboarding is a cloud credential. |
| UI | 4/10 | One canvas + floating buttons. No hierarchy beyond overlay. |
| Reliability | 3/10 | Unit-tested reducer. Live path UNVERIFIED. Preview models rot. |
| Performance | 3/10 | 812 KB JS. Three.js on the critical path. |
| Architecture | 5/10 | Reducer + PCM + issuer exist. UI still owns the socket. |
| Error handling | 6/10 | Humanized + change-key. Hosted fallback is uneven. |
| Mobile | 3/10 | Safe-area CSS exists. No device lab. 812 KB on cellular. |
| Accessibility | 5/10 | Labels and focus rings. No landmarks, incomplete reduced-motion. |
| Observability | 2/10 | Console only. |
| Security | 4/10 | Worst leaks closed. Token still in the tab. Shared preview password. |
| Competitive quality | 1/10 | Gemini app and ChatGPT Voice do the job without a key. |

A feature can exist and still score 3/10. This one does.
