# Green Team Tasks

Verified against forensic + current code. Career-OS requests are REJECTED.

| ID | Problem | Finding | Class | Decision | Status |
| --- | --- | --- | --- | --- | --- |
| TASK-G001 | Talk cap writes status outside reducer | Forensic second pass | VERIFIED | LISTEN_CAPPED event | IMPLEMENTED / TESTED |
| TASK-G002 | Mobile hold ends on pointerleave | Forensic | VERIFIED | Pointer capture; no leave-stop | IMPLEMENTED / TESTED |
| TASK-G003 | Reconnect tears down a good session | Forensic | VERIFIED | Retry only error/closed | IMPLEMENTED / TESTED |
| TASK-G004 | Preview cookie is the password | Forensic C2 | VERIFIED | Opaque session token | IMPLEMENTED / TESTED |
| TASK-G005 | Transcript is a silent scrap | C5 | VERIFIED | Turns, timestamps, clip flag, undo | IMPLEMENTED / TESTED |
| TASK-G006 | Five equal buttons hide Talk | Designer dismissal | VERIFIED | Talk-first + More sheet | IMPLEMENTED / TESTED |
| TASK-G007 | Orb ignores conversation phase | C6 | VERIFIED | Phase tint on the sphere | IMPLEMENTED / TESTED |
| TASK-G008 | Dead EXR + unused utils | FT-22/23 | VERIFIED | REMOVE | IMPLEMENTED |
| TASK-G009 | No voice/language/volume | Expected | VERIFIED | Settings in More; reconnect on voice | IMPLEMENTED / TESTED |
| TASK-G010 | EffectComposer with only RenderPass | Engineer | VERIFIED | Direct renderer | IMPLEMENTED |
| TASK-G011 | No health surface | SRE | VERIFIED | GET /api/health | IMPLEMENTED / TESTED |
| TASK-G012 | BYO key as product auth | C1/C2 | PARTIALLY VERIFIED | Keep localhost BYO; hosted path first | FOUNDATION — no fake OAuth |
| TASK-G013 | Durable hosting | C3 | VERIFIED | Cannot invent a host here | BLOCKED |
| TASK-G014 | Beat Gemini/ChatGPT | Market 1/10 | NEEDS USER VALIDATION | Do not clone camera/tools | REJECT as this sprint |
| TASK-G015 | Career OS | Category error | FALSE POSITIVE | — | REJECT |
| TASK-G016 | Space does nothing until Talk is focused | Critic / UX | VERIFIED | Auto-focus Talk on `ready` | IMPLEMENTED |
| TASK-G017 | 3-minute talk cap is invisible | Adjacent to G001 | VERIFIED | Remaining time on Talk | IMPLEMENTED / TESTED |
| TASK-G018 | Unexpected Live close is a dead end | Gemini Live docs | VERIFIED | Backoff reconnect + resumption handle | IMPLEMENTED / TESTED; live path UNVERIFIED |
| TASK-G019 | More sheet has no Escape / outside dismiss | A11y | VERIFIED | Dismiss helpers + dialog | IMPLEMENTED / TESTED |
| TASK-G020 | `http://` public hosts cannot use the mic | Web Audio | VERIFIED | Insecure-context warning | IMPLEMENTED / TESTED |
| TASK-G021 | Settings remint 429s the 2s IP cooldown | Critic | VERIFIED | Retry-After + one client retry + debounce | IMPLEMENTED / TESTED |
| TASK-G022 | `index.tsx` still owns the Live client | Critic | PARTIALLY VERIFIED | Extracted reconnect/listen/mint helpers | PARTIAL — UI still connects |
| TASK-G023 | Motion ignores `prefers-reduced-motion` | A11y | VERIFIED | Talk scale + orb pulse | IMPLEMENTED |

Live Gemini quality remains EXTERNAL_DEPENDENCY_REQUIRED / UNVERIFIED.

## Critic (assume this is insufficient)

- Shared preview password still authorizes minting. Opaque cookies stop password theft from JS, not quota sharing.
- Session resumption is wired to the official handle/GoAway fields; we have not proven a 10-minute Live drop in this environment.
- `index.tsx` still owns the Live client. Helpers moved out; the socket did not.
- Competitors still start from an account. We did not beat them and should not claim we did.
- `/api/health` is public by design. It must stay secret-free.

Critic loop 2 (code review, no live Gemini):

- VERIFIED and fixed: keep last handle when `resumable=false`; GoAway no longer kills the socket; hosted connect failures stay `connect` not paste-key; remint failure clears `reconnectArmed`; AUDIO_OUT from `ready` so the orb tints after release; Escape restores Talk focus.
- Still open: shared-password mint, durable host, live E2E.
- Critic loop 3: hosted path no longer burns `uses:1` on a fallback model; resume reuses a live token until expiry; mint rate-limit key is CF/socket not XFF; “Use hosted session” returns after BYO; settings apply even while holding Talk; reduced-motion backdrop no longer flickers.

| TASK-G024 | Cumulative transcripts doubled | Known issue | VERIFIED | Prefix/snapshot merge | IMPLEMENTED / TESTED |
| TASK-G025 | Orb stays speaking after playback | Critic / UX | VERIFIED | SPEAKING_DONE | IMPLEMENTED / TESTED |
| TASK-G026 | Hold-only Talk is hard on mobile | Forensic expected | VERIFIED | Tap mode | IMPLEMENTED / TESTED |
| TASK-G027 | Hindi speakers get English chrome | Owner language | VERIFIED | UI copy + `lang` | IMPLEMENTED / TESTED |
| TASK-G028 | Missing issuer logs a 404 | Console noise | VERIFIED | 200 `{available:false}` | IMPLEMENTED / TESTED |
| TASK-G029 | Mint IP map can grow | SRE | VERIFIED | pruneMintLog | IMPLEMENTED / TESTED |
| TASK-G030 | No privacy copy in product | Forensic expected | VERIFIED | More sheet + footer | IMPLEMENTED |
| TASK-G031 | iOS/Android orb permissions unclear | Owner research | VERIFIED | Talk-gated audio, no Settings redirect, hide-tab mic stop, WebGL restore | IMPLEMENTED / TESTED; live phones UNVERIFIED |
| TASK-G032 | Mic deny + key-gate block first testers | Owner re-scan | VERIFIED | Mic stays ready; tap on phones; get-key link; issuer timeout | IMPLEMENTED / TESTED |

Still BLOCKED: user-auth in front of mint, durable host, live Gemini E2E.

Not leftover: career OS, camera, replacing Lit.
