# Product Graph

```
User
  → API key (tab-local, untrusted, not production auth)
  → Live session
      → microphone PCM
      → Gemini Live model
      → spoken reply
      → transcript fragments
  → Orb visual
      → input analyser
      → output analyser
  → Telemetry events (no secrets)
```

## Source of truth

| Data | Source of truth | Notes |
| --- | --- | --- |
| API key | User / sessionStorage | Never logged. Client-side only. |
| Session phase | `src/session/machine.ts` | Deterministic reducer. |
| Live audio connection | Gemini Live WebSocket | External. Can drop. |
| Transcript | Live API transcription parts | Incremental, may be partial. |
| Orb motion | Web Audio analysers | Derived, never canonical. |

## Invalidation

- New API key → old session is invalid → reconnect
- Reset → session, transcripts, and capture graph are cleared
- Mic denied → listening cannot start
- Session close/error → capture must stop being treated as live
- Evidence from a previous turn must not be shown as a new connected session
