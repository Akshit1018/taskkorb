# Known Issues

- Public preview links via Cloudflare Quick Tunnels expire and can return 1033/530.
- A pasted Gemini key is still visible to the page and any XSS. Hosted mode reduces this to a short-lived token.
- Live mint of ephemeral tokens has not been proven against Google in this environment.
- Live preview models can be retired by Google without notice.
- AudioContext still depends on a user gesture to leave `suspended`.
- Transcripts are incremental fragments and can look incomplete.
- There is no automated browser E2E of the live microphone path in this environment.
