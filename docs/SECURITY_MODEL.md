# Security Model

## Current trust boundary

The browser tab is the entire app. A Gemini API key entered by the user is equivalent to full access to that key.

## Rules

- Never log, telemetry, or persist the API key outside `sessionStorage`
- Never put secrets in git
- Treat all model output as untrusted text
- Microphone audio is sent to Google as soon as listening starts
- Capture graph must not play the microphone back through speakers

## Production requirement

Replace the browser key with an ephemeral Live API token minted by a backend the user controls. Until then the product is **test-only**.
