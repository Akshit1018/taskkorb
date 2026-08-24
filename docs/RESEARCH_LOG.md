# Research Log

Date: 2026-08-23

## Gemini Live Audio

- Official Live docs still specify 16-bit PCM in at 16 kHz and audio out at 24 kHz.
- Current documented native-audio preview: `gemini-2.5-flash-native-audio-preview-12-2025`
- Newer preview: `gemini-3.1-flash-live-preview` (Google blog, 2026). Not adopted until a live key proves it.
- System instructions are supported. JS issues show `{ role: 'system', parts: [{ text }] }` also works.
- Input/output audio transcription can be enabled in setup config.

## Capture

- Google ADK and recent Gemini live frontends use AudioWorklet, not ScriptProcessor.
- ScriptProcessor is deprecated and was wired into the speaker destination in this repo, which can create echo.

## Hosting

- Cloudflare Error 1033/530 on trycloudflare means the tunnel origin dropped. Quick tunnels are not product hosting.

## Open source

Useful patterns, not copied:

- `google-gemini/gemini-live-api-examples`
- AudioWorklet + ephemeral tokens in `Nishkalkashyap/gemini-live-audio-nextjs-template`
- Orb state driven by analyser amplitude, not canned loops

## Career-platform research

Not applied. Repository evidence does not support that product.
