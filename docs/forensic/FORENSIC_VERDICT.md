# Forensic Verdict

## Reconstruction first

Taskkorb is a single-page Gemini Live client. A person (or a Vite process) supplies a credential. The page streams microphone PCM to Google and plays audio back through a Three.js sphere. Transcripts are optional local leftovers.

That is the whole product. Criticism below is about **that** system, not a fictional career OS.

## Root-cause clusters

### C1 — No product identity except Gemini

Causes: BYO key, no accounts, no landing, no reason vs Gemini.app, name “Taskkorb” without tasks.

User: never activates, or activates as a Google Cloud customer.

Business: not a company.

### C2 — Credential is the product

Causes: long-lived key still a first-class path; hosted mint has no user auth; preview cookie **is** the password; token still lives in the tab.

User: phishing, surprise bills, shared-quota incidents.

### C3 — Distribution is a tunnel

Causes: no host, no CI, trycloudflare 1033/530 already observed.

User: “the app is down.”

### C4 — The loop is unproven

Causes: no live key here, no E2E, preview model IDs, interrupt untested, iOS worklet untested.

User: silent or broken talk; we cannot falsify quality claims.

### C5 — Nothing accumulates

Causes: 2400-char localStorage, no account history, no tools.

User: day 30 = day 1.

### C6 — Chrome pretends to be substance

Causes: orb without conversation states, EXR left behind, “companion” copy, telemetry theater.

User: expects a being; gets a pipe.

Do not file 40 tickets. File these six.

## Negative graph

```
No job beyond Gemini Live
        ↓
Onboarding is a cloud key (or a shared password + operator key)
        ↓
Activation death / stolen quota
        ↓
Even if talk works, refresh is amnesia
        ↓
No reason to return
        ↓
Incumbent salesperson wins in one sentence
```

Secondary:

```
Preview models + no evals + no analytics
        ↓
Quality and outages are invisible
        ↓
Support cannot diagnose
        ↓
Trust collapses on first bad session
```

## Feature chain

```
URL → preview gate → credential → Live socket → mic grant → hold Talk → PCM → Gemini → audio + scraps → pause
```

A defect at URL (1033) or credential (key) poisons every downstream step. Fixing barge-in while onboarding is a key form is the wrong altitude.

## Three-level inspection (the orb)

| Level | Finding |
| --- | --- |
| Surface | A sphere and a red Talk button. |
| System | Analyser uniforms + WebGL rAF. Conversation state is a status string, not the mesh. |
| Strategy | If the orb is the product, states must be the conversation. If Gemini is the product, delete the orb and stop. |

## Contradictions still true

| A | B | Resolution |
| --- | --- | --- |
| Tagline: speak and it answers | UI: paste a key | MISLEADING |
| Name: Taskkorb | No tasks | MISLEADING |
| System instruction: never ask for secrets | First screen: API key | Contradiction |
| Footer: not a hosted service | Hosted token mode | Copy not mode-aware |
| PRODUCT_VISION step list | Hosted bootstrap + no Reset | Docs stale |
| PRODUCT_GRAPH: sessionStorage | Code: memory-only | Docs stale |
| Old red-team specialist files | Remediations | Historical; do not implement from them blindly |

## Implementation scores (product, not demo)

| Dimension | Score |
| --- | --- |
| Product value | 2/10 |
| UX | 3/10 |
| Security (after remediations) | 4/10 |
| Backend | 3/10 |
| Market | 1/10 |
| Production | 1/10 |
| Honesty of the current branch | 7/10 |

Honesty went up. Market did not.

## Ranked remaining punishment (what reality hits first)

1. Users will not create Gemini keys. **PROVEN** pattern vs incumbents; **HYPOTHESIS** that *this* audience differs.
2. Public links die. **PROVEN** (1033 this project).
3. Shared preview password + server key = shared bill. **STRONG**.
4. Live audio quality unknown. **UNVERIFIED** — do not claim it works.
5. No return path. **PROVEN** in data model.
6. 812 KB + WebGL on cheap Androids. **STRONG**, not device-lab proven.

