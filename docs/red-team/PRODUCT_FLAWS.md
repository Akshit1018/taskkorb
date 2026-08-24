# Product Flaws

## RT-001 — The product has no reason to exist against free incumbents
- AREA: Product / Market
- WHAT IS WRONG: Taskkorb is “talk to Gemini through a ball.” Gemini Live and ChatGPT Voice already do that with accounts, history, mobile apps, and no BYO API key.
- EVIDENCE: Repo is a renamed AI Studio orb. Competitor research 2026-08-23: ChatGPT Voice / GPT-Live, Gemini Live, ElevenLabs Conversational AI, Hume EVI.
- IMPACT: A first-time user who can install Gemini will never finish onboarding here.
- SEVERITY: HIGH
- CONFIDENCE: HIGH CONFIDENCE
- EXPECTED: A unique job (task capture, private local orb, specific workflow) or do not launch.

## RT-002 — Onboarding is “hand over your cloud credentials”
- AREA: UX / Security / Growth
- WHAT IS WRONG: The first screen asks for `GEMINI_API_KEY`. That is not onboarding. That is transferring billing risk to the user before any value.
- EVIDENCE: `index.tsx` key-gate copy: “Paste a Gemini API key… This is for testing, not production.”
- IMPACT: Time-to-value is “create a Google Cloud key, leak it into a random tab.” Most users bounce.
- SEVERITY: CRITICAL (trust + activation)
- CONFIDENCE: CONFIRMED

## RT-003 — Product claims a companion; implementation is a stateless demo
- AREA: Product logic
- WHAT IS WRONG: Vision says “think out loud, plan next steps.” Refresh, new tab, or Reset wipes everything. There are no tasks, no notes, no history.
- EVIDENCE: No database. `reset()` clears transcripts. `sessionStorage` holds only the key.
- IMPACT: The name Taskkorb promises work; the app stores none.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-004 — Marketing / metadata still describes a different app
- AREA: Product contradiction
- WHAT IS WRONG: `metadata.json` is still “Copy of Audio Orb.” README and UI say Taskkorb.
- EVIDENCE: `metadata.json` vs `src/product/identity.ts`
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED

## RT-005 — No landing, pricing, account, or return path
- AREA: Growth
- WHAT IS WRONG: There is no site, no signup, no reason to come back tomorrow.
- EVIDENCE: Single `index.html`. No routes.
- SEVERITY: HIGH for a product; expected for a demo
- CONFIDENCE: CONFIRMED
