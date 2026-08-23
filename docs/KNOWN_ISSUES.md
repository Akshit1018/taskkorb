# Known Issues

- Public preview links via Cloudflare Quick Tunnels expire and can return 1033/530.
- Gemini API keys entered in the browser are visible to the page and any XSS.
- Live preview models can be retired by Google without notice.
- AudioContext still depends on a user gesture to leave `suspended`.
- Transcripts are incremental fragments and can look incomplete.
- There is no automated browser E2E of the live microphone path in this environment.
