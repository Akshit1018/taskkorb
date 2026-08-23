# Research References

Date inspected: 2026-08-23

| Reference | What it solves | Reused | Not reused |
| --- | --- | --- | --- |
| [Pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture) | Hold-to-talk survives finger slide | `setPointerCapture` on Talk | Custom gesture library |
| [Gemini ephemeral tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens.md.txt) | Short-lived Live creds | Existing Vite mint | Locking systemInstruction on the token (blocks language prefs) |
| [ElevenLabs signed URL](https://elevenlabs.io/docs/eleven-agents/guides/quickstarts/next-js) | Browser never sees long-lived key | Pattern only | Their SDK / WebRTC |
| [Gemini Live voices / languages](https://ai.google.dev/gemini-api/docs/live-api) | User-chosen voice and language | Prefs sheet + instruction line | Camera, tools |
| [ChatGPT Voice one-tap](https://www.engadget.com/2230975/how-to-use-chatgpt-voice-mode/) | Talk is the product | Talk-first layout | Always-on unmetered listen |

License: no third-party code copied. MDN / Google / vendor docs only.
