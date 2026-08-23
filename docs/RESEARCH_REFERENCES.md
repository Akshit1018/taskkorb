# Research References

Date inspected: 2026-08-23

| Reference | What it solves | Reused | Not reused |
| --- | --- | --- | --- |
| [Pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture) | Hold-to-talk survives finger slide | `setPointerCapture` on Talk | Custom gesture library |
| [Gemini ephemeral tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens.md.txt) | Short-lived Live creds | Existing Vite mint | Locking systemInstruction on the token (blocks language prefs) |
| [ElevenLabs signed URL](https://elevenlabs.io/docs/eleven-agents/guides/quickstarts/next-js) | Browser never sees long-lived key | Pattern only | Their SDK / WebRTC |
| [Gemini Live voices / languages](https://ai.google.dev/gemini-api/docs/live-api) | User-chosen voice and language | Prefs sheet + instruction line | Camera, tools |
| [ChatGPT Voice one-tap](https://www.engadget.com/2230975/how-to-use-chatgpt-voice-mode/) | Talk is the product | Talk-first layout | Always-on unmetered listen |
| [Gemini Live session management](https://ai.google.dev/gemini-api/docs/live-api/session-management) | 10-minute socket limit, GoAway, resumption handle | `sessionResumption` + handle store + GoAway reconnect | Transparent message replay / Vertex 24h window |
| [Firebase Live sessions](https://firebase.google.com/docs/ai-logic/live-api/sessions) | Resume after drop without losing context | Backoff + handle, not a new chat | Their SDK wrapper |
| [RFC 9110 Retry-After](https://www.rfc-editor.org/rfc/rfc9110#name-retry-after) | Honest mint cooldown | Header + one client retry | Multi-retry storms |
| [MDN isSecureContext](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) | Mic fails on public HTTP | Visible warning, disable Talk | Claiming localhost HTTP is broken |

License: no third-party code copied. MDN / Google / vendor docs only.
