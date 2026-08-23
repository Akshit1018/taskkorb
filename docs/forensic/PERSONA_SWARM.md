# Hostile Persona Swarm

Each persona walks the **actual** journeys. Friction events are counted. No praise.

Core journeys: Entry → Unlock → Connect → Talk → Hear → Return.

## Friction budget

ChatGPT Voice: open app → tap waveform → mic prompt → talk. About **3** events ([HOW TO: Use ChatGPT Voice](https://jjtechish.substack.com/p/how-to-use-chatgpt-voice)).

Taskkorb BYO (best case, local, key already in clipboard): open → (password) → wait “Opening session…” → paste key → Connect → wait → understand Hold Talk → mic prompt → hold → speak. **8–10** events.

Taskkorb BYO (realistic first time): above + create Gemini key in Google AI Studio + survive a dead tunnel. **15+**.

---

### ZERO-PATIENCE (10–30s)

Walk: opens shared trycloudflare URL.

- Hesitation: blank 1033 or a password box. No orb, no speech.
- Failure: if 1033, product does not exist.
- If password works: “Opening session…” then a Gemini API key form. 30 seconds are gone.
- Trust: copy says testing, not production.
- Would they return? No.

### NON-TECHNICAL

Walk: same, then key gate.

- Confusion: “Gemini API key” is not a consumer concept.
- Missing: a link that creates the key, or better, no key.
- Unnecessary step: leaving the product to Google Cloud.
- They will type a Google account password into the key field. That is a support incident waiting.

### POWER USER

Walk: hosted mode if configured; otherwise paste key once per tab.

- Missing shortcuts: Space works only when Talk is focused. No `?` help, no voice picker, no transcript search.
- Forced beginner loop: hold Talk every burst. No always-on after first grant.
- Ceiling: they do not get faster on day 30. There is nothing to master except “hold the red button.”

### MOBILE-ONLY (this project’s real testers)

Walk: iOS Safari over a tunnel.

- Failure modes: 1033, 812 KB JS, getUserMedia on insecure contexts, AudioWorklet on iOS **UNVERIFIED**.
- Hold-to-talk vs thumb: `pointerleave` stops recording if the finger slides. Easy accidental pause.
- Safe-area CSS exists; device lab was not run (SUSPECTED overlap with home indicator still possible).
- Competitors: native apps, lock-screen continuity ([Engadget: ChatGPT Voice stays active in background](https://www.engadget.com/2230975/how-to-use-chatgpt-voice-mode/)).

### SKEPTICAL

Walk: reads the gate.

- Trust issue: first action is “give us a key that spends your money.”
- Privacy footer helps slightly. No policy, no company, no account isolation.
- Hosted token is better, but they cannot verify the token is short-lived from the UI.
- Alternative: Gemini app, same model family, Google’s brand.

### CHAOTIC

Walk: submits `a`, then a 20k paste, then double-taps Connect, then Clears.

- `a` and 20k: now rejected (PROVEN in `api-key.test.ts`). Older red-team form torture is **OUTDATED**.
- Double-submit: locked (`connectInFlight`).
- Clear: confirm. Accidental Clear still has no undo.
- Change key vs Cancel: Cancel hides the gate without changing the key. Easy to think they “logged out.”

### LARGE-DATA

Walk: talks for an hour.

- Transcript cap 2400 chars/side silently drops the start. No warning.
- 180s talk cap stops them mid-thought with a status string that bypasses the reducer.
- No session cost meter. Quota surprise is the product.

### RETURNING (weeks later)

Walk: opens the same origin.

- Forgot: what Taskkorb is, where the key came from, why Talk is hold-not-tap.
- Remembered: maybe a leftover transcript they do not recognize.
- Missing: “continue last conversation,” login, voice they chose.
- 30-day test: the product is not more useful. It has not learned. It has not reduced work.

### ACCESSIBILITY

Walk: keyboard + screen reader.

- Talk is labeled; focus rings exist (older RT-010/035 **OUTDATED**).
- Missing: `<main>`, skip link, heading in the live view, live region for connecting vs ready is a status div.
- Reduced motion: camera orbit off, shaders still move.
- Password input `autocomplete="off"` fights managers.

### BAD-NETWORK

Walk: 3G / flaky tunnel.

- 812 KB JS before the gate is useful (after password).
- Live socket drops → CLOSED → manual Reconnect. No backoff UI.
- Hosted remint is 2s rate-limited; user just sees failure copy.
- Tunnel 1033 is indistinguishable from “the product is down.”

---

## 5-minute product test (composite new user)

| Question | Answer | Confidence |
| --- | --- | --- |
| Do they understand the value? | “A talking ball that wants my Google key.” | STRONG |
| Did they achieve anything useful? | Only if they already had a key and the model answered. | UNVERIFIED for the answer |
| Friction? | 8–15 events vs 3. | STRONG |
| Trust? | Decreased at the key gate. | STRONG |
| Would they return? | Not versus Gemini/ChatGPT. | HYPOTHESIS |

## 30-day user test

| Question | Answer |
| --- | --- |
| More useful? | No. |
| Remembers context? | A capped local string, same browser only. |
| Reduces repeated work? | Re-paste key (BYO) or remint (hosted). Same hold-to-talk. |
| Accumulated data valuable? | 2400 characters is not a corpus. |
| Lock-in? | Inconvenience (lost key, lost tunnel), not value. |
