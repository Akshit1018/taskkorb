# AI Findings

## RT-080 — Intelligence is a thin wrapper around a preview model
- AREA: AI
- EVIDENCE: `LIVE_MODEL` / `LIVE_MODEL_FALLBACK` are `*-preview-*`. `SYSTEM_INSTRUCTION` is 7 lines. No tools, no RAG, no memory, no eval set.
- IMPACT: Quality is whatever Google ships this week. Taskkorb adds no grounded skill.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-081 — No evaluation
- AREA: AI
- EVIDENCE: Tests cover PCM and the reducer only. Zero cases for “does the orb stay in character,” Hindi, or refusal to take fake actions.
- IMPACT: Prompt regressions ship unnoticed.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-082 — Prompt injection / secret exfil
- AREA: AI / Security
- EVIDENCE: User audio is the only input. Instruction says not to ask for secrets; it does not say to refuse repeating the user’s pasted key or to ignore “ignore previous instructions.”
- IMPACT: A spoken jailbreak can change behavior. If a key is in context, the model may read it back.
- SEVERITY: HIGH
- CONFIDENCE: HIGH CONFIDENCE (prompt inspected; live jailbreak NEEDS VERIFICATION)

## RT-083 — Cost is unbounded
- AREA: AI / Cost
- EVIDENCE: While listening, every worklet quantum is sent. No silence gate, no max session minutes, no user-visible meter.
- IMPACT: A forgotten tab can drain the user’s Gemini quota.
- SEVERITY: HIGH
- CONFIDENCE: CONFIRMED

## RT-084 — Hallucination is indistinguishable from fact
- AREA: AI / Trust
- EVIDENCE: Audio-only replies. Transcript is optional and uncited. Prompt says “do not claim real-world actions” but there is no verifier.
- IMPACT: The orb can invent a plan or a completed task. The UI will play it confidently.
- SEVERITY: HIGH
- CONFIDENCE: HIGH CONFIDENCE

## RT-085 — `Orus` voice and language are hardcoded
- AREA: AI / UX
- EVIDENCE: `LIVE_VOICE = 'Orus'`. `languageCode` is commented out in the original AI Studio file and still absent.
- IMPACT: No user control. Hindi users get whatever the model guesses.
- SEVERITY: MEDIUM
- CONFIDENCE: CONFIRMED
