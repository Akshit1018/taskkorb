# Red-Team Findings — Taskkorb

**Date:** 2026-08-23  
**Code:** `taskkorb` / Audio Orb, branch `cursor/orb-product-foundation-79c8`  
**Stance:** The product is flawed until it proves otherwise. It did not.

If I wanted this product to fail in the real world, I would exploit **the Gemini API key in the browser** first: phish it on the public tunnel, spend the victim’s quota, and let Google lock the project. Everything else is secondary.

---

## OUTPUT 1 — Executive verdict

See [RED_TEAM_SCORECARD.md](./RED_TEAM_SCORECARD.md).

Headline: **This is a renamed AI Studio demo with a session reducer, not a product.** Production readiness **1/10**. Market **1/10**. Security **1/10**.

---

## OUTPUT 2 — Top 10 reasons this product could fail

1. **Stolen or leaked Gemini keys** (RT-090, RT-071) — the only credential is in the tab and can be compiled into JS.
2. **Nobody will onboard** (RT-002) — first step is “create a Google API key.”
3. **Incumbents already won voice** (RT-001) — Gemini app / ChatGPT Voice do this without BYO keys.
4. **Public preview dies with 1033** (RT-072) — already observed this session.
5. **Bad key / mic deny is a dead end** (RT-011, RT-012).
6. **Unbounded streaming cost** (RT-083, RT-037) — forgotten mic burns quota.
7. **No memory** (RT-003, RT-050) — refresh deletes the conversation.
8. **Preview models retire** (RT-080) — IDs are dated `preview-09/12-2025`.
9. **833 KB + 3.2 MB on a phone** (RT-031) — activation dies on slow networks.
10. **No observability** (RT-073) — you will not know it is broken.

---

## OUTPUT 3 — Critical defects

| ID | Title | Confidence |
| --- | --- | --- |
| RT-002 | Onboarding is “paste your cloud key” | CONFIRMED |
| RT-040 | No backend / token boundary | CONFIRMED |
| RT-051 | Only persisted data is the secret | CONFIRMED |
| RT-071 | Vite can inline the key into `dist/` | CONFIRMED |
| RT-090 | Browser API key is full account takeover of that key | CONFIRMED |

---

## OUTPUT 4 — High-severity defects

RT-001, RT-003, RT-005, RT-010, RT-011, RT-012, RT-022, RT-023, RT-024, RT-025, RT-031, RT-035, RT-037, RT-041, RT-050, RT-060, RT-061, RT-072, RT-073, RT-080, RT-081, RT-082, RT-083, RT-084, RT-091, RT-092, RT-093.

---

## OUTPUT 5 — Complete findings backlog

Canonical IDs live in the specialist files:

- [PRODUCT_FLAWS.md](./PRODUCT_FLAWS.md) RT-001–005
- [UX_FAILURES.md](./UX_FAILURES.md) RT-010–017
- [LOGIC_FAILURES.md](./LOGIC_FAILURES.md) RT-020–027
- [FRONTEND_FINDINGS.md](./FRONTEND_FINDINGS.md) RT-030–038
- [BACKEND_FINDINGS.md](./BACKEND_FINDINGS.md) RT-040–042
- [DATABASE_FINDINGS.md](./DATABASE_FINDINGS.md) RT-050–051
- [API_FINDINGS.md](./API_FINDINGS.md) RT-060–062
- [ARCHITECTURE_FINDINGS.md](./ARCHITECTURE_FINDINGS.md) RT-070–073
- [AI_FINDINGS.md](./AI_FINDINGS.md) RT-080–085
- [SECURITY_FINDINGS.md](./SECURITY_FINDINGS.md) RT-090–095

Status after 2026-08-23 remediation (see FIX_HISTORY):

| ID | Status |
| --- | --- |
| RT-071 | RESOLVED — Vite no longer inlines GEMINI_API_KEY; `npm run build` scans dist |
| RT-051 | RESOLVED — key is memory-only, not sessionStorage |
| RT-011 RT-012 | RESOLVED — change-key + human errors + retry |
| RT-010 RT-035 | RESOLVED — labeled Talk + focus-visible |
| RT-023 RT-024 RT-025 | RESOLVED — all parts, connect generation, listen lock |
| RT-037 RT-083 | PARTIALLY RESOLVED — silence gate + 3 min talk cap + hold-to-talk |
| RT-050 | PARTIALLY RESOLVED — transcript cap/export/local persist, no account history |
| RT-091 RT-092 RT-093 | PARTIALLY RESOLVED — CSP, privacy copy, optional PREVIEW_PASSWORD |
| RT-090 RT-002 RT-040 | PARTIALLY RESOLVED — Vite can mint ephemeral tokens; BYO key remains the fallback; no user-auth in front of mint |
| RT-094 | RESOLVED — telemetry rejects secret-like values |
| RT-093 | PARTIALLY RESOLVED — preview cookie now required for `/src` and app files |
| RT-001 RT-005 RT-080 | DISCOVERED — market/product, not a code patch |

---

## OUTPUT 6 — Missing feature report

