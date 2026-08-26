# Block / AAIF Goose — FACT research for Taskkorb

Research only. **No product code in this change.** Written 26 Aug 2026.

**Method:** Firecrawl CLI was installed but **keyless-rate-limited** (`You've hit Firecrawl's keyless free tier rate limit`). No `FIRECRAWL_API_KEY` in this environment. Facts below are from **official GitHub raw docs**, `gh` repo metadata, and official Block / Linux Foundation / App Store pages. Dates are scrape dates unless a page states otherwise.

This is **not legal advice**. Licenses and store listings change.

---

## Hard facts (do not ship the opposite)

| Wish / rumor | Fact | Official source |
|---|---|---|
| Goose is Block’s secret closed agent | **No.** Local-first **open-source** agent. Started at Block; donated to **AAIF** (Linux Foundation) on **9 Dec 2025**. | [Block launch](https://block.xyz/inside/block-open-source-introduces-codename-goose) · [LF press](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) · [Block AAIF](https://block.xyz/inside/block-anthropic-and-openai-launch-the-agentic-ai-foundation) |
| Official GitHub is still `block/goose` | **Redirect.** Canonical repo is [`aaif-goose/goose`](https://github.com/aaif-goose/goose). `block/goose` resolves to the same repo. | GitHub API `full_name` |
| Official docs | [goose-docs.ai](https://goose-docs.ai/). Old [block.github.io/goose](https://block.github.io/goose/) **redirects** there. Mintlify mirror exists at [block-goose.mintlify.app](https://block-goose.mintlify.app/) — treat **goose-docs.ai + repo `documentation/`** as canonical. | [README](https://github.com/aaif-goose/goose/blob/main/README.md) · [redirect page](https://block.github.io/goose/) |
| License is MIT | **No.** Repo `LICENSE` is **Apache License 2.0**. Block launch said ASL2. Docs **homepage marketing still says “MIT licensed”** — that line is **wrong**; do not copy it. | [LICENSE](https://github.com/aaif-goose/goose/blob/main/LICENSE) · [Block launch](https://block.xyz/inside/block-open-source-introduces-codename-goose) · [CUSTOM_DISTROS](https://github.com/aaif-goose/goose/blob/main/CUSTOM_DISTROS.md) · [homepage](https://goose-docs.ai/) |
| Goose is a hosted SaaS we can embed | **No.** Desktop + CLI on **your machine**. Optional `goose serve` ACP HTTP/WebSocket. Custom UIs (web/mobile) are meant to talk to **that** server. | [README](https://github.com/aaif-goose/goose/blob/main/README.md) · [CLI serve](https://goose-docs.ai/docs/guides/goose-cli-commands) · [CUSTOM_DISTROS](https://github.com/aaif-goose/goose/blob/main/CUSTOM_DISTROS.md) |
| MCP is optional / plugin-only | **MCP is the extension model.** Built-in tools are MCP servers. Any MCP server can be added (stdio or Streamable HTTP). Goose can also **expose** its built-ins to other agents. | [Using Extensions](https://github.com/aaif-goose/goose/blob/main/documentation/docs/getting-started/using-extensions.md) |
| Recipes are skills / prompt snippets | **More.** YAML/JSON **agent configs**: title, instructions, prompt, MCP extensions, parameters, retries, sub-recipes, settings. Shareable deeplinks. | [Recipe Reference](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/recipes/recipe-reference.md) |
| Official iPhone agent runs on-device | **No.** App Store **Goose AI** is a **remote client**. Desktop **tunnel + QR setup is retired** in current Desktop. Experimental **on-device Android** (“goose Mobile”) is **archived** and requires deep device access. | [mobile-access.md](https://github.com/aaif-goose/goose/blob/main/documentation/docs/experimental/remote-access/mobile-access.md) · [goose-mobile.md](https://github.com/aaif-goose/goose/blob/main/documentation/docs/experimental/goose-mobile.md) · [App Store](https://apps.apple.com/app/goose-ai/id6752889295) |
| “Use ChatGPT Plus inside Goose” = scrape chatgpt.com | **No.** Official path is **ACP providers**: wrap Claude Code / Codex / Amp CLIs so Plus/Pro **CLI subscriptions** power Goose. Same honesty rule as Taskkorb: Plus ≠ API. | [ACP Providers](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/acp-providers.md) |

---

## 1. What it is

Goose is a **local-first, general-purpose AI agent**: not autocomplete — it **installs, executes, edits, and tests**. Official README: desktop app (macOS / Linux / Windows), full CLI, and an API “to embed it anywhere.” Built in **Rust**. [README](https://github.com/aaif-goose/goose/blob/main/README.md)

Block’s launch post (codename goose): connect LLMs to real-world actions via **MCP**; first productized system is a **software-engineering agent** that reads/writes files, runs tests, installs deps. Custom UIs are explicitly allowed. [Block launch](https://block.xyz/inside/block-open-source-introduces-codename-goose)

Linux Foundation (9 Dec 2025): Goose is a **founding AAIF project** next to Anthropic’s **MCP** and OpenAI’s **AGENTS.md**. Released “early 2025.” Snapshot this run: **~53.5k stars**, Apache-2.0, topics `mcp` / `acp` / `ai-agents`. Latest release seen: **v1.47.0** (21 Aug 2026). [LF press](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation) · GitHub API

**Surfaces (official install docs):**

- **Desktop** — download zip / Homebrew cask `block-goose`
- **CLI** — `curl …/aaif-goose/goose/releases/download/stable/download_cli.sh` or `brew install block-goose-cli`
- **Windows** — Git Bash / MSYS2 / PowerShell / WSL
- **CI** — pin `GOOSE_VERSION`
- Shared config: `~/.config/goose/` (`config.yaml`, recipes, secrets)

[Installation](https://github.com/aaif-goose/goose/blob/main/documentation/docs/getting-started/installation.md)

**Core nouns** ([homepage](https://goose-docs.ai/)):

- **Extensions** — MCP servers (GitHub, Slack, DBs, …)
- **Recipes** — reusable task templates
- **Sessions** — conversation state
- **Providers** — LLM backends
- **Goosehints / AGENT.md** — project instructions

**Built-in extensions** (subset): Developer (default: shell + files — **autonomous by default**), Computer Controller, Memory, Todo (session checklists, **not** a team task product), Chat Recall, Extension Manager, Skills, Summon (subagents). [Using Extensions](https://github.com/aaif-goose/goose/blob/main/documentation/docs/getting-started/using-extensions.md)

Providers: 15+ (Anthropic, OpenAI, Google, Ollama, OpenRouter, Azure, Bedrock, …) via **API keys**, or existing Claude / ChatGPT / Gemini **CLI subscriptions via ACP**. [README](https://github.com/aaif-goose/goose/blob/main/README.md)

---

## 2. MCP

Goose **is an MCP host**. Extensions = MCP servers.

| Kind | How it runs | Taskkorb relevance |
|---|---|---|
| `stdio` | Local process (`npx`, `uvx`, `docker`, …) | Laptop/CI only |
| `builtin` / `platform` | Bundled in Goose | Their Todo/Memory, not our product |
| `streamable_http` | Remote MCP URL | **This is the Taskkorb shape** |
| `frontend` | UI-provided tools | Custom clients |
| `inline_python` | `uvx` snippet | Do not put on a phone |

[Recipe extension schema](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/recipes/recipe-reference.md) · [Using Extensions](https://github.com/aaif-goose/goose/blob/main/documentation/docs/getting-started/using-extensions.md)

Add from Desktop, `goose configure`, or **deeplinks**:

```text
goose://extension?url=<encoded-https-mcp>&type=streamable_http&id=…&name=…&description=…
```

Remote HTTP extensions support OAuth (CIMD / DCR, or pre-registered `client_id`). Goose **malware-checks** external packages before activation. Built-in Goose MCP servers **may be reused by other agents**. CLI: `--with-extension`, `--with-streamable-http-extension`, `goose mcp <name>`.

Directory: [goose-docs.ai/extensions](https://goose-docs.ai/extensions/) plus a large `documentation/docs/mcp/*` catalog (GitHub, Google Drive, Cloudflare, Firecrawl, Square/Cash App, …).

**ACP (different protocol):** `goose serve` = Agent Client Protocol over HTTP/WebSocket (default `127.0.0.1:3284`). Needs `GOOSE_SERVER__SECRET_KEY` unless `--dangerously-unauthenticated`. This is how a **custom web/mobile UI** is supposed to attach. [CLI commands](https://goose-docs.ai/docs/guides/goose-cli-commands) · [CUSTOM_DISTROS](https://github.com/aaif-goose/goose/blob/main/CUSTOM_DISTROS.md)

**ACP as provider (the other direction):** Goose can **wrap** Claude Code, Codex, Amp, Pi so those CLIs are the model and Goose extensions are passed through as MCP. Official tip: **use existing Claude Code or ChatGPT Plus/Pro subscriptions — no per-token API**. [ACP Providers](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/acp-providers.md)

---

## 3. Recipes

Official definition: reusable workflows that package **extensions + prompts + settings**. Create from a session (`/recipe` or Desktop chef-hat), store globally (`~/.config/goose/recipes/`) or per-project (`.goose/recipes/`), list from GitHub via `GOOSE_RECIPE_GITHUB_REPO`, share with `goose recipe deeplink`. [Recipes](https://goose-docs.ai/docs/guides/recipes/) · [Saving Recipes](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/recipes/storing-recipes.md)

**Required:** `title`, `description`, and at least one of `instructions` / `prompt`. Optional: `activities` (Desktop bubbles only), `extensions`, `parameters` (`{{ name }}`, types string/number/boolean/date/file/select), `response` (structured output), `retry`, `settings` (provider/model), `sub_recipes`, `version`. [Recipe Reference](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/recipes/recipe-reference.md)

Scheduler exists (`goose serve --enable-scheduler`). Activities are ignored on CLI/jobs.

There is **no** `aaif-goose/goose-recipes` repo this run (`gh` 404). Discovery is local path + optional GitHub repo env, not a required central cookbook.

---

## 4. License (what we may actually do)

| Rule | Source |
|---|---|
| **Apache-2.0** on the repo (`spdx_id: Apache-2.0`) | GitHub API · [LICENSE](https://github.com/aaif-goose/goose/blob/main/LICENSE) |
| Block: free to use, modify, distribute **including commercial** | [Block launch](https://block.xyz/inside/block-open-source-introduces-codename-goose) |
| Custom distros **must** keep license + copyright; **mark modifications**; **do not** use “Goose” marks as if official | [CUSTOM_DISTROS](https://github.com/aaif-goose/goose/blob/main/CUSTOM_DISTROS.md) |
| White-label / preconfigured providers / branding is a **documented** path | Same + [README](https://github.com/aaif-goose/goose/blob/main/README.md) |
| Optional PostHog telemetry; `GOOSE_DISABLE_TELEMETRY=1` | CUSTOM_DISTROS |

Apache-2.0 is **not** AGPL. We can ship a fork or link the crates. We still owe **NOTICE/copyright**, and we **cannot** call a fork “Goose” as if it were AAIF’s app.

Homepage “MIT licensed” vs `LICENSE` Apache-2.0: **trust the file**. Flag as docs drift.

`goose-mobile` is also **Apache-2.0**. [aaif-goose/goose-mobile](https://github.com/aaif-goose/goose-mobile)

---

## 5. Mobile?

**Three different things. Do not collapse them.**

### A. Desktop / CLI (the real product)

macOS, Linux, Windows. **Not iOS/Android as the agent runtime.** [Installation](https://github.com/aaif-goose/goose/blob/main/documentation/docs/getting-started/installation.md)

### B. App Store “Goose AI” — remote **client** (fragile)

- Listing: [Goose AI](https://apps.apple.com/app/goose-ai/id6752889295), seller **Michael Neale** (not “Block, Inc.”), free, Utilities, iOS 17+, **3.2 MB**, “Data Not Collected”, copyright “Open Source authors, Block Inc 2024”.
- Copy: access your goose assistant **remotely**, track what the agent is doing, connect to **many remote agents**.
- Repo: [`aaif-goose/goose-mobile`](https://github.com/aaif-goose/goose-mobile) — `goose-ios` “connects back to your goose agent … via a tunnel.” App Store AU link in README.
- **Current official docs (unlisted):** Desktop **Remote Access / QR / `/tunnel/start|stop` removed**. “New mobile app connections cannot be configured from Desktop.” [mobile-access.md](https://github.com/aaif-goose/goose/blob/main/documentation/docs/experimental/remote-access/mobile-access.md)
- Roadmap in that repo: Android **client** (Play) not shipped; migrate client to **remote ACP**; push for long jobs. Help-wanted Android: `michaelneale/goose-android`.

So: there **is** a phone app, but it is **not** an on-device Goose, and the **documented pairing path is dead** in current Desktop. Treat “Goose on iPhone” as **early / broken-setup**, not a contract we can copy.

### C. Archived on-device Android (“gosling” / goose Mobile)

Official page marked **Archived / unlisted**: experimental Android that **automates the phone**, notifications, even replace the home screen. Deep device access. “Use at your own risk.” Firebase APK. **Mobile MCP** to call other apps’ tools. [goose-mobile.md](https://github.com/aaif-goose/goose/blob/main/documentation/docs/experimental/goose-mobile.md)

Maintainer blog: the PoC **bought things after an email**. They want future Android to be a **client**, not an on-device takeover. [Author index](https://goose-docs.ai/blog/authors/mic/)

**Do not copy C.** Same class of harm as Taskkorb overlay / SMS / “take over the phone.”

---

## 6. Official links (keep this list)

| What | URL |
|---|---|
| Canonical GitHub | https://github.com/aaif-goose/goose |
| License | https://github.com/aaif-goose/goose/blob/main/LICENSE |
| Docs | https://goose-docs.ai/ |
| Docs in-repo | https://github.com/aaif-goose/goose/tree/main/documentation/docs |
| Install | https://goose-docs.ai/docs/getting-started/installation |
| Extensions / MCP | https://goose-docs.ai/docs/getting-started/using-extensions · https://goose-docs.ai/docs/mcp/ · https://goose-docs.ai/extensions/ |
| Recipes | https://goose-docs.ai/docs/guides/recipes/ |
| Recipe reference | https://goose-docs.ai/docs/guides/recipes/recipe-reference |
| ACP providers | https://goose-docs.ai/docs/guides/acp-providers |
| Custom distros | https://github.com/aaif-goose/goose/blob/main/CUSTOM_DISTROS.md |
| Mobile client repo | https://github.com/aaif-goose/goose-mobile |
| App Store | https://apps.apple.com/app/goose-ai/id6752889295 |
| Discord | https://discord.gg/n8R5VaWDAn |
| AAIF | https://aaif.io/ |
| Block launch | https://block.xyz/inside/block-open-source-introduces-codename-goose |
| Block AAIF | https://block.xyz/inside/block-anthropic-and-openai-launch-the-agentic-ai-foundation |
| LF AAIF press (9 Dec 2025) | https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation |
| Old site (redirect) | https://block.github.io/goose/ |

---

## 7. What Taskkorb can copy

Taskkorb today (`main` / green-team): **voice orb + BYO Gemini**. No task DB, no MCP, no native iOS agent. Cowork memo already said: ship a **task API**, then **remote MCP**; phone is a client; Hermes/Goose-class runtimes stay on a server.

### Copy (honest)

1. **Be an MCP *server*, not a Goose fork.** Goose users add Streamable HTTP with a `goose://extension?url=…&type=streamable_http` deeplink (and the same URL works in Claude Code / Cursor / Codex). That is the “Claude Code EOD writes tasks” path. One store, many agents.

2. **Recipes as a *format*, not a Rust runtime.** YAML: title + instructions + parameters + which tools. Use for team EOD / “review my day” / budget-confirm — stored in **our** backend. Do not require users to install Goose.

3. **Phone = client; agent = user’s machine or our API.** Same architecture Goose *intends* (iOS talks to a remote goose) and that Hermes research already chose. Do **not** copy their retired Desktop tunnel. If a power user runs `goose serve`, Taskkorb can later be an ACP client. v1 does not need that.

4. **ACP / official CLIs for “use my Plus.”** Goose’s documented Plus path is **Codex CLI / Claude Code CLI**, not ChatGPT cookies. Taskkorb must not claim Plus-inside-the-orb. We can tell users: connect Claude Code/Codex to **our MCP**.

5. **Permission modes.** Goose is autonomous + shell by default and then documents tighter permissions. Taskkorb must default the other way on a phone (confirm writes).

6. **Project instructions.** `.goosehints` / `AGENT.md` / AAIF `AGENTS.md` — one team file the orb and MCP both read. Cheap.

7. **Apache-2.0 reuse.** We **may** vendor Goose crates or a thin recipe parser **with** copyright + NOTICE and **without** the Goose trademark. Custom UI over `goose serve` is their documented “high complexity” path — only if we deliberately become a Goose client.

8. **Deeplink install UX.** One tap `goose://…` / `claude mcp add --transport http`. Copy the *habit*, with our URL.

### Do not copy

| Goose thing | Why not |
|---|---|
| Electron desktop / Rust CLI as Taskkorb | Different product (local SWE agent) |
| Developer extension (shell, write files) inside the App Store orb | Review 2.5.2; also their own warning |
| Archived Android “take over the phone” | They archived it; Play + safety |
| Desktop QR tunnel | Officially **removed** |
| Homepage “MIT” | License file is Apache-2.0 |
| Session Todo extension as the team task product | In-session checklist for the agent, not cowork ACL |
| “Goose” name / duck branding | CUSTOM_DISTROS trademark rule |
| On-device full agent in iOS | They did not ship this; we should not either |

### Integration sketch (if we do one thing)

```text
Taskkorb phone / PWA  ──REST──►  our task API
Goose Desktop / CLI   ──MCP Streamable HTTP + OAuth──►  same API
Claude Code / Codex   ──MCP HTTP──►  same API
Optional later: Taskkorb  ──ACP──►  user's goose serve
```

That is copy-the-protocol, not copy-the-binary.

---

## Honesty / UNVERIFIED

- **Firecrawl:** keyless rate limit. Did not scrape JS docs via Firecrawl. In-repo markdown is the same docs site source.
- **App Store:** listing fetched; **did not** install Goose AI on a phone or complete pairing (Desktop tunnel is documented as gone anyway).
- **Mintlify** `block-goose.mintlify.app`: exists; not treated as canonical vs goose-docs.ai.
- **Homepage MIT vs LICENSE Apache-2.0:** unresolved docs bug on their side.
- Live “70+ extensions” / star counts move; numbers are this run’s snapshot.
- Whether `goose serve` + iOS can replace the dead tunnel is **UNVERIFIED** (roadmap says they *plan* ACP on the client).

---

## Sources

- [aaif-goose/goose README](https://github.com/aaif-goose/goose/blob/main/README.md)
- [LICENSE (Apache 2.0)](https://github.com/aaif-goose/goose/blob/main/LICENSE)
- [CUSTOM_DISTROS.md](https://github.com/aaif-goose/goose/blob/main/CUSTOM_DISTROS.md)
- [Installation](https://github.com/aaif-goose/goose/blob/main/documentation/docs/getting-started/installation.md)
- [Using Extensions](https://github.com/aaif-goose/goose/blob/main/documentation/docs/getting-started/using-extensions.md)
- [Recipe Reference](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/recipes/recipe-reference.md)
- [Reusable Recipes](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/recipes/session-recipes.md)
- [Saving Recipes](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/recipes/storing-recipes.md)
- [ACP Providers](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/acp-providers.md)
- [CLI commands (serve, recipe deeplink)](https://goose-docs.ai/docs/guides/goose-cli-commands)
- [Mobile access — tunnel removed](https://github.com/aaif-goose/goose/blob/main/documentation/docs/experimental/remote-access/mobile-access.md)
- [goose Mobile archived](https://github.com/aaif-goose/goose/blob/main/documentation/docs/experimental/goose-mobile.md)
- [aaif-goose/goose-mobile](https://github.com/aaif-goose/goose-mobile)
- [Goose AI on the App Store](https://apps.apple.com/app/goose-ai/id6752889295)
- [goose-docs.ai](https://goose-docs.ai/)
- [block.github.io/goose redirect](https://block.github.io/goose/)
- [Block: introduces codename goose](https://block.xyz/inside/block-open-source-introduces-codename-goose)
- [Block: AAIF launch](https://block.xyz/inside/block-anthropic-and-openai-launch-the-agentic-ai-foundation)
- [Linux Foundation AAIF press, 9 Dec 2025](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [Todo extension](https://github.com/aaif-goose/goose/blob/main/documentation/docs/mcp/todo-mcp.md)
- [Developer extension](https://github.com/aaif-goose/goose/blob/main/documentation/docs/mcp/developer-mcp.md)
