# Continue.dev, Cline, Aider — MCP/tools, BYO keys, licenses

Research only. **No product code.** Written 26 Aug 2026.

**Method:** official docs first. Firecrawl CLI is installed but **unauthenticated**; keyless scrape/search hit the free-tier rate limit. Pages below were fetched from official URLs (same pages Firecrawl would return). A `FIRECRAWL_API_KEY` was requested for this environment.

This is **not legal advice**. Licenses and docs change.

---

## Verdict for Taskkorb MCP

Copy **Cline’s remote Streamable HTTP client** (and Continue’s equivalent). Do **not** copy their coding-agent UIs, stdio-on-a-laptop as the product, or Aider (no official MCP).

These three are **desktop/IDE/CLI coding agents**. They attach **to** MCP servers. Taskkorb should **be** the hosted server they add — same store the phone already hits over REST.

```text
Phone                         ──REST──►  Taskkorb task API
Continue / Cline / Claude / Cursor / Codex  ──MCP streamable HTTP + token──►  same API
```

Ship:

```json
{
  "mcpServers": {
    "taskkorb": {
      "type": "streamableHttp",
      "url": "https://…/mcp",
      "headers": { "Authorization": "Bearer <user-or-oauth-token>" }
    }
  }
}
```

Continue users would write the same endpoint as YAML (`type: streamable-http`, `url`, `apiKey`).

stdio MCP is a personal laptop hack, not a multi-device product.

---

## Comparison

