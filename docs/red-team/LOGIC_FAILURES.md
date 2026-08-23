# Logic Failures

## RT-020 — Invalid transitions are accepted
- AREA: Logic
- EVIDENCE: `OPENED` from `locked` is legal. Tests even do `reduceSession(INITIAL_SESSION, {type: 'OPENED'})`. `LISTEN_STARTED` from `error` is not blocked by the reducer (only by the UI helper).
- IMPACT: The machine documents states but does not enforce a lifecycle.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED

## RT-021 — `canStartListening('speaking')` is true without a live mic
- AREA: Logic
- EVIDENCE: `canStartListening` returns true for `speaking`. Speaking can theoretically persist if AUDIO_OUT arrives while a previous listen ended incorrectly, or if phase is speaking and the user hits Start again after a partial stop race.
- IMPACT: Second capture graph can attach while audio is playing.
- SEVERITY: MEDIUM
- CONFIDENCE: HIGH CONFIDENCE

## RT-022 — Model fallback only catches `connect()` throw
- AREA: Logic / Reliability
- EVIDENCE: `for (const model of models) { try { this.session = await connect...; return } }`. If the first model opens a socket then `onerror`/`onclose` fires, fallback never runs.
- IMPACT: User sees disconnect, not a retry on `preview-09-2025`.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-023 — Only `parts[0]` audio is played
- AREA: Logic / AI
- EVIDENCE: `message.serverContent?.modelTurn?.parts?.[0]?.inlineData`
- IMPACT: Later PCM parts in the same turn are dropped. Choppy or silent replies.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED (code). Playback quality NEEDS VERIFICATION live.

## RT-024 — Double `initClient` / `initSession` races
- AREA: Logic
- EVIDENCE: `connectedCallback` calls `initClient` if `apiKey` exists. `saveApiKey` also calls `initClient`. Env-injected key auto-connects on load without a user gesture (`resume()` may fail). Rapid Reset stacks connects; previous `this.session` is closed only in `reset()`, not if `initSession` is re-entered.
- IMPACT: Two live sockets, leaked callbacks writing into the new UI state.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-025 — `startRecording` is not re-entrancy safe
- AREA: Logic
- EVIDENCE: Disabled only when `listening`. During `getUserMedia` the button stays enabled. Double tap opens two mics.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-026 — Playback `source.start(nextStartTime)` is unguarded
- AREA: Logic
- EVIDENCE: No try/catch. If `nextStartTime` is slightly in the past, browsers throw `InvalidStateError`.
- IMPACT: One late chunk can break the message handler.
- SEVERITY: MEDIUM
- CONFIDENCE: HIGH CONFIDENCE

## RT-027 — ERROR then LISTEN_STOPPED keeps error
- AREA: Logic
- EVIDENCE: `LISTEN_STOPPED` keeps `error` if phase was error. Mic-deny calls `stopRecording()` after ERROR; `wasListening` is false so LISTEN_STOPPED may not fire. If it does, user stays in error.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED
