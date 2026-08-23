# External Dependencies

## GEMINI_API_KEY

- Provider: Google Gemini API
- Use: Live Audio session
- Status: **EXTERNAL_DEPENDENCY_REQUIRED** for a real conversation
- Server integration: optional Vite issuer at `/api/live-session` using `authTokens.create` (v1alpha). **IMPLEMENTED**, mint against Google is **UNVERIFIED** in this environment
- Client fallback: user-pasted browser key, memory-only, **test-only**
- Production still needs a host that authenticates users before minting tokens

## Cloudflare Quick Tunnel

- Use: temporary public preview
- Status: ephemeral, can 1033
- Not a production host

## Local EXR environment map

- Removed. The orb renders without a reflection map.
