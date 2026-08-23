# Taskkorb

Speak, and the orb answers.

This started as a Google AI Studio Audio Orb export. It is now a browser voice companion: Gemini Live Audio in, spoken reply out, 3D orb as the surface.

## What this is not

This repository is not a career, resume, interview, or job-tracking product. Those systems do not exist here.

## Run locally

1. `npm install`
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`, or paste a key in the UI
3. `npm run dev`
4. Open http://localhost:3000

The UI key stays in the current browser tab. That is for testing only.

## Checks

- `npm test`
- `npm run typecheck`
- `npm run build`

## Product memory

Start with [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md).

Adversarial inspection (2026-08-23): [docs/red-team/RED_TEAM_FINDINGS.md](docs/red-team/RED_TEAM_FINDINGS.md).
