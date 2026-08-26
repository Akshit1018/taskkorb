# Mem0 + OpenMemory: official facts for Taskkorb memory

Research only. **No product code in this change.** Written 26 Aug 2026.

Question: what do the **official** [docs.mem0.ai](https://docs.mem0.ai) pages (and the Apache-2.0 `mem0ai/mem0` repo they point to) actually ship for **REST vs MCP**, **Docker**, **license**, and **how Taskkorb would plug it** — without rewriting the voice path.

**Hard rule:** Taskkorb is a **browser voice orb** today (Gemini Live, no backend). Official Mem0 docs tell you **not** to put a Platform API key in client-side code. [API overview](https://docs.mem0.ai/api-reference) Memory is a **later attach**, matching [TASK-005](https://github.com/Akshit1018/taskkorb) (no conversation memory across reset) on the orb-product-foundation notes. Do not fake a memory layer in the Vite tab.

Parallel CLI in this environment required an unauthenticated device login (expired). Firecrawl CLI was **unauthenticated**. Facts below are from official-page fetches of docs.mem0.ai, GitHub `LICENSE`, GitHub repo metadata, and the last published OpenMemory README on commit `3e6ab394`. This is **not legal advice**. Licenses and hosted products change.

---

## Answer first

**Do not build on OpenMemory.** Official docs no longer have an OpenMemory section. Use **Platform REST** (managed) or the **OSS Docker REST server** (self-host). Use **hosted MCP only** for editor agents, not for the orb.

| Copy into Taskkorb later | Do not copy / do not claim |
|---|---|
| **Server-side `add` then `search`.** Send conversation turns after a useful utterance; inject ranked memories before the next model turn. Same loop on Platform and OSS. [How it works](https://docs.mem0.ai/core-concepts/how-it-works) | Calling Mem0 from the **browser** with a long-lived key. Official API docs: keep the key server-side. [API overview](https://docs.mem0.ai/api-reference) |
| **Scope every call** with `user_id` (and later `agent_id` / `run_id`). Unscoped search mixes people. [How it works](https://docs.mem0.ai/core-concepts/how-it-works) | That OpenMemory is the current official local product. It is **sunset**; docs pages are gone. |
| Official **voice** pattern: `AsyncMemoryClient.add` on the user turn, `search`, inject into chat context (LiveKit cookbook). [LiveKit](https://docs.mem0.ai/integrations/livekit) | Wiring **MCP** into the orb UI. Hosted MCP is for Claude / Cursor / Codex / VS Code, not a voice surface. [Mem0 MCP](https://docs.mem0.ai/platform/mem0-mcp) |
| **REST from a future Taskkorb backend** once ephemeral Gemini tokens exist. Platform: `https://api.mem0.ai` + `Authorization: Token`. OSS: `http://localhost:8888` + `X-API-Key`. | Treating Platform `/v1`/`/v3` paths as the OSS server. OSS has **no** `/v1/` prefix (`POST /memories`). [REST API](https://docs.mem0.ai/open-source/features/rest-api) |
| Study **Apache 2.0** OSS (`mem0ai/mem0`) with attribution if we copy files. Calling the hosted API is not a license grant to vendor Platform. | Shipping OpenMemory Docker (`localhost:8765` MCP). Official replacement is `cd server && make bootstrap`. [OpenMemory README (historical)](https://raw.githubusercontent.com/mem0ai/mem0/3e6ab394/openmemory/README.md) · [Self-hosted setup](https://docs.mem0.ai/open-source/setup) |
| Store **extracted facts**, not raw microphone PCM, unless the user consents to logging audio. Mem0 extracts from **text messages**. [How it works](https://docs.mem0.ai/core-concepts/how-it-works) | Claiming OSS has Platform Graph / Decay / Dream / Temporal. Those are Platform-only. [Platform vs OSS](https://docs.mem0.ai/platform/platform-vs-oss) |

**v1 memory model to copy:** after a Taskkorb backend exists, persist **transcript text** with `user_id`, search before the next Live turn, inject a short memory block into the session instructions. Keep the orb and Gemini Live path unchanged.

---

## Comparison (official facts only)

| Surface | Official docs | What it is | Protocol | Auth | Where data lives | Docker | License | Taskkorb plug |
|---|---|---|---|---|---|---|---|---|
| **Mem0 Platform** | [docs.mem0.ai](https://docs.mem0.ai) · [Overview](https://docs.mem0.ai/platform/overview) · [Quickstart](https://docs.mem0.ai/platform/quickstart) | Managed memory API + dashboard (`app.mem0.ai`) | **REST** `https://api.mem0.ai` (v3 add/search in quickstart) | `Authorization: Token <key>` | Mem0 cloud | None (hosted) | Hosted product. OpenAPI license field says Apache 2.0; that is the spec header, not “the cloud is OSS.” [Add memories](https://docs.mem0.ai/api-reference/memory/add-memories) | **Preferred attach:** backend `MemoryClient` / cURL. Do not put the key in the orb tab. |
| **Mem0 MCP (hosted)** | [Mem0 MCP](https://docs.mem0.ai/platform/mem0-mcp) · index: [llms.txt](https://docs.mem0.ai/llms.txt) | Same Platform memories, exposed as MCP **tools** | **MCP over HTTPS** `https://mcp.mem0.ai/mcp` | Browser OAuth, or bearer API key | Mem0 cloud (“not on your computer”) | None. `npx mcp-add … --type http` | Same Platform account | **Not the orb.** Optional later if Taskkorb grows an editor/agent sidecar. |
| **Mem0 OSS library** | [OSS overview](https://docs.mem0.ai/open-source/overview) · [Python QS](https://docs.mem0.ai/open-source/python-quickstart) · [Node QS](https://docs.mem0.ai/open-source/node-quickstart) | In-process `Memory()` / `mem0ai/oss` | In-process SDK (not HTTP) | Your LLM/embedder keys | Your vector store (default local Qdrant + SQLite history) | Not required | **Apache 2.0** on [mem0ai/mem0](https://github.com/mem0ai/mem0) ([LICENSE](https://raw.githubusercontent.com/mem0ai/mem0/main/LICENSE), GitHub `license.spdx_id` = `Apache-2.0`) | Possible inside a Python/Node backend. Not importable into the browser orb as the Platform client. |
| **Mem0 OSS server** | [Self-hosted setup](https://docs.mem0.ai/open-source/setup) · [REST API](https://docs.mem0.ai/open-source/features/rest-api) | FastAPI + dashboard | **REST** (no `/v1/` prefix). OpenAPI at `/docs` | JWT, per-user `X-API-Key: m0sk_…`, or legacy `ADMIN_API_KEY`. Auth **on by default**. | Your Postgres + pgvector | **Yes:** `cd server && make bootstrap` or `make up`. API `:8888`, dashboard `:3000`. Image `mem0/mem0-api-server`. Raw docker maps `:8000`. | Same Apache 2.0 repo | **Self-host attach** if we refuse to send orb transcripts to Mem0 cloud. Still needs a Taskkorb backend to hold the key. |
| **OpenMemory** | **Removed from docs.mem0.ai** (HTTP 404 on `/openmemory`; `/openmemory/quickstart` redirects to `/introduction`). Changelog: OpenMemory section dropped from doc-search skill. [Changelog](https://docs.mem0.ai/changelog/openclaw) | Historical **local MCP + UI** in `openmemory/` | MCP SSE `http://localhost:8765/mcp/<client>/sse/<user-id>` + REST docs at `:8765/docs` | README did not document production auth; third-party writeups called localhost SSE unauthenticated — **do not treat as current official security** | Local Docker volumes (Qdrant + SQLite in the last README) | **Was:** `make build && make up` (MCP `:8765`, UI `:3000`). Folder **gone from `main`** (GitHub API 404). Last README: commit [`3e6ab394`](https://raw.githubusercontent.com/mem0ai/mem0/3e6ab394/openmemory/README.md) | Lived under the same Apache-2.0 monorepo while it existed | **Do not plug.** Official sunsetting notice: use OSS self-hosted server instead. |
| **mem0-mcp-server (old)** | Redirects to hosted MCP | Archived wrapper around Platform API | stdio / Docker `/mcp` | `MEM0_API_KEY` | Platform | Optional archived Docker | Apache 2.0 badge on [mem0ai/mem0-mcp](https://github.com/mem0ai/mem0-mcp) | **Do not plug.** Use `https://mcp.mem0.ai/mcp`. |

---

## REST vs MCP (what official docs actually say)

Mem0’s own index treats these as **different channels to the same memory loop**, not two products you must pick forever. [llms.txt](https://docs.mem0.ai/llms.txt)

| | **REST** | **MCP** |
|---|---|---|
| **Who calls it** | Your app / backend / cURL / SDK (`MemoryClient`) | An MCP **client** (Claude Desktop, Claude Code, Cursor, Codex, Windsurf, VS Code, OpenCode) |
| **Who decides add/search** | **You.** Call `add` after a turn; call `search` before the next model request. [How it works](https://docs.mem0.ai/core-concepts/how-it-works) | **The agent.** Tools: `add_memory`, `search_memories`, `get_memories`, `get_memory`, `update_memory`, `delete_memory`, `delete_all_memories`, `delete_entities`, `list_entities`, plus `list_events` / `get_event_status` on hosted MCP. [Mem0 MCP](https://docs.mem0.ai/platform/mem0-mcp) |
| **Platform URL** | `POST https://api.mem0.ai/v3/memories/add/` and `…/v3/memories/search/` in the current quickstart. [Quickstart](https://docs.mem0.ai/platform/quickstart) | `https://mcp.mem0.ai/mcp` (HTTP MCP). Older docs also mention `https://mcp.mem0.ai`. [llms.txt](https://docs.mem0.ai/llms.txt) · [Mem0 MCP](https://docs.mem0.ai/platform/mem0-mcp) |
| **OSS URL** | Compose: `http://localhost:8888/memories`, `/search`. Raw image: port **8000**. **No** `/v1/` prefix. [REST API](https://docs.mem0.ai/open-source/features/rest-api) | **Not documented** on the current OSS setup/REST pages. Local MCP was OpenMemory, which is sunset. |
| **Auth header** | Platform: `Authorization: Token <key>`. OSS: `X-API-Key` or `Authorization: Bearer <jwt>`. | Hosted: OAuth browser sign-in, or API key as bearer. `401 Authentication required` if neither. |
| **Memories live** | Platform cloud or your OSS stores | Hosted MCP: “in your Mem0 account, not on your computer.” [Mem0 MCP](https://docs.mem0.ai/platform/mem0-mcp) |
| **Taskkorb** | **This is the plug.** Backend owns the key and the user id. | Only if we later add an MCP-speaking coding agent. The orb is not an MCP client. |

Quickstart also says you can skip calling `add`/`search` yourself and “hand Mem0 to your agent as a set of tools” via MCP. That sentence is for coding agents, not a Live Audio orb. [Quickstart](https://docs.mem0.ai/platform/quickstart)

---

## Docker (official)

### Current: OSS self-hosted stack

Reference path is Docker Compose in `server/`. [Self-hosted setup](https://docs.mem0.ai/open-source/setup)

| Item | Official fact | URL |
|---|---|---|
| Prerequisites | Docker + Compose; `OPENAI_API_KEY` (or other provider); ports **8888** (API) and **3000** (dashboard) | [Setup](https://docs.mem0.ai/open-source/setup) |
| Required env | `OPENAI_API_KEY`, `JWT_SECRET` (server refuses to start auth without it) | same |
| Optional env | `ADMIN_API_KEY` (legacy), `AUTH_DISABLED=true` (**local only**), `DASHBOARD_URL`, `POSTGRES_*` | same |
| Browser path | `cd server && make up` → wizard at `http://localhost:3000/setup` | same |
| Agent/CI path | `cd server && make bootstrap` prints admin + first `m0sk_…` key | same |
| Published image | `docker pull mem0/mem0-api-server` then `docker run -p 8000:8000 --env-file .env` | [REST API](https://docs.mem0.ai/open-source/features/rest-api) |
| Compose port map | Container 8000 → host **8888** | same |
| Defaults (server) | LLM `gpt-5-mini`, embedder `text-embedding-3-small`, store **Postgres + pgvector**. Bundled providers: `openai`, `anthropic`, `gemini`. | [OSS overview](https://docs.mem0.ai/open-source/overview) |
| Auth upgrade | Pre-1.x open endpoints now **401** until `ADMIN_API_KEY`, wizard, or `AUTH_DISABLED` | [Setup](https://docs.mem0.ai/open-source/setup) |

### Historical: OpenMemory stack (do not start for Taskkorb)

Last official README (commit `3e6ab394`; **not on current `main`**):

| Item | Fact | URL |
|---|---|---|
| Status | “OpenMemory is being sunset. For local self-hosted memory with a dashboard, please use the Mem0 self-hosted server instead. Get started with `cd server && make bootstrap`.” | [README](https://raw.githubusercontent.com/mem0ai/mem0/3e6ab394/openmemory/README.md) |
| Run | `make build` then `make up` (or `curl …/openmemory/run.sh \| bash`) | same |
| Ports | MCP/API `http://localhost:8765` (`/docs`), UI `http://localhost:3000` | same |
| Client install | `npx @openmemory/install local http://localhost:8765/mcp/<client-name>/sse/<user-id> --client <client-name>` | same |
| Default models | OpenAI `gpt-4o-mini` + `text-embedding-3-small`; optional Ollama | same |
| Docs site | `/openmemory` **404**; skill changelog says OpenMemory was **removed from the docs site** | fetch 26 Aug 2026 · [Changelog](https://docs.mem0.ai/changelog/openclaw) |
| Repo `main` | `openmemory/` **404** on GitHub Contents API (26 Aug 2026) | `https://api.github.com/repos/mem0ai/mem0/contents/openmemory` |

---

## Apache 2.0 (what is and is not covered)

| Claim | Official evidence |
|---|---|
| The **open-source repo** is Apache License 2.0 | Raw [LICENSE](https://raw.githubusercontent.com/mem0ai/mem0/main/LICENSE) (Apache 2.0, January 2004; appendix copyright `[2023] [Taranjeet Singh]`). GitHub repo `license.key` = `apache-2.0` on [mem0ai/mem0](https://github.com/mem0ai/mem0) |
| Platform OpenAPI document names the spec license “Apache 2.0” | [Add memories](https://docs.mem0.ai/api-reference/memory/add-memories) OpenAPI `info.license.name` |
| Archived `mem0-mcp-server` was Apache 2.0 | [mem0ai/mem0-mcp](https://github.com/mem0ai/mem0-mcp) (repo is a **public archive**; docs send you to hosted MCP) |
| Apache 2.0 **permits** use, modification, and distribution in a closed product if we keep the license, change notices, and NOTICE/attribution | LICENSE §§2–4. **Not legal advice.** |
| Apache 2.0 does **not** grant the Mem0 name/logo as our product mark | LICENSE §6 (trademarks) |
| **Platform hosting, dashboard, and MCP at mcp.mem0.ai** are a commercial service. Using them is an API contract + their ToS, not “we shipped Apache code.” | [Platform vs OSS](https://docs.mem0.ai/platform/platform-vs-oss) · [API overview](https://docs.mem0.ai/api-reference) |
| OSS vs Platform feature split is **not** a license split. Graph Memory, Decay, Temporal Reasoning, Dream, webhooks, export, batch, feedback, `app_id` / orgs are **Platform-only**. | [Platform vs OSS](https://docs.mem0.ai/platform/platform-vs-oss) |

**Taskkorb line:** prefer **calling** REST (Platform or our OSS container). If we later copy OSS files into this repo, keep the Apache notice. Do not name the orb “Mem0” or “OpenMemory.”

---

## How Taskkorb would plug it

Taskkorb today: Vite + Lit + Gemini Live Audio, **no server**. Product vision already says memory must attach **without rewriting the voice path**. Backlog item: no memory across reset.

Official Mem0 mental model (both products): [How it works](https://docs.mem0.ai/core-concepts/how-it-works)

```
user speaks → Taskkorb already has a transcript
     → backend POST add(messages, user_id)
next user turn (or session start)
     → backend POST search(query, filters.user_id)
     → inject short memories into Live system/context
orb / Gemini Live path unchanged
```

### Recommended attach (after a backend exists)

1. **Do not** import `mem0ai` in `index.tsx`. Official Platform API: “Never expose it in client-side code.” [API overview](https://docs.mem0.ai/api-reference)
2. When TASK-002 (ephemeral Gemini token) lands, add a small memory route on that same backend.
3. **Default: Platform REST** (`MemoryClient` or `POST /v3/memories/add/` + `/v3/memories/search/`). Fastest; no vector DB. [Quickstart](https://docs.mem0.ai/platform/quickstart)
4. **If transcripts must stay on our infra:** Docker OSS server (`make bootstrap`), then the same loop against `POST /memories` and `POST /search` with `X-API-Key`. [REST API](https://docs.mem0.ai/open-source/features/rest-api)
5. **Scope:** `user_id` = Taskkorb account (not “everyone on this laptop”). Optional `run_id` per Live session, `agent_id` = `taskkorb-orb`.
6. **Write path:** after a user turn, send `{role, content}` **text**. Official extraction is additive; it stores facts, not the full transcript, unless `infer=false`. [Add memories](https://docs.mem0.ai/api-reference/memory/add-memories) · [How it works](https://docs.mem0.ai/core-concepts/how-it-works)
7. **Read path:** search with the latest user text; pass only top hits into the next Live instructions. Official LiveKit cookbook does exactly this with `AsyncMemoryClient`. [LiveKit](https://docs.mem0.ai/integrations/livekit)
8. **Gemini:** OSS bundled providers already include `gemini`. Platform has a Google ADK cookbook (`MemoryClient` + `load_memory`). Neither is a Live Audio drop-in; both are **server** patterns. [OSS setup](https://docs.mem0.ai/open-source/setup) · [Google ADK](https://docs.mem0.ai/integrations/google-ai-adk)
9. **MCP:** skip for the orb. Hosted MCP is the editor plugin (`npx mcp-add --url https://mcp.mem0.ai/mcp`). [Mem0 MCP](https://docs.mem0.ai/platform/mem0-mcp)
10. **OpenMemory:** skip. Docs gone, folder gone from `main`, official notice says use `server/` instead.

### What not to claim

- That Taskkorb “includes OpenMemory.”
- That the browser orb is an MCP server or client.
- That OSS Docker gives Platform Graph / Dream.
- That we read or store raw microphone audio in Mem0. Official APIs take **messages**. Session logging of raw audio is a separate Taskkorb consent rule.

---

## Official URL list

### Index and product split

| Page | URL |
|---|---|
| Docs home | https://docs.mem0.ai |
| Agent index | https://docs.mem0.ai/llms.txt |
| Introduction | https://docs.mem0.ai/introduction |
| Platform vs OSS | https://docs.mem0.ai/platform/platform-vs-oss |
| How it works | https://docs.mem0.ai/core-concepts/how-it-works |
| OpenAPI spec | https://docs.mem0.ai/openapi.json |
| Changelog (OpenMemory removed from docs) | https://docs.mem0.ai/changelog/openclaw |

### REST

| Page | URL |
|---|---|
| Platform quickstart (cURL v3) | https://docs.mem0.ai/platform/quickstart |
| Platform API overview | https://docs.mem0.ai/api-reference |
| Add memories (v3) | https://docs.mem0.ai/api-reference/memory/add-memories |
| Search memories | https://docs.mem0.ai/api-reference/memory/search-memories |
| OSS REST server | https://docs.mem0.ai/open-source/features/rest-api |
| OSS self-hosted Docker | https://docs.mem0.ai/open-source/setup |
| OSS overview | https://docs.mem0.ai/open-source/overview |

### MCP

| Page | URL |
|---|---|
| Hosted Mem0 MCP | https://docs.mem0.ai/platform/mem0-mcp |
| Live MCP endpoint | https://mcp.mem0.ai/mcp |
| Gemini + Mem0 MCP cookbook | https://docs.mem0.ai/cookbooks/frameworks/gemini-3-with-mem0-mcp |
| Archived local MCP wrapper | https://github.com/mem0ai/mem0-mcp |

### Voice / companion (server-side patterns)

| Page | URL |
|---|---|
| LiveKit + Mem0 | https://docs.mem0.ai/integrations/livekit |
| Pipecat + Mem0 | https://docs.mem0.ai/integrations/pipecat |
| ElevenLabs + Mem0 | https://docs.mem0.ai/integrations/elevenlabs |
| Google ADK + Mem0 | https://docs.mem0.ai/integrations/google-ai-adk |
| Voice companion (OpenAI) | https://docs.mem0.ai/cookbooks/companions/voice-companion-openai |
| Building an AI companion | https://docs.mem0.ai/cookbooks/essentials/building-ai-companion |

### License and OpenMemory history

| Page | URL |
|---|---|
| Source repo | https://github.com/mem0ai/mem0 |
| LICENSE (Apache 2.0) | https://raw.githubusercontent.com/mem0ai/mem0/main/LICENSE |
| Last OpenMemory README (sunset notice) | https://raw.githubusercontent.com/mem0ai/mem0/3e6ab394/openmemory/README.md |
| OpenMemory on current docs | https://docs.mem0.ai/openmemory → **404** (26 Aug 2026) |

---

## Sources

- [Build AI apps that remember](https://docs.mem0.ai/introduction)
- [Mem0 llms.txt](https://docs.mem0.ai/llms.txt)
- [Platform vs Open Source](https://docs.mem0.ai/platform/platform-vs-oss)
- [Platform Quickstart](https://docs.mem0.ai/platform/quickstart)
- [Mem0 REST API overview](https://docs.mem0.ai/api-reference)
- [Add Memories](https://docs.mem0.ai/api-reference/memory/add-memories)
- [Mem0 MCP](https://docs.mem0.ai/platform/mem0-mcp)
- [Open Source Overview](https://docs.mem0.ai/open-source/overview)
- [Self-Hosted Setup](https://docs.mem0.ai/open-source/setup)
- [REST API Server](https://docs.mem0.ai/open-source/features/rest-api)
- [How Mem0 Works](https://docs.mem0.ai/core-concepts/how-it-works)
- [LiveKit integration](https://docs.mem0.ai/integrations/livekit)
- [Google ADK integration](https://docs.mem0.ai/integrations/google-ai-adk)
- [Changelog](https://docs.mem0.ai/changelog/openclaw)
- [mem0ai/mem0 LICENSE](https://raw.githubusercontent.com/mem0ai/mem0/main/LICENSE)
- [mem0ai/mem0 GitHub API](https://api.github.com/repos/mem0ai/mem0)
- [OpenMemory README (3e6ab394)](https://raw.githubusercontent.com/mem0ai/mem0/3e6ab394/openmemory/README.md)
- [mem0ai/mem0-mcp (archived)](https://github.com/mem0ai/mem0-mcp)
