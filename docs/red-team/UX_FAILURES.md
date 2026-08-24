# UX Failures

## RT-010 — Primary action is an unlabeled red circle
- AREA: UX / UI
- EVIDENCE: `#startButton` visible children are only `.sr-only` “Start talking”. Sighted users get a red disc. Status text says “tap the red button” only after connect.
- IMPACT: First-time user hesitation. People tap Reset or Stop instead.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED
- REPRO: Open app after key entry. Look at the control row.

## RT-011 — After a bad key the gate disappears and you cannot change the key
- AREA: UX / Logic
- EVIDENCE: `saveApiKey` sets `this.apiKey` then calls `initClient()`. Render hides the form whenever `this.apiKey` is truthy. There is no “change key” or “sign out.”
- IMPACT: Typo / invalid key → stuck on a dead orb. Recovery is DevTools → sessionStorage.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED
- REPRO: Submit `sk-invalid`. Gate vanishes. Start stays disabled. Only Reset retries the same bad key.

## RT-012 — Error phase disables talking with no recovery CTA
- AREA: UX / Logic
- EVIDENCE: `canStartListening` is only `ready|speaking`. After mic deny, `ERROR` is set. Red button disabled. Copy is the raw `NotAllowedError` string.
- IMPACT: User thinks the product is broken.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-013 — Status and error fight; machine is bypassed
- AREA: UX / Logic
- EVIDENCE: `startRecording` writes `this.sessionState = { ...this.sessionState, status: 'Requesting microphone access…' }` instead of dispatching an event. Reducer is not the single writer.
- IMPACT: Status can desync from phase.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED

## RT-014 — Transcripts have no max length, scroll, or clear
- AREA: UX
- EVIDENCE: `userTranscript` / `orbTranscript` concatenate forever at `top: 6vh` over the orb.
- IMPACT: After one minute the orb is covered. No history export.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED

## RT-015 — Reset is destructive and unlabeled as such
- AREA: UX
- EVIDENCE: `reset()` closes the session and clears both transcripts. No confirm.
- IMPACT: Accidental tap loses the only record of the conversation.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED

## RT-016 — Mobile: 64–72px controls sit on a full-bleed WebGL canvas
- AREA: UX / Mobile
- EVIDENCE: Controls are `bottom: 11vh` with no safe-area insets. iOS home indicator can cover Stop.
- IMPACT: Missed taps, especially on notched phones.
- SEVERITY: MEDIUM
- CONFIDENCE: HIGH CONFIDENCE (CSS inspected; device lab not run)

## RT-017 — Copy tells users the product is not a product
- AREA: UX / Trust
- EVIDENCE: Key card: “This is for testing, not production.”
- IMPACT: Correct honesty, fatal for conversion.
- SEVERITY: HIGH as a launched product
- CONFIDENCE: CONFIRMED
