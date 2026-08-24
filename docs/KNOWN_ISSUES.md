# Known Issues

- Public preview links via Cloudflare Quick Tunnels expire and can return 1033/530.
- A pasted Gemini key is still visible to the page and any XSS. Hosted mode reduces this to a short-lived token.
- Preview access is still a shared password; the cookie is no longer that password.
- Live mint of ephemeral tokens has not been proven against Google in this environment.
- Live preview models can be retired by Google without notice.
- Session resumption is implemented against the SDK fields; a real 10-minute Live drop has not been proven here.
- AudioContext still depends on a user gesture to leave `suspended`.
- Transcripts merge cumulative snapshots; overlapping Google shapes can still look incomplete.
- There is no automated browser E2E of the live microphone path in this environment.
- Physical iPhone/Android Gemini talk, iOS AudioWorklet, and iOS 17 WebGL restore after backgrounding are UNVERIFIED here.
- Web pages cannot open iOS Settings or Chrome site settings. Denied-mic copy is manual on purpose.
