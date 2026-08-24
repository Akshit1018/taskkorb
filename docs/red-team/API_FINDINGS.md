# API Findings

## RT-060 — No product API
- AREA: API
- EVIDENCE: Zero routes, zero OpenAPI, zero versioning.
- SEVERITY: HIGH (as a product). Expected for a demo.
- CONFIDENCE: CONFIRMED

## RT-061 — Google Live client is used as if it were an internal contract
- AREA: API
- EVIDENCE: Hardcoded preview model IDs, `sendRealtimeInput({media})`, `parts[0]`.
- IMPACT: Google can change or retire the preview; the app has no anti-corruption layer.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-062 — Client errors are raw platform strings
- AREA: API / UX
- EVIDENCE: Mic failures pass `error.message` through. Google errors pass `e.message`.
- IMPACT: Users see `NotAllowedError` / WebSocket jargon.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED
