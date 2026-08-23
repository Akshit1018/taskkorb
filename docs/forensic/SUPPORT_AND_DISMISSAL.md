# Support Simulation and Dismissal Tests

## Predicted tickets (clustered)

| Cluster | Example ticket | Root cause | Volume if launched |
| --- | --- | --- | --- |
| Entry dead | “The link says Error 1033” | Quick Tunnel | Every public share |
| Key religion | “Where do I get GEMINI_API_KEY?” | BYO onboarding | Every non-dev |
| Key religion | “I pasted my Gmail password and it failed” | Key field looks like login | Common |
| Key religion | “It worked yesterday, today it asks again” | Memory-only key | Every BYO refresh |
| Mic | “Talk does nothing” | Permission / hold vs tap / not ready | High |
| Mic | “I let go and it stopped mid-sentence” | Hold-to-talk + pointerleave | High on mobile |
| Audio | “I hear nothing / it cuts out” | Live UNVERIFIED, interrupt, AudioContext | High |
| Memory | “Where did my conversation go?” | Cap, Clear, new browser, no account | High |
| Memory | “Why can’t I undo Clear?” | Confirm-only | Medium |
| Cost | “Google billed me” | No quota UI; hosted shared key | Severe |
| Language | “It doesn’t speak Hindi” | Orus + untested instruction | Medium for this audience |
| Hosted | “Everyone on the link is using my key” | Preview password = mint access | Severe if GEMINI_API_KEY set |

Repeated clusters = design failure, not support failure. The first three clusters are the same root: **no product identity, only a Gemini credential.**

## Investor dismissal

| Question | Answer |
| --- | --- |
| Why isn’t this a feature? | It is a feature of Gemini Live, with a shader. |
| Differentiated? | Orb + hold-to-talk. Not enough. |
| Copy barrier? | Weekend. The hard part (Live models) is Google’s. |
| Retention? | None that compounds. |
| Why pay? | Nobody pays Taskkorb. Users pay Google, or the operator does. |
| What grows with usage? | A localStorage string until 2400 characters. |
| Defensible tech? | No. |
| Proprietary data? | No. |
| Distribution? | A tunnel that 1033s, or hope. |

This is not fundraising advice. It is why a skeptical check-writer leaves the room.

## Engineer dismissal

Immediate callouts:

- `index.tsx` still owns socket, mic, playback, and styles (~840 lines).
- Talk-cap status mutates `sessionState` without the reducer.
- Hosted mint is unauthenticated except a shared cookie.
- Preview cookie value **is** the password.
- 812 KB main chunk; unused 3.3 MB EXR still in `public/`.
- Live path has no integration test.
- `connectGeneration` is necessary because the UI is the client.
- Docs contradict code in `PRODUCT_GRAPH` / old red-team files.

Hacky: Vite-as-backend. Fragile: preview models. Under-abstracted: Live client. Over-documented: career-OS rejection letters.

## Designer dismissal

Remove first:

- Five equal-weight buttons under the orb. Change key / Reconnect / Export / Clear compete with Talk.
- “Opening session…” as a full-screen card with no orb.
- Developer words: API key, Gemini, Reconnect.

Change:

- Talk is the product. Everything else is overflow.
- Connected state should be visible on the orb, not only in 14px status text.
- Hold vs tap needs a visible press state that cannot be missed.

Missing:

- Empty transcript state that teaches the gesture.
- Voice/language as a second-level sheet.
- A first screen that is the orb, not a form.

Hierarchy today: WebGL full bleed, then controls, then the actual decision (Talk). Progressive disclosure is inverted.

## Founder dismissal (six months of runway)

Wasted effort if the goal is a company:

- More markdown about being a voice orb
- Shader / EXR archaeology
- Any career-OS work (correctly rejected)
- Token issuer without user auth (half a security story)
- Public tunnels as “launch”

Not wasted:

- Making one talk loop trustworthy
- Deciding the job that Gemini.app does not do, or stopping

If the goal is a demo for friends: the remediations are enough. Stop calling it a product.
