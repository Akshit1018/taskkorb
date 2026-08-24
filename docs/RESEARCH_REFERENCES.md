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
| [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) | Mic needs gesture + grant | Talk-only capture | Auto-start listen |
| [Chrome autoplay](https://developer.chrome.com/blog/autoplay) | Web Audio stays suspended without a tap | Create/resume AudioContext on Talk | Fake unlock without a gesture |
| [Chrome Android mic help](https://support.google.com/chrome/answer/2693767?hl=en&co=GENIE.Platform%3DAndroid) | Recording starts only on the visible tab | Stop tracks on hide | Background listen |
| [Apple 5.1.1 / 2.5.14](https://developer.apple.com/app-store/review/guidelines/) | Consent + visible recording | Talk is the ask; no Settings deep-link | `App-Prefs:` / forced mic paywall |
| [NSMicrophoneUsageDescription](https://developer.apple.com/documentation/bundleresources/information-property-list/nsmicrophoneusagedescription) | Native wrapper only | Documented for later | Info.plist in this Vite site |
| [Samuel Eddy iOS audio sessions](https://samueleddy.com/writing/ios-safari-audio-sessions/) | play-and-record + resume | `navigator.audioSession` hint | Earpiece routing hacks |
| [Matt Montag Safari unlock](https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos) | Silent switch + suspended context | Footer warning + Talk resume | Claiming we can unmute the ringer |
| [Vocal Video iOS mic help](https://help.vocalvideo.com/article/140-troubleshooting-camera-microphone-access-on-iphone-or-ipad) | Website Settings + in-app browsers | Denied copy + embedded warning | Opening Settings for the user |
| [Three.js iOS context lost](https://discourse.threejs.org/t/context-lost-when-backgrounding-safari-on-ios-17-developer-beta-8/55772) | Safari can drop WebGL when backgrounded | `preventDefault` + pause loop | Native WebView 60 FPS promise |

License: no third-party code copied. MDN / Google / vendor docs only.
