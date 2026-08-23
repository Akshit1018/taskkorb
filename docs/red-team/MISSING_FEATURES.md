# Missing Features

Only items a voice companion user would reasonably expect. Not a career-OS wishlist.

| Feature | Why it matters | Evidence it is missing | Priority |
| --- | --- | --- | --- |
| Hosted auth / ephemeral token | Cannot launch without it | No server | P0 |
| Change / revoke API key | Bad-key dead end | No UI | P0 |
| Durable public host | 1033 already happened | trycloudflare | P0 |
| Silence detection / push-to-talk option | Cost + accidental send | Continuous PCM | P0 |
| Conversation history | Refresh loses work | No store | P1 |
| Human-readable errors | Mic/key failures | Raw `error.message` | P1 |
| Visible talk control label | Unlabeled red disc | `sr-only` only | P1 |
| Session resume / reconnect | Live sockets drop | Reset only | P1 |
| Privacy disclosure | Audio leaves the device | None | P1 |
| Voice + language settings | Hindi users, Orus-only | Hardcoded | P2 |
| Export transcript | Support + memory | None | P2 |
| Mute / volume | Playback can blast | None | P2 |
| Reduced-motion mode | A11y | None | P2 |
| Rate / minute meter | Quota surprise | None | P2 |
| Evaluations | Prompt quality | None | P2 |
| Landmarks / focus rings | A11y | `outline: none` | P2 |
| iOS safe-area | Mobile | No `env(safe-area-inset-*)` | P2 |

Not recommended unless the owner pivots: resume builder, ATS, job tracker, candidate graph.