| | Continue | Cline | Aider |
|---|---|---|---|
| **License** | Apache-2.0 ([repo](https://github.com/continuedev/continue)) | Apache-2.0 ([repo](https://github.com/cline/cline), © 2026 Cline Bot Inc.) | Apache-2.0 ([repo](https://github.com/Aider-AI/aider); FAQ: “open source… Apache 2.0”) |
| **What it is** | Open-source coding assistant | Autonomous coding agent | AI pair programming in the terminal |
| **Official surfaces** | VS Code + JetBrains + CLI (`cn`) | IDE extension (VS Code / Cursor / JetBrains / others) + CLI + SDK + Kanban preview | Python CLI (Mac / Linux / Windows) |
| **Official mobile app** | **No** | **No** | **No** |
| **MCP role** | **Client.** `mcpServers` in `config.yaml` or `.continue/mcpServers/` | **Client.** `mcpServers` in `~/.cline/mcp.json` (CLI) or IDE JSON | **None in official docs.** Built-in repo/edit tools only. MCP exists as **unmerged PRs**, not aider.chat |
| **Transports** | `stdio`, `sse`, `streamable-http` | STDIO local; remote **Streamable HTTP (recommended)** or SSE (legacy) | n/a |
| **How you attach a remote server** | YAML: `type: streamable-http`, `url`, `apiKey: ${{ secrets.… }}` | JSON: `type: "streamableHttp"`, `url`, `headers.Authorization`; or IDE **Remote Servers** tab (name + URL + transport) | n/a |
| **Local / stdio tools** | `command` + `args` + `env` secrets | `command` + `args` + `env`; `autoApprove` | Built-in file/edit/git — not MCP |
| **BYO model keys** | Yes. `config.yaml` `models[].apiKey` or `${{ secrets.NAME }}` from workspace/global `.env` | Yes. Official name **BYOK**: paste provider key, or Ollama/LM Studio with no key. Also **Cline usage-billing** (sign-in, no key) and **ClinePass** ($9.99/mo) | Yes only. CLI / env / `.env` / `.aider.conf.yml`. `--api-key provider=key` sets `PROVIDER_API_KEY` |
| **“Use my Plus/Pro chat plan”** | Not their model. Keys or local models | Claude Code / OpenAI Codex OAuth paths exist **inside Cline**, not a license for Taskkorb to embed those chats | Keys only |

Apache-2.0 lets us **study and reimplement** the attach pattern. It is not a partnership and does not let us ship their agent on iOS.

---

## Continue — official attach

[What is Continue?](https://docs.continue.dev/) — “open source VS Code and JetBrains extensions” + Continue CLI. No mobile.

[MCP deep dive](https://docs.continue.dev/customize/deep-dives/mcp):

- MCP only in **agent mode**.
- Drop YAML (or Cursor/Cline JSON) into `.continue/mcpServers/`.
- Transports: **stdio** (local process), **sse**, **streamable-http** (remote URL).
- Secrets: `${{ secrets.NAME }}` in `args` / `env` / `apiKey`.

[Examples](https://docs.continue.dev/customize/deep-dives/mcp-examples) show the hosted pattern Taskkorb should match:

```yaml
mcpServers:
  - name: PostHog
    type: streamable-http
    url: https://mcp.posthog.com/mcp
    apiKey: ${{ secrets.POSTHOG_API_KEY }}
```

[BYO models](https://docs.continue.dev/customize/model-providers/overview) + [secrets](https://docs.continue.dev/guides/configuring-models-rules-tools): `models[].provider` + `apiKey: ${{ secrets.… }}` from `.env` (workspace or `~/.continue/.env`). Cloud providers need keys; Ollama/LM Studio do not.

---

## Cline — official attach (copy this)

[Install](https://docs.cline.bot/getting-started/installing-cline): IDE extension, CLI (`npm i -g cline`), Kanban preview, `@cline/sdk`. Surfaces listed: VS Code, Cursor, JetBrains, Windsurf, VSCodium, Antigravity. **No iOS/Android.**

[MCP](https://docs.cline.bot/mcp/mcp-overview):

- CLI file: `~/.cline/mcp.json`. IDE: MCP Servers → Configure, or **Remote Servers** tab.
- Local: `command` + `args` + `env`.
- Remote (recommended):

```json
{
  "mcpServers": {
    "remote-server": {
      "type": "streamableHttp",
      "url": "https://example.com/mcp",
      "headers": { "Authorization": "Bearer your-token" },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Omit `type` and it falls back to **legacy SSE**. Set `streamableHttp` explicitly.

Wizard: `cline mcp`. List: `cline config mcp`.

Security they document: trust the server, secrets in env, keep `autoApprove` small, review tool calls.

[Auth / BYOK](https://docs.cline.bot/getting-started/authorizing-with-cline): three official paths — Cline usage-billing (sign-in), ClinePass ($9.99/mo), **BYOK** (paste OpenRouter / Anthropic / OpenAI / Gemini / Bedrock / DeepSeek key, or local Ollama/LM Studio). Claude Code and OpenAI Codex OAuth are **Cline-specific** bridges to those vendors’ own CLIs/subscriptions — not a pattern Taskkorb can reuse to “use Plus inside our app.”

---

## Aider — official attach (do not copy for MCP)

[Install](https://aider.chat/docs/install.html): Python CLI via `aider-install` / uv / pipx. Mac, Linux, Windows. **No mobile, no IDE MCP panel.**

[API keys](https://aider.chat/docs/config/api-keys.html): command line, environment, `.env`, `.aider.conf.yml`. OpenAI/Anthropic have dedicated flags; everyone else is `--api-key provider=key` → `PROVIDER_API_KEY`.

[Connecting to LLMs](https://aider.chat/docs/llms.html): BYO cloud keys, OpenRouter, or local Ollama / OpenAI-compatible.

**Official docs do not document MCP.** `site:aider.chat` has no MCP/mcpServers pages. GitHub has unmerged MCP PRs ([#3937](https://github.com/Aider-AI/aider/pull/3937), [#3672](https://github.com/Aider-AI/aider/pull/3672), [#5539](https://github.com/Aider-AI/aider/pull/5539)); third-party `aider-mcp-server` wraps Aider **as** a server for other agents. None of that is an official client attach path.

What Aider *is* useful for: **BYO key UX** (env + `.env` + flags). Taskkorb already does this for Gemini.

---

## What Taskkorb should / should not copy

**Copy**

1. **Hosted Streamable HTTP MCP** with Bearer (and later OAuth 2.1), URL like `https://…/mcp`. This is what Cline documents as recommended and what Continue shows for PostHog/Supabase/Netlify.
2. **One task API**, two fronts: phone REST, agents MCP. Users add Taskkorb themselves in Cline / Continue / Claude Code / Cursor / Codex. No marketplace deal required.
3. **Aider-style BYO keys** for *our* model calls (already Gemini): user pastes a provider key; we do not pretend Plus/Pro is an API.

**Do not copy**

1. Their **agent** (file edits, terminal, browser). Taskkorb is notes/tasks/voice + a task store.
2. **stdio / `npx` local servers** as the shipped product. Fine as a power-user extra; not the cowork design.
3. Cline **usage-billing / ClinePass / Codex OAuth** as “use your ChatGPT in Taskkorb.” Those are Cline’s own pipes.
4. A **mobile port** of Continue/Cline/Aider. Official docs do not ship iOS/Android apps. Third-party “Cline on phone” = SSH into a Linux box.

**License implication:** Apache-2.0 on all three. Safe to read and match the *protocol* (MCP streamable HTTP). Do not vendor their extensions into an App Store binary.

---

## Official sources

- Continue: [docs](https://docs.continue.dev/), [MCP](https://docs.continue.dev/customize/deep-dives/mcp), [MCP examples](https://docs.continue.dev/customize/deep-dives/mcp-examples), [models](https://docs.continue.dev/customize/model-providers/overview), [secrets](https://docs.continue.dev/guides/configuring-models-rules-tools), [LICENSE](https://github.com/continuedev/continue/blob/main/LICENSE)
- Cline: [install](https://docs.cline.bot/getting-started/installing-cline), [MCP](https://docs.cline.bot/mcp/mcp-overview), [auth/BYOK](https://docs.cline.bot/getting-started/authorizing-with-cline), [LICENSE](https://github.com/cline/cline/blob/main/LICENSE)
- Aider: [install](https://aider.chat/docs/install.html), [API keys](https://aider.chat/docs/config/api-keys.html), [LLMs](https://aider.chat/docs/llms.html), [FAQ / Apache 2.0](https://aider.chat/docs/faq.html), [GitHub license SPDX](https://github.com/Aider-AI/aider)
