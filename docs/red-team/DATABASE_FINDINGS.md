# Database Findings

No database, no schema, no migrations.

## RT-050 — Conversation has no owner and no durability
- AREA: Database
- EVIDENCE: Transcripts live in Lit `@state`. Refresh = gone.
- IMPACT: “Companion” cannot remember a single sentence.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-051 — The only persisted field is a secret
- AREA: Database / Security
- EVIDENCE: `sessionStorage.setItem('GEMINI_API_KEY', nextKey)`
- IMPACT: Shared/stolen device leaks billing. Incognito looks like “logout” but the product never says that.
- SEVERITY: CRITICAL
- CONFIDENCE: CONFIRMED
