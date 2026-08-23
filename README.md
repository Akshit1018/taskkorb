# Taskkorb

Speak, and the orb answers.

This started as a Google AI Studio Audio Orb export. It is now a browser voice companion: Gemini Live Audio in, spoken reply out, 3D orb as the surface.

## What this is not

This repository is not a career, resume, interview, or job-tracking product. Those systems do not exist here.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env.local`
3. Optional: set server-only `GEMINI_API_KEY` so the app mints a short-lived Live token and testers do not paste a key
4. Optional: set `PREVIEW_PASSWORD` to lock public preview URLs
5. `npm run dev`
6. Open http://localhost:3000

Without a server key, paste a Gemini key in the UI. That value stays in tab memory only and is never written to disk or the JS bundle. This is still test-only.

## Checks

- `npm test`
- `npm run typecheck`
- `npm run build`

## Product memory

Start with [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md).

Adversarial inspection (2026-08-23): [docs/red-team/RED_TEAM_FINDINGS.md](docs/red-team/RED_TEAM_FINDINGS.md).
