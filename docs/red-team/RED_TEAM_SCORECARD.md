# Red-Team Scorecard

Date: 2026-08-23
Scope: `cursor/orb-product-foundation-79c8` at commit `d0ff9d4` plus working tree.
Method: code-path inspection, unit-test inventory, local/tunnel HTTP checks, competitor research. **No live Gemini conversation was possible** (no API key in this environment).

## Executive scores

| Area | Score | Why this is not higher |
| --- | --- | --- |
| PRODUCT QUALITY | 3/10 | A demo loop with a new name. No account, no job, no reason to stay. |
| USER EXPERIENCE | 3/10 | First action is “give us your cloud billing key.” Primary talk control is an unlabeled red circle. |
| UI QUALITY | 4/10 | Dark orb is atmospheric. Controls look unfinished. Inter is referenced and never loaded. |
| PRODUCT LOGIC | 4/10 | Session reducer exists, then the UI bypasses it and can trap the user after a bad key. |
| FRONTEND | 4/10 | One 570-line god component. Capture races. No cleanup. 833 KB JS + 3.2 MB EXR. |
| BACKEND | 0/10 | There is no backend. |
| DATABASE | 0/10 | There is no database. Conversation dies on refresh. |
| API DESIGN | 1/10 | Browser talks to Google directly. No product API. |
| ARCHITECTURE | 3/10 | Folders were added. The live client, capture, playback, and UI still share one class. |
| AI QUALITY | 2/10 | Prompt is 7 lines. No evals. No tools. No memory. Model IDs are previews. |
| SECURITY | 1/10 | User Gemini key is the entire auth model and can be baked into the JS bundle. |
| PERFORMANCE | 3/10 | Three.js + bloom + 3.2 MB EXR for a talk button. |
| RELIABILITY | 2/10 | Preview hosts 1033. Live session has no resume, no backoff, no quota guard. |
| MARKET COMPETITIVENESS | 1/10 | Gemini app, ChatGPT Voice, and ElevenLabs already ship this job with accounts. |
| PRODUCTION READINESS | 1/10 | Docs themselves mark the product test-only. |

These scores are against a shippable voice product, not against “does the Vite page render.”
