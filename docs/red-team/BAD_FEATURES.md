# Bad Features

Features that exist and should be removed, hidden, or redesigned.

## BF-001 — Browser API key gate as the product front door
Keep for local dev. Do not present as the product. Redesign behind a server token.

## BF-002 — Continuous always-on streaming once “Start” is hit
There is no hold-to-talk. Silence still costs money. Redesign.

## BF-003 — `visual.ts` 2D visualizer
Dead. Remove or isolate. It is not a feature.

## BF-004 — `@lit/context` dependency
Unused. Remove.

## BF-005 — 3.2 MB EXR environment map
The orb is invisible until it loads, then it is a lighting trick. A procedural material would be cheaper. The file is in git (3.2 MB) which also hurts clone time.

## BF-006 — Public Cloudflare demo as if it were a release
It taught testers that the product 1033s. Stop treating tunnels as launches.

## BF-007 — Reset that also nukes transcripts
Two features smashed into one unlabeled button.
