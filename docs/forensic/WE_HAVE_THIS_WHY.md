# We Have This — Why?

Every existing surface must justify itself. KEEP / SIMPLIFY / MERGE / REDESIGN / HIDE / REMOVE.

| Feature | Why it exists | Pain it solves | Verdict | Burden-of-proof gaps |
| --- | --- | --- | --- | --- |
| 3D orb | AI Studio leftover + identity bet | “I see it listening” | KEEP, but it is not yet the product | No proof users prefer it to ChatGPT’s orb |
| Hold-to-talk | Cost + accidental send after red-team | Quota burn, barge-in chaos | KEEP as default until always-on is metered | Competes with market one-tap live |
| Key gate | No user accounts | Lets testers connect | HIDE when hosted mint works; do not lead with it | Inverts onboarding |
| Hosted token issuer | Stop putting long-lived keys in JS | RT-090/040 | KEEP, then put real auth in front | UNVERIFIED vs Google |
| Preview password | Public tunnel phishing | Shared lock | KEEP for tunnels; REMOVE as a product auth story | Shared secret |
| Session reducer | Silent failures | Status/phase desync | KEEP | UI still writes status after talk cap |
| PCM module + tests | Overflow / wrong views | Bad audio | KEEP | — |
| Silence RMS | Quota | Silence packets | KEEP, calibrate | Magic 0.012 |
| Transcript localStorage | Refresh wipe | Tiny memory | SIMPLIFY or replace with real history | Cap is silent |
| Export | Support / keep a copy | Download | KEEP | Only format is txt |
| Clear + confirm | Accidental wipe | — | KEEP | No undo |
| Change key / Reconnect | Dead-end recovery | Bad key / drop | KEEP | — |
| CSP meta | XSS blast radius | — | KEEP | unsafe-eval for Vite |
| Privacy sentences | Legal/trust | — | KEEP, then write a real policy | — |
| Telemetry console | Debug | — | KEEP locally; do not call it analytics | — |
| Dist secret scan | Build-time key leak | — | KEEP | — |
| Model fallback | Preview IDs die | — | KEEP | Both IDs can die together |
| System instruction | Persona | Short replies, Hindi request | SIMPLIFY if it does not change behavior | UNVERIFIED obedience |
| EffectComposer | Leftover post stack | None without bloom | SIMPLIFY to raw renderer | Extra GPU |
| `piz_compressed.exr` | Old reflection map | None | REMOVE | 3.3 MB dead |
| `utils.ts` | Compatibility | None | REMOVE | Unused |
| `RESET` event | Incomplete machine | None | REMOVE or wire | Dead |
| Footer “not production” | Honesty | Prevents fake launch | KEEP until hosting exists | Contradicts hosted-token UX |
| Docs volume (`docs/`) | Agent memory | Prevents career-OS drift | KEEP the decisions; do not let docs outgrow the app | — |

## Fake sophistication

| Looks like | Is | Flag |
| --- | --- | --- |
| Living orb | Analyser uniforms on a sphere | Visual theater unless states map to conversation |
| “Taskkorb” | Audio pipe | Naming theater |
| Hosted service | Vite plugin | Architecture theater |
| Product telemetry | `console.info` | Observability theater |
| Companion memory | 2400 chars in localStorage | Memory theater |

Deterministic software is correctly used for PCM, session, validation. AI is correctly used for the voice. The failure is using AI as the **entire product** without a job Gemini.app does not already do.

## Copycat detector

This is not a generic SaaS dashboard. It is a **generic AI Studio orb** with extra domain files. The template is Google’s Audio Orb, not Tailwind bento.

Own product logic: hold-to-talk + reducer + token issuer. Everything visual is inherited.

## Delete-the-docs test

Without README:

- Preview password page: operable.
- Key gate: operable only if the user already knows what a Gemini API key is.
- Hold Talk: operable after they read the button.
- Hosted vs BYO: not explained in the ready state.

A consumer product that requires knowing Google AI Studio has already failed the test.
