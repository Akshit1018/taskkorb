# Backend Findings

There is no application backend. That is not a pass. It is the defect.

## RT-040 — No server at all
- AREA: Backend
- EVIDENCE: Vite SPA only. `@google/genai` is constructed in the browser with the user key.
- IMPACT: No auth, no quotas, no logs, no abuse control, no ephemeral tokens.
- SEVERITY: CRITICAL for production
- CONFIDENCE: CONFIRMED

## RT-041 — No idempotency, retries, or jobs
- AREA: Backend
- EVIDENCE: Live reconnect is “tap Reset.”
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-042 — Docs describe a future token issuer that does not exist
- AREA: Backend / Trust
- EVIDENCE: `docs/EXTERNAL_DEPENDENCIES.md` and `docs/ARCHITECTURE.md` specify ephemeral tokens as required later.
- IMPACT: Architecture is aspirational. Operators may think a boundary exists.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED
