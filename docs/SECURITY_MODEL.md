# Security Model

## Current trust boundary

The browser tab still talks to Gemini Live directly. A long-lived Gemini API key must never be compiled into the client.

Two credential modes:

1. **Hosted token** — if the *server* has `GEMINI_API_KEY`, Vite mints a short-lived Live ephemeral token at `GET /api/live-session`. The page receives only that token. Live connections use `v1alpha`.
2. **Bring-your-own key** — if no server key is configured, the user pastes a key into tab memory. That key is never written to `localStorage`, `sessionStorage`, cookies, or the JS bundle.

## Rules

- Never log, telemetry, or persist an API key or `auth_tokens/` value
- Never put secrets in git
- Never `define` `GEMINI_API_KEY` into the Vite client
- Treat all model output as untrusted text
- Microphone audio is sent to Google only while Talk is held
- Capture graph must not play the microphone back through speakers
- Public preview URLs should set `PREVIEW_PASSWORD`; the gate must not serve `/src` without the cookie
- The preview cookie is an opaque session token, not the password itself
- `GET /api/health` is public and must never include secrets

## Production requirement

A real host still needs:

- durable TLS hosting (not trycloudflare)
- backend authentication in front of token minting
- rate limits beyond the local 2s cooldown

Until then the product is **test-only**.
