# Green Team Tasks

Verified against forensic + current code. Career-OS requests are REJECTED.

| ID | Problem | Finding | Class | Decision | Status |
| --- | --- | --- | --- | --- | --- |
| TASK-G001 | Talk cap writes status outside reducer | Forensic second pass | VERIFIED | LISTEN_CAPPED event | BUILD NOW |
| TASK-G002 | Mobile hold ends on pointerleave | Forensic | VERIFIED | Pointer capture; no leave-stop | BUILD NOW |
| TASK-G003 | Reconnect tears down a good session | Forensic | VERIFIED | Retry only error/closed | BUILD NOW |
| TASK-G004 | Preview cookie is the password | Forensic C2 | VERIFIED | Opaque session token | BUILD NOW |
| TASK-G005 | Transcript is a silent scrap | C5 | VERIFIED | Turns, timestamps, clip flag, undo | BUILD NOW |
| TASK-G006 | Five equal buttons hide Talk | Designer dismissal | VERIFIED | Talk-first + More sheet | BUILD NOW |
| TASK-G007 | Orb ignores conversation phase | C6 | VERIFIED | Phase tint on the sphere | BUILD NOW |
| TASK-G008 | Dead EXR + unused utils | FT-22/23 | VERIFIED | REMOVE | BUILD NOW |
| TASK-G009 | No voice/language/volume | Expected | VERIFIED | Settings in More; reconnect on voice | BUILD NOW |
| TASK-G010 | EffectComposer with only RenderPass | Engineer | VERIFIED | Direct renderer | BUILD NOW |
| TASK-G011 | No health surface | SRE | VERIFIED | GET /api/health | BUILD NOW |
| TASK-G012 | BYO key as product auth | C1/C2 | PARTIALLY VERIFIED | Keep localhost BYO; hosted path first | FOUNDATION — no fake OAuth |
| TASK-G013 | Durable hosting | C3 | VERIFIED | Cannot invent a host here | BLOCKED |
| TASK-G014 | Beat Gemini/ChatGPT | Market 1/10 | NEEDS USER VALIDATION | Do not clone camera/tools | REJECT as this sprint |
| TASK-G015 | Career OS | Category error | FALSE POSITIVE | — | REJECT |

Live Gemini quality remains EXTERNAL_DEPENDENCY_REQUIRED / UNVERIFIED.

## Critic (assume this is insufficient)

- Shared preview password still authorizes minting. Opaque cookies stop password theft from JS, not quota sharing.
- Voice/language changes remint; that can 429 the 2s cooldown.
- `index.tsx` is still the Live client. We raised the surface, not the architecture.
- Competitors still start from an account. We did not beat them and should not claim we did.
- `/api/health` is public by design. It must stay secret-free.

Valid leftover work: user-auth in front of mint, durable host, live E2E. Not leftover: career OS, camera, replacing Lit.
