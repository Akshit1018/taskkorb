# Quality Scorecard

Scored against the current acceptance bar: a trustworthy voice-orb loop, not a fictional career OS.

| Dimension | Score | Evidence |
| --- | --- | --- |
| Product Value | 7/10 | Core loop is now the product, not an untitled demo |
| User Experience | 8/10 | Tap or hold Talk; Hindi chrome; speaking ends when audio ends |
| UI Quality | 8/10 | Talk-first + remaining time + localized More sheet |
| Logic Correctness | 8/10 | Session reducer, reconnect policy, mint retry tests |
| Architecture | 7/10 | Reconnect/listen/mint extracted; UI still owns the Live client |
| Frontend Quality | 7/10 | Lazy audio, worklet capture, guarded visual |
| Backend Quality | 4/10 | Vite token issuer + preview gate. Not a production host. |
| API Quality | 7/10 | `/api/live-session` now returns Retry-After; Gemini Live still direct |
| Data Design | 6/10 | Session snapshot is explicit; transcripts are local-only |
| Security | 6/10 | Opaque preview session; mint still shared-password authorized |
| Performance | 6/10 | Dead EXR removed; main JS still ~800 KB |
| Accessibility | 8/10 | Landmarks, Escape dismiss, remaining-time label, reduced motion |
| Testing | 8/10 | 77 unit tests including activation, mobile runtime, reconnect |
| Observability | 6/10 | Structured `taskkorb` events |
| Maintainability | 7/10 | Decisions and backlog recorded |
| Research Confidence | 8/10 | Firecrawl scrape of MDN, Chrome, Apple 5.1.1, iOS audio/WebGL blogs |
| Documentation | 8/10 | Vision matches the repository |

Critical dimensions below 8 remain open: onboarding vs Gemini/ChatGPT, durable hosting, and live-audio proof.