## Agent disagreement

| Agent | Position | Evidence |
| --- | --- | --- |
| UX | Remove the key gate from the happy path | Incumbent onboarding |
| Security | Keep BYO for local; never host BYO publicly | Key-in-tab is still XSS-complete |
| Product | Hosted token is not a product | No identity, no job |
| Power user | Keep hold-to-talk | Cost + control |
| Market | Hold-to-talk loses to one-tap live | GPT-Live / Gemini Live |
| Resolution | Hosted + user auth + one-tap optional once metered. BYO only on localhost. Orb stays only if it carries state. | User value > demo completeness |

## Second pass — “you missed something”

Assumed the first red-team was incompetent. Unique additions this pack found:

1. **Preview cookie value is the password.** HttpOnly helps XSS; anyone who can read Set-Cookie on HTTP still has the gate. More important: `/api/live-session` is authorized by that same shared secret. This is a new cluster, not just “add a password.”
2. **Talk-cap status bypasses the reducer** (`index.tsx` assigns `sessionState` directly). The machine is not the single writer.
3. **Silent transcript truncation** at 2400 chars — users will think the model forgot, not that we sliced.
4. **`pointerleave` ends Talk** — mobile slide-off is a false pause. Not in the original UX file as a named defect.
5. **Dead EXR still on disk** after bloom was removed — hosts can still ship 3.3 MB.
6. **Hosted mint rate-limit is per-IP in process memory** — resets on restart; one NAT shares a 2s bucket.
7. **Cancel on the key gate is not logout.** It only hides the form.
8. **Reconnect is enabled in `ready`**, so a tap can tear down a good session.

These were not prominent in `docs/red-team/*.md` bodies (several of those bodies are stale the other way).

## Third pass — overreaction filter

Dropped or downgraded:

| Claim | Why it is weak |
| --- | --- |
| “Must have camera” | Not the JTBD. IRRELEVANT. |
| “Must have Workspace tools” | Only if Taskkorb becomes a doer. |
| “God component is P0” | Maintainability, not user-facing P0. |
| “Replace Lit/Three” | Prestige. Does not change activation. |
| “No database is a defect” | Correct absence until there is an account. |
| “Career OS missing features” | Category error. |
| Older RT-010/011/023/051/071 as current bugs | Fixed. Implementing them again is vandalism. |
| “Production readiness 1/10 means delete the repo” | It means do not launch. A test orb can exist. |

Harsh and trustworthy: **do not ship this as a product.** Do not pretend remediations created a market.

## Skill / tool log

| Skill / tool | Purpose | Used? | Why | Result |
| --- | --- | --- | --- | --- |
| using-superpowers | Session bootstrap | No | File not in this environment | — |
| parallel-web-search | Default research | No | `parallel-cli` not installed | Fell back |
| firecrawl-search | Full-page search | No | `firecrawl` CLI not available | Fell back |
| WebSearch | Competitor reconstruction | Yes | Only working search | Gemini / ChatGPT / ElevenLabs sources cited |
| Task explore | Code archaeology | Yes | Independent reconstruction | Journey + stale-doc map |
| curl | Experience entry | Yes | Local :3000 | 401 gate; `/src` blocked |
| Browser talk loop | Verify aha | No | Preview locked, no Gemini key | UNVERIFIED |
| Old red-team files | Prior attack | Yes | Compared, then marked stale | Avoided re-litigating fixed bugs |

## Definition of done for this audit

- Product reconstructed from code: yes
- Major journeys traced: yes
- Subsystems inspected: yes
- Competitors researched from current public sources: yes
- OSS compared: yes (signed-URL / ephemeral pattern)
- Absences listed for the real category: yes
- Existing features challenged: yes
- Personas walked: yes
- Code ↔ user traceability: yes
- Uncertainty labeled: yes
- False positives challenged: yes
- Second pass added unique findings: yes

Live audio quality was **not** proven. Any sentence that says “the orb sounds good” is a lie.
