# Decisions

## D001 — This is a voice orb, not a career platform

- Alternatives: rebuild as a candidate/resume/job OS; keep the orb and pretend those systems exist
- Evidence: repository contains only the AI Studio Audio Orb
- Choice: keep and productionize the orb
- Reversal: an explicit owner decision to change the product category

## D002 — Client API key is test-only

- Alternatives: block all use until a backend exists; hide the risk
- Choice: prefer a server-minted ephemeral Live token when `GEMINI_API_KEY` is present; otherwise allow tab-local key entry
- Reversal: replace the Vite issuer with an authenticated production host

## D003 — Session state is a reducer

- Alternatives: ad-hoc string status in the Lit element
- Choice: `reduceSession` so connection, listening, and errors cannot drift silently
- Reversal: only if a richer workflow engine is introduced

## D004 — AudioWorklet first, ScriptProcessor fallback

- Evidence: ScriptProcessor is deprecated; Gemini Live examples use AudioWorklet
- Choice: worklet capture, fallback to ScriptProcessor 2048, never route capture into speakers
- Reversal: if a maintained capture library replaces this

## D005 — Model `gemini-2.5-flash-native-audio-preview-12-2025`

- Alternatives: keep `...preview-09-2025`; jump to `gemini-3.1-flash-live-preview` immediately
- Choice: the current documented 2.5 native-audio preview. 3.1 is newer and unproven on this key
- Reversal: after a live key proves 3.1 availability
