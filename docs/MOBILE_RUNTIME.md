# How the floating orb works on iOS and Android

Date inspected: 2026-08-24. Sources were found with Firecrawl search and scraped to `.firecrawl/` (not shipped). Career-OS claims stay rejected. This is a **web page**, not an App Store or Play Store binary.

## Short answer

The bowl is a **Three.js canvas** plus a **Talk-gated microphone**. It does **not** auto-listen, and it **must not** bounce the user into system Settings.

| Question | Fact |
| --- | --- |
| Does the orb start listening on its own? | **No.** [MDN `getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) requires a permission prompt and a user grant. Chrome and Safari also require a **user gesture** before Web Audio can play with sound ([Chrome autoplay policy](https://developer.chrome.com/blog/autoplay), [Matt Montag unlock notes](https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos)). |
| Can we auto-redirect to Settings? | **No on the web.** Safari pages cannot open `App-Prefs:` / `prefs:root`. Those schemes are **private APIs**; native apps that use them are rejected ([Stack Overflow / App Review quote](https://stackoverflow.com/questions/5655674/opening-the-settings-app-from-another-app)). Android Chrome cannot be sent to `chrome://` from a normal site. After a deny, we show **manual** steps only. |
| Do we break Apple rules today? | **Not as a website.** [App Store Review 5.1.1](https://developer.apple.com/app-store/review/guidelines/) (purpose strings, no forced consent, no trick prompts) applies when we wrap this in a native app. The web Talk button is the consent moment. [Guideline 2.5.14](https://developer.apple.com/app-store/review/guidelines/) also requires a visible indication while recording — Talk stays pressed/tinted. |
| Native wrapper later? | Then iOS **requires** `NSMicrophoneUsageDescription` ([Apple docs](https://developer.apple.com/documentation/bundleresources/information-property-list/nsmicrophoneusagedescription)). Android needs `RECORD_AUDIO` in the manifest. Disclose that audio goes to Google Gemini ([5.1.2 third-party / AI sharing](https://developer.apple.com/app-store/review/guidelines/)). |

## What the orb actually is

1. **Picture:** `visual-3d.ts` draws an icosahedron sphere on a WebGL canvas. It does not use the camera. Pixel ratio is capped at 1 so iOS memory stays sane. Animation pauses when the tab is hidden. We call `preventDefault` on `webglcontextlost` so iOS 17+ can restore the context after Safari is backgrounded ([Three.js iOS 17 thread](https://discourse.threejs.org/t/context-lost-when-backgrounding-safari-on-ios-17-developer-beta-8/55772), [MDN `webglcontextlost`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event)).
2. **Hear:** Gemini Live audio is decoded into an `AudioContext` and played through `destination` — not `SpeechSynthesis`. That matches the iOS pattern that keeps replies on the speaker instead of the earpiece ([Samuel Eddy, iOS Safari audio sessions](https://samueleddy.com/writing/ios-safari-audio-sessions/)).
3. **Speak:** Talk (hold or tap) is the only `getUserMedia({ audio: true, video: false })` call. Capture is an AudioWorklet with ScriptProcessor fallback.

Hosted bootstrap may open the Gemini **WebSocket** on load. That is not a microphone grant. AudioContext is created on Talk.

## Permission and dependency map

### Both platforms (browser)

- **HTTPS** (or localhost). Otherwise `navigator.mediaDevices` is `undefined` ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)).
- **Microphone permission** on first Talk. Browsers may remember the origin.
- **User gesture** to create/resume `AudioContext` and to play unmuted audio ([Chrome autoplay](https://developer.chrome.com/blog/autoplay)).
- **Permissions-Policy: microphone=(self)** so iframes cannot steal the mic ([MDN Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/microphone)).
- **No camera, location, or notifications.**
- **In-app browsers** (Mail, WhatsApp, Instagram, Facebook) often cannot grant the mic. Open in Safari or Chrome ([Vocal Video iOS help](https://help.vocalvideo.com/article/140-troubleshooting-camera-microphone-access-on-iphone-or-ipad)).

### iPhone / iPad (Safari or Chrome-on-iOS — both are WebKit)

- First Talk shows Safari’s microphone prompt. After deny:
  1. Address bar **AA → Website Settings → Microphone → Allow** ([Vocal Video](https://help.vocalvideo.com/article/140-troubleshooting-camera-microphone-access-on-iphone-or-ipad)).
  2. Or **Settings → Safari → Microphone**.
  3. Chrome-on-iOS also needs **Settings → Chrome → Microphone** at the app level.
- We **cannot** deep-link any of those. `prefs:root=` / `App-Prefs:` are private and App Review rejects them ([Stack Overflow App Review reply](https://stackoverflow.com/questions/5655674/opening-the-settings-app-from-another-app)). Native apps may only open **their own** settings via `UIApplicationOpenSettingsURLString` — still useless for a website.
- **Silent/ringer switch** can mute Web Audio even after permission ([Matt Montag](https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos)).
- WebKit infers `AVAudioSession`. `getUserMedia` flips the session to play-and-record. We declare `navigator.audioSession.type = 'play-and-record'` when the API exists (Safari 16.4+ / iOS 17 era, [MDN AudioSession](https://developer.mozilla.org/en-US/docs/Web/API/AudioSession)).
- `AudioContext` created **on Talk**, not on hosted auto-connect. Creating it on page load leaves it `suspended` on iOS.
- We `resume()` before capture and before each reply chunk. Timers in the middle of a gesture chain break playback ([Samuel Eddy](https://samueleddy.com/writing/ios-safari-audio-sessions/)).
- Home Screen “Add to Home Screen” is still Safari. It is **not** an App Store app and does **not** need Info.plist until we wrap it.
- iPadOS 13+ can report as Macintosh. We treat `Macintosh` + `maxTouchPoints > 1` as iOS.

### Android (Chrome)

- First Talk shows Chrome’s Allow / Block sheet. **Allowed sites** may start recording only while that tab is in front. A different Chrome tab or a different app cannot start recording ([Chrome Android help](https://support.google.com/chrome/answer/2693767?hl=en&co=GENIE.Platform%3DAndroid)).
- We **stop mic tracks** when the document is hidden so Talk state matches the OS mute.
- If the user blocks the site: lock icon → Site settings → Microphone.
- If the **app** microphone is off at OS level: Android Settings → Apps → Chrome → Permissions. We cannot toggle that.
- Installing as a PWA can relax autoplay-with-sound ([Chrome autoplay](https://developer.chrome.com/blog/autoplay)), but it does **not** skip the first mic prompt.

### If we later ship App Store / Play binaries (Capacitor / WKWebView)

| Platform | Extra requirement | Why |
| --- | --- | --- |
| iOS | `NSMicrophoneUsageDescription` purpose string | Rejected without it ([Apple](https://developer.apple.com/documentation/bundleresources/information-property-list/nsmicrophoneusagedescription)) |
| iOS | 5.1.1: ask only when Talk is used; no “enable mic to continue” paywall | [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) |
| iOS | 2.5.14: visible indication while recording | Talk pressed + listening tint |
| iOS | Do not request camera “just in case” | 5.1.1(iv) — no unnecessary access |
| iOS | Do not use `prefs:root` / `App-Prefs` | Private API, account-termination risk |
| Android | `RECORD_AUDIO`, runtime permission | Play policy + Chrome WebView |
| Both | Disclose that audio goes to Google Gemini | 5.1.2 third-party / AI sharing |
| Both | WebGL in a WebView is less stable than Safari/Chrome | [Three.js mobile context-lost](https://discourse.threejs.org/t/how-to-fix-context-lost-android-iphone-ios/56829) |

**Status:** `EXTERNAL_DEPENDENCY_REQUIRED` / not implemented. This repo is a Vite web app.

## Auto-trigger and “redirect the human”

| Idea | Allowed? | What we do |
| --- | --- | --- |
| Start mic on page load | **No** | Talk only |
| Start mic after hosted token mint | **No** | Socket may connect; AudioContext waits for Talk |
| `window.location = 'App-Prefs:root=Safari'` | **No** (private URL, App Review / web forbidden) | Text instructions |
| Open Android app-settings intent from the web | **No** | Text instructions |
| Browser permission dialog | **Yes** | Happens inside `getUserMedia` after Talk |
| After deny, keep showing Talk + how to fix | **Yes** | Error copy, no trick loops |
| Keep recording after the user leaves the tab | **No** (Chrome Android policy + honesty) | Stop tracks on `visibilitychange` |

Tricking people into granting the mic, or requiring the mic for something that is not Talk, would break [5.1.1(iv)](https://developer.apple.com/app-store/review/guidelines/).

## What we changed after this research

- AudioContext is created on Talk, not on silent hosted bootstrap.
- Resume the graph before capture and before each playback chunk.
- Set `play-and-record` when `navigator.audioSession` exists.
- Denied-mic copy names Safari Website Settings / Chrome Site settings and **says we cannot open them**.
- iPhone silent-switch warning.
- In-app browser warning.
- Stop the microphone when the tab is hidden.
- `preventDefault` on WebGL context lost; restart the loop if restored.
- `Permissions-Policy` header + mobile web-app meta tags.
- iPadOS desktop-mode user-agent detection.

Live Gemini on a physical iPhone/Android is still **UNVERIFIED** in this environment.

## Sources

- [MDN MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) (scraped 2026-08-24)
- [MDN Permissions-Policy: microphone](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/microphone) (scraped 2026-08-24)
- [MDN AudioSession](https://developer.mozilla.org/en-US/docs/Web/API/AudioSession) (scraped 2026-08-24)
- [MDN webglcontextlost](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event) (scraped 2026-08-24)
- [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay) (scraped 2026-08-24)
- [Use camera and microphone in Chrome — Android](https://support.google.com/chrome/answer/2693767?hl=en&co=GENIE.Platform%3DAndroid) (scraped 2026-08-24)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (scraped 2026-08-24)
- [NSMicrophoneUsageDescription](https://developer.apple.com/documentation/bundleresources/information-property-list/nsmicrophoneusagedescription) (scraped 2026-08-24)
- [Samuel Eddy — iOS Safari audio sessions](https://samueleddy.com/writing/ios-safari-audio-sessions/) (scraped 2026-08-24)
- [Matt Montag — Unlock Web Audio in Safari](https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos) (scraped 2026-08-24)
- [Speechmatics — browser microphone access](https://blog.speechmatics.com/browser-microphone-access) (scraped 2026-08-24)
- [Vocal Video — iPhone/iPad mic troubleshooting](https://help.vocalvideo.com/article/140-troubleshooting-camera-microphone-access-on-iphone-or-ipad) (scraped 2026-08-24)
- [Opening the Settings app from another app](https://stackoverflow.com/questions/5655674/opening-the-settings-app-from-another-app) (scraped 2026-08-24)
- [Three.js — context lost on Android/iPhone](https://discourse.threejs.org/t/how-to-fix-context-lost-android-iphone-ios/56829) (scraped 2026-08-24)
- [Three.js — iOS 17 backgrounding context lost](https://discourse.threejs.org/t/context-lost-when-backgrounding-safari-on-ios-17-developer-beta-8/55772) (scraped 2026-08-24)
- [webrtcHacks — Autoplay restrictions and WebRTC](https://webrtchacks.com/autoplay-restrictions-and-webrtc/) (listed by Firecrawl search)