[MISSING_FEATURES.md](./MISSING_FEATURES.md)

---

## OUTPUT 7 — Bad feature report

[BAD_FEATURES.md](./BAD_FEATURES.md)

---

## OUTPUT 8 — Competitor gap matrix

[COMPETITOR_GAPS.md](./COMPETITOR_GAPS.md)

---

## OUTPUT 9 — User pain map

| User | Journey | Pain | Cause | Severity | Alternative they use instead |
| --- | --- | --- | --- | --- | --- |
| First-time mobile tester | Open link | 1033 / blank trust | Quick Tunnel | HIGH | Give up |
| First-time user | Start | “Where do I get GEMINI_API_KEY?” | BYO key | CRITICAL | Gemini app |
| User with typo key | After Start | Gate gone, red button dead | No key reset | HIGH | Chrome settings / rage quit |
| User who denied mic | Talk | Raw error, cannot talk | ERROR phase | HIGH | Refresh loop |
| Paying Google Cloud user | Leaves tab open | Surprise bill | No silence gate | HIGH | Revoke key, never return |
| Returning user | Next day | Empty orb | No history | HIGH | ChatGPT Voice |
| Keyboard / AT user | Controls | No focus ring, unlabeled talk | CSS `outline: none` | HIGH | Don’t use |
| Hindi speaker | Talk | Unknown voice/language | Hardcoded Orus | MEDIUM | Gemini Hindi |

---

## OUTPUT 10 — Architecture failure map

See [ARCHITECTURE_FINDINGS.md](./ARCHITECTURE_FINDINGS.md).

Single process, single tab, single vendor socket, single leaked secret.

---

## OUTPUT 11 — Unverified assumptions

[UNVERIFIED_ASSUMPTIONS.md](./UNVERIFIED_ASSUMPTIONS.md)

Live Gemini audio quality, systemInstruction obedience, iOS worklet, and Hindi behavior were **not** proven.

---

## OUTPUT 12 — What to fix first (do not implement in this audit)

### P0
1. Stop treating a browser Gemini key as a product. Ephemeral token or refuse to host publicly.
2. Build-time guard: fail if a key string is in `dist/`.
3. Key change / clear UI. Invalid key must not hide the gate.
4. Recoverable mic-denied and connect-failed states.
5. Stop shipping trycloudflare as the test experience, or put a password in front.

### P1
6. Play all audio parts, not `parts[0]`.
7. Serialize connect/listen (no double tap, no stacked sessions).
8. Silence gate or push-to-talk. Session time cap.
9. Human errors. Labeled talk button. Focus rings.
10. Transcript cap + persist or export.

### P2
11. Kill dead `visual.ts` / unused deps. Shrink EXR. Code-split Three.
12. Reconnect/backoff. Privacy copy. Voice/language. Safe-area. Reduced motion.

### P3
13. Evals. Real analytics. A reason to exist that Gemini.app does not already cover.

---

## Button audit (every control)

| Control | Why it exists | What is wrong |
| --- | --- | --- |
| Start (key form) | Submit key | No format check, no loading, double-submit allowed, then gate vanishes |
| Reset | New session | Destroys transcripts, enabled during `connecting`, no confirm, no analytics name beyond track in reset path |
| Red circle | Talk | No visible label, disabled in `error`/`closed` without a fix path, double-click during getUserMedia |
| Stop | End capture | Fine when listening; invisible purpose next to an unlabeled record button |

No undo anywhere.

---

## Form torture (the only form)

| Input | Expected | Actual |
| --- | --- | --- |
| Empty | Block | Blocked after trim |
| Whitespace | Block | Blocked |
| `a` | Reject | Accepted, gate closes, connect fails |
| 20k chars | Reject | Accepted into sessionStorage |
| Emoji | Reject | Accepted |
| Paste | Works | Works |
| Autofill | Password manager | `autocomplete="off"` fights managers |
| Double submit | Ignore | Two `initClient` races |

There is no backend validation because there is no backend.

---

## User journey destruction

`ENTRY (URL) → KEY → CONNECT → TALK → HEAR → RESET`

- URL: 1033 already broke entry.
- KEY: highest-friction possible start.
- CONNECT: no spinner distinct from copy; failure is a dead canvas.
- TALK: unlabeled control; HTTPS required or mic fails.
- HEAR: only first part; no volume.
- RESET: data loss.
- RETENTION: none. There is no tomorrow.

---

## Self-critique of this audit

- We **did** inspect code paths, sizes, prior 1033, and current HTTP 200s.
- We **did not** run a live Gemini conversation. Do not pretend audio quality was tested.
- We **did** compare 2026 voice incumbents; we did not invent a career-OS competitor set.
- We **did not** run axe/Lighthouse. A11y findings are from CSS/DOM evidence.
- We **did not** manufacture a fake database schema. Absence is the finding.
- We may still have missed: insecure-context mic on `http://` LAN IPs; iOS audio unlock; Safari worklet COOP/COEP.

Targeted extra pass: the key-gate disappearance after invalid submit is the most expensive UX bug that is fully proven in code and should be treated as P0 with the key leak.
