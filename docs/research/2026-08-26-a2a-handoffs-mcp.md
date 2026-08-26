# A2A vs OpenAI handoffs vs MCP (official facts)

Research only. Written 26 Aug 2026.

Question: what do **official** Google/Linux Foundation A2A docs and the **official** OpenAI Agents SDK / MCP spec actually say, and what architecture should a **2–10 person Taskkorb** household/team use.

**Hard rule:** these three layers are complementary, not substitutes. Official A2A: MCP is agent-to-tool; A2A is agent-to-agent; A2A is **not** a sub-agent or tool-call protocol. Official OpenAI: handoffs transfer conversation ownership inside one SDK run; MCP attaches tools/context. Do not market Taskkorb specialists as “A2A agents” unless they are independently hosted, opaque, and discovered via an Agent Card.

Firecrawl CLI and Parallel CLI were **unauthenticated** in this environment. Facts below are from official docs fetched the same day. This is **not legal advice**. Specs move.

---

## Answer first

**For 2–10 person Taskkorb: in-process Agents SDK (handoffs + agents-as-tools) + MCP for tools. Do not stand up A2A between household specialists.**

| Layer | Official job | Use in Taskkorb v1 | Do not use for |
|---|---|---|---|
| **MCP** | Standardize how a host connects to **tools, data, prompts** ([MCP intro](https://modelcontextprotocol.io/docs/getting-started/intro); [architecture](https://modelcontextprotocol.io/docs/learn/architecture)) | Calendar, mail, ledger DB, Notion, filesystem. Least-privilege + approval on write/money. | Routing between people or Taskkorb specialists |
| **OpenAI handoffs** | Specialist **takes over** the user-facing turn inside one run ([handoffs](https://openai.github.io/openai-agents-python/handoffs/); [orchestration](https://openai.github.io/openai-agents-python/multi_agent/)) | Triage → budget vs chores vs calendar when that specialist should speak | Cross-vendor / cross-process agents |
| **Agents as tools** | Manager **keeps** the reply; specialist is a bounded helper ([orchestration](https://openai.github.io/openai-agents-python/multi_agent/); [platform orchestration](https://developers.openai.com/api/docs/guides/agents/orchestration)) | Lookups the household manager must synthesize (budget snapshot + next chore) | Long specialist-owned conversations |
| **A2A** | Independent/opaque agents **discover + delegate tasks** without sharing memory/tools ([A2A home](https://a2a-protocol.org/latest/); [spec 1.0.0](https://a2a-protocol.org/v1.0.0/specification/)) | Later: bank / payroll / third-party household agents | Internal Taskkorb sub-agents (officially out of scope) |

---

## 1. Google A2A — official

**Launched** 9 Apr 2025 as an open protocol that **complements** Anthropic’s MCP ([Google Developers Blog](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)). **Donated** to the Linux Foundation; TSC includes AWS, Cisco, Google, IBM Research, Microsoft, Salesforce, SAP, ServiceNow ([A2A home](https://a2a-protocol.org/latest/); [donation post](https://developers.googleblog.com/en/google-cloud-donates-a2a-to-linux-foundation/)). Latest released spec: **1.0.0**. Apache-2.0. Normative data model: `spec/a2a.proto` ([spec](https://a2a-protocol.org/v1.0.0/specification/)).

**What it is:** client agent ↔ remote agent over HTTP(S). Bindings: JSON-RPC 2.0, gRPC, HTTP/REST. Task lifecycle + artifacts; messages have typed “parts” (text, audio, video, UI). Long-running tasks + streaming/push. Auth schemes aligned with OpenAPI ([announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/); [spec](https://a2a-protocol.org/latest/specification/)).

**Discovery:** Agent Card JSON at `https://{domain}/.well-known/agent-card.json` (RFC 8615). Also curated registries (no standard registry API) or direct config. Card holds name, skills, endpoint, capabilities (`streaming`, `pushNotifications`), auth. Prefer authenticated/extended cards for sensitive skills; no static secrets in the card ([discovery](https://a2a-protocol.org/latest/topics/agent-discovery/); [Google protocol guide, 18 Mar 2026](https://developers.googleblog.com/en/developers-guide-to-ai-agent-protocols/)). Older samples used `/.well-known/agent.json`; **current official path is `agent-card.json`.**

**How A2A works with MCP (official, not a blog take):**

> MCP is for agent-to-tool communication… A2A is for agent-to-agent communication… A2A is **not** a sub-agent or tool-call protocol. A2A does not specify how an agent talks to its own sub-agents or how it invokes tools — use your framework’s native primitives, or MCP, for those. ([A2A home](https://a2a-protocol.org/latest/))

Google’s later guide: MCP first for inventory/email/DB; A2A only when expertise lives in a **remote agent on another team/framework/server** ([protocol guide](https://developers.googleblog.com/en/developers-guide-to-ai-agent-protocols/)).

**Official URLs**

- Home: https://a2a-protocol.org/latest/
- Spec 1.0.0: https://a2a-protocol.org/v1.0.0/specification/
- Spec latest: https://a2a-protocol.org/latest/specification/
- Key concepts: https://a2a-protocol.org/latest/topics/key-concepts/
- Agent discovery: https://a2a-protocol.org/latest/topics/agent-discovery/
- Launch (9 Apr 2025): https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/
- LF donation: https://developers.googleblog.com/en/google-cloud-donates-a2a-to-linux-foundation/
- Protocol map (18 Mar 2026): https://developers.googleblog.com/en/developers-guide-to-ai-agent-protocols/
- Source (LF): https://github.com/a2aproject/A2A
- Spec markdown (google/A2A mirror): https://github.com/google/A2A/blob/main/docs/specification.md

---

## 2. OpenAI Agents SDK — handoffs vs MCP

An agent is an LLM plus **instructions, tools, and handoffs** ([orchestration](https://openai.github.io/openai-agents-python/multi_agent/)).

| Pattern | What happens | Official “best when” |
|---|---|---|
| **Handoffs** | Triage routes; specialist **becomes the active agent** for the rest of the turn. Exposed to the model as tools named `transfer_to_<agent>` | Specialist should speak; keep prompts focused; switch instructions/tools/policy |
| **Agents as tools** | `Agent.as_tool()` / `agent.asTool()`; **manager owns the reply** | Synthesize several specialists; one guardrail surface |
| **MCP** | Attach MCP servers as tools (stdio, SSE, Streamable HTTP, or hosted `HostedMCPTool`) | Filesystem / HTTP / connector-backed tools the agent must call |

Handoffs stay **inside a single run**. Input guardrails apply only to the first agent; output guardrails only to the agent that produces the final output. History is passed unless you `input_filter`. `input_type` is metadata (reason/priority), not destination dispatch — register **one handoff per specialist**. Start with one agent; split only when the next branch needs different instructions, tools, or policy ([handoffs](https://openai.github.io/openai-agents-python/handoffs/); [platform orchestration](https://developers.openai.com/api/docs/guides/agents/orchestration)).

MCP in the SDK is **tool transport**, not orchestration. Official quote they reuse: MCP is a “USB-C port for AI applications.” Connect only trusted servers; least-privilege tokens; require approval for sensitive ops. Hosted MCP runs the tool loop in OpenAI’s Responses API; local transports keep the loop in your process ([MCP](https://openai.github.io/openai-agents-python/mcp/)). MCP **does not** decide who speaks next.

**Official URLs**

- Orchestration (Python): https://openai.github.io/openai-agents-python/multi_agent/
- Handoffs: https://openai.github.io/openai-agents-python/handoffs/
- MCP: https://openai.github.io/openai-agents-python/mcp/
- Orchestration (JS): https://openai.github.io/openai-agents-js/guides/multi-agent/
- Platform orchestration: https://developers.openai.com/api/docs/guides/agents/orchestration
- Agents SDK overview: https://developers.openai.com/api/docs/guides/agents
- MCP spec/intro: https://modelcontextprotocol.io/docs/getting-started/intro
- MCP architecture: https://modelcontextprotocol.io/docs/learn/architecture
- MCP specification: https://modelcontextprotocol.io/specification/latest

---

## 3. 10-line architecture for 2–10 person Taskkorb

1. One Taskkorb **server-of-record**, one household tenant, people as **users + RBAC** — not as A2A agents.
2. One in-process **manager agent** (Agents SDK or equivalent); start as a single agent.
3. Add specialists only when instructions, tools, or policy actually diverge (budget vs chores vs calendar).
4. **Handoff** when that specialist should own the user-facing turn; **`as_tool`** when the manager must synthesize.
5. **MCP** (or first-party function tools) for calendar/mail/ledger/DB — never for person-to-person routing.
6. Money, share, and delete go through **SDK/tool approvals**; MCP tokens least-privilege, never in URLs.
7. Do **not** publish Agent Cards or JSON-RPC A2A between Taskkorb specialists — official A2A forbids using it as a sub-agent protocol.
8. Voice orb / mobile clients are just another client of the **same run**; no extra inter-agent protocol.
9. Optional later: **A2A Agent Card** only at the Taskkorb edge to talk to an external opaque vendor agent (bank, payroll) without sharing memory.
10. If you need A2A someday, keep MCP on the inside and A2A on the outside — Google’s official stack order.

---

## Sources

- [A2A Protocol home](https://a2a-protocol.org/latest/)
- [A2A Specification v1.0.0](https://a2a-protocol.org/v1.0.0/specification/)
- [A2A Specification latest](https://a2a-protocol.org/latest/specification/)
- [A2A Agent Discovery](https://a2a-protocol.org/latest/topics/agent-discovery/)
- [A2A Key Concepts](https://a2a-protocol.org/latest/topics/key-concepts/)
- [Announcing A2A (Google, 9 Apr 2025)](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [Google Cloud donates A2A to Linux Foundation](https://developers.googleblog.com/en/google-cloud-donates-a2a-to-linux-foundation/)
- [Developer’s Guide to AI Agent Protocols (Google, 18 Mar 2026)](https://developers.googleblog.com/en/developers-guide-to-ai-agent-protocols/)
- [OpenAI Agents SDK — Agent orchestration](https://openai.github.io/openai-agents-python/multi_agent/)
- [OpenAI Agents SDK — Handoffs](https://openai.github.io/openai-agents-python/handoffs/)
- [OpenAI Agents SDK — MCP](https://openai.github.io/openai-agents-python/mcp/)
- [OpenAI Agents SDK JS — Agent Orchestration](https://openai.github.io/openai-agents-js/guides/multi-agent/)
- [OpenAI API — Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration)
- [OpenAI API — Agents SDK](https://developers.openai.com/api/docs/guides/agents)
- [MCP — What is MCP](https://modelcontextprotocol.io/docs/getting-started/intro)
- [MCP — Architecture overview](https://modelcontextprotocol.io/docs/learn/architecture)
- [MCP — Specification](https://modelcontextprotocol.io/specification/latest)
