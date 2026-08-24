# Forensic Product Intelligence — Taskkorb

**Date:** 2026-08-23  
**Code:** branch `cursor/forensic-intel-79c8` (includes remediations from `cursor/resolve-red-team-p0-79c8`)  
**Method:** RECONSTRUCT → VERIFY → EXPERIENCE → COMPARE → ATTACK → DISPROVE → RANK → RE-ATTACK  
**Stance:** Inspect only. Do not implement.

This pack upgrades the earlier red-team files. Those files remain useful as a historical attack, but many specialist claims are **stale** after remediations. This pack is the current source of truth.

## Read order

1. [JOURNEY_RECONSTRUCTION.md](./JOURNEY_RECONSTRUCTION.md) — what the product actually is
2. [FEATURE_TRUTH_MAP.md](./FEATURE_TRUTH_MAP.md) — claimed vs real
3. [PRODUCT_MENTAL_MODEL.md](./PRODUCT_MENTAL_MODEL.md) — what it is trying to become
4. [PERSONA_SWARM.md](./PERSONA_SWARM.md) — hostile users walking the journeys
5. [ABSENT_CAPABILITIES.md](./ABSENT_CAPABILITIES.md) — what a user reasonably expects and does not get
6. [HOSTILE_BENCHMARK.md](./HOSTILE_BENCHMARK.md) — them vs us vs best-in-class
7. [COMPETITOR_ATTACK_SCRIPT.md](./COMPETITOR_ATTACK_SCRIPT.md) — what a competitor can truthfully say
8. [WE_HAVE_THIS_WHY.md](./WE_HAVE_THIS_WHY.md) — keep / simplify / remove
9. [SUPPORT_AND_DISMISSAL.md](./SUPPORT_AND_DISMISSAL.md) — tickets + investor/engineer/designer/founder tests
10. [FORENSIC_VERDICT.md](./FORENSIC_VERDICT.md) — clusters, negative graph, second/third pass, skill log

## Experience performed this session

| Check | Result | Confidence |
| --- | --- | --- |
| `curl http://127.0.0.1:3000/` | HTTP 401 preview-password HTML | PROVEN |
| `curl /src/auth/api-key.ts` | HTTP 401 (source not leaked) | PROVEN |
| `curl /api/live-session` without cookie | HTTP 401 (gate runs first) | PROVEN |
| Unit tests / typecheck / build | 32 tests, tsc, dist secret scan on prior branch | PROVEN |
| Live Gemini talk | Not run — no key, preview locked | UNVERIFIED |
| Physical mic / iOS hold-to-talk | Not run | UNVERIFIED |

## What this product is not

A career OS, resume builder, interview coach, or job tracker. Those systems do not exist in this repository. Treating them as missing features would be a category error.
