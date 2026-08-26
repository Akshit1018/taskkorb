# BYO API keys, OpenAPI contract, Cloudflare, permission layers

Research only. **No product code in this change.** Written 26 Aug 2026 after the owner asked: users paste their own Codex/OpenAI, Claude, and Gemini keys and the app auto-configures; also OpenAPI, Cloudflare they already have, permission layers, guardrails, 3 platforms, multi-user.

Scraped with Firecrawl from **official** pages only. This is **not legal advice**. Store and ToS rules change. Dates are scrape dates unless a page states otherwise.

**Cloudflare account:** this note cites public Cloudflare docs. It does **not** claim we can log into, inspect, or operate the owner’s Cloudflare account. Official trycloudflare docs are cited because the owner said Taskkorb already used it. We did not verify that from a dashboard.

---

## What you asked for (plain)

1. User pastes **their** provider keys (OpenAI/Codex, Claude, Gemini) and the app configures itself.
2. Treat **OpenAPI** as the contract for **our** task API.
3. Use **Cloudflare** they already have (Workers, Tunnels / trycloudflare, D1/KV) — official product pages only.
4. Sketch **permission layers + guardrails** for multi-user, 3 platforms, in three custody modes:
   - **local-only**
   - **server-sync**
   - **we never see the key**

“3 platforms” here means the three **model vendors** they named (OpenAI/Codex, Claude, Gemini). Client surfaces that change the key story are called out separately: **native iOS**, **native Android**, **browser**.

---

## Hard facts (do not ship the opposite)

| Wish | Fact | Official source |
|---|---|---|
| Put **our** OpenAI key in a mobile/web binary | **No.** Official: never deploy the key in browsers or mobile apps; route every request through **your** backend. | [Best practices for API key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety) · [API authentication](https://developers.openai.com/api/reference/overview#authentication) |
| Hardcode a Gemini key in a production web/mobile app | **No.** Official: keys in client code can be extracted; use a **backend proxy**. | [Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key) |
| Share one OpenAI key across the team | **Against OpenAI ToS.** One unique key per member; invite them on the account. | [Best practices for API key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety) |
| Store a **pre-existing** API key string inside the Secure Enclave | **No.** Enclave cannot import preexisting keys; only generate P-256 keys inside. Keychain **can** store the string. | [Protecting keys with the Secure Enclave](https://developer.apple.com/documentation/security/protecting-keys-with-the-secure-enclave) · [Keychain services](https://developer.apple.com/documentation/security/keychain-services) |
| Android Keystore holds the API key **string** as non-exportable key material | **Not that API.** Keystore holds **cryptographic** keys. Official Android advice: Keystore + encrypt stored secrets (e.g. Tink). The plaintext key still exists in the app process when you send HTTP. | [Android Keystore system](https://developer.android.com/privacy-and-security/keystore) · [Security checklist — API keys](https://developer.android.com/privacy-and-security/security-tips#api-keys) |
| Browser JS calls `api.openai.com` / `api.anthropic.com` like a native app | **CORS is a browser rule, not a phone rule.** Browsers hide cross-origin responses unless the **provider** sends CORS headers. Native iOS/Android are not browsers. | [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) |
| Official Claude path: ship **no** API key, phone talks to Claude | **Yes, but it is not BYO.** App Attest issues a 1-hour token billed to **your** workspace. Identifies the **app**, not the person. Messages API only. Beta (OS 27 / Swift package). | [Authentication](https://platform.claude.com/docs/en/manage-claude/authentication) · [App Attest](https://platform.claude.com/docs/en/manage-claude/app-attest) |
| trycloudflare as production API / voice stream | **Officially not.** No SLA; 200 in-flight requests; **no SSE**. Use a named Tunnel on an account for production. | [Quick Tunnels (trycloudflare)](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/) |
| We “already have” their Cloudflare account from this repo | **Not established.** Public docs only. No dashboard access is claimed. | — |

**Owner-rule reminder from the cowork note:** ChatGPT Plus / Claude Pro / Gemini Advanced are **not** API access. Pasting a Console / AI Studio / platform key is a **different product**. See [cowork-platform research](./2026-08-26-cowork-platform.md).

---

## 1. Where a pasted key can live

### 1.1 iOS Keychain — official home for short secrets

Apple’s Keychain Services exist to store **small user secrets**: passwords, tokens, keys, short notes — not only login passwords. [Keychain services](https://developer.apple.com/documentation/security/keychain-services)

Apple Platform Security (official):

- Items are encrypted with **two AES-256-GCM keys**: a metadata/table key and a per-row secret key.
- The **secret value** (`kSecValueData`) always goes through the **Secure Enclave**.
- The keychain is a **SQLite** database; `securityd` decides which process can read an item using **Keychain-access-groups**, application-identifier, and application-group entitlements.
- Third-party apps can share items **only with apps from the same developer** (Apple Developer Program prefix + code signing). [Keychain data protection](https://support.apple.com/guide/security/keychain-data-protection-secb0694df1a/web)

Accessibility classes that matter for a BYO key:

| Class | Meaning for a pasted key |
|---|---|
| `kSecAttrAccessibleWhenUnlocked` | Readable when device unlocked. Can migrate. |
| `kSecAttrAccessibleAfterFirstUnlock` | Needed if a background refresh must use the key. |
| `kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly` | Requires a passcode; **does not** sync to iCloud Keychain, **is not** backed up, **is not** in escrow; wiping the passcode destroys the class keys. |
| `…ThisDeviceOnly` variants | UID-bound; restore to another device cannot use the item. |

[Keychain data protection](https://support.apple.com/guide/security/keychain-data-protection-secb0694df1a/web)

**Access control / biometrics:** Keychain ACLs can require Optic ID / Face ID / Touch ID / passcode. ACL evaluation happens **inside the Secure Enclave**. [Keychain data protection](https://support.apple.com/guide/security/keychain-data-protection-secb0694df1a/web) · [Local Authentication](https://developer.apple.com/documentation/localauthentication)

LocalAuthentication: the app **never** receives fingerprint/face data — only a Boolean. Official topic: [Accessing Keychain Items with Face ID or Touch ID](https://developer.apple.com/documentation/localauthentication/accessing-keychain-items-with-face-id-or-touch-id).

**Secure Enclave ≠ Keychain slot for a pasted `sk-…` string.** Official restrictions: hardware only; **NIST P-256 only**; **cannot encode preexisting keys** — “Not having a mechanism to transfer plain-text key data into or out of the Secure Enclave is fundamental to its security.” [Protecting keys with the Secure Enclave](https://developer.apple.com/documentation/security/protecting-keys-with-the-secure-enclave)

Honest iOS design: store the **API key string** in Keychain (prefer `WhenUnlockedThisDeviceOnly` or `WhenPasscodeSetThisDeviceOnly` + biometry ACL). Use the Enclave only for a **wrapping key you generate on device**, if you add that extra layer.

### 1.2 Android Keystore — official home for crypto keys, not the HTTP secret itself

Official purpose: store **cryptographic keys** in a container so they are hard to extract. Once inside, you use them for crypto **without exporting key material**. You can require user authentication and restrict modes. [Android Keystore system](https://developer.android.com/privacy-and-security/keystore)

Extraction prevention (official):

1. Key material **never enters the application process**. Crypto runs in a system process. If the app process is compromised, an attacker **might use** the keys but **cannot extract** the material to take off-device.
2. Keys can be bound to **TEE** or **StrongBox** (Android 9+). If the OS is compromised, keys may still be **usable on that device** but not extracted.

StrongBox: own CPU, secure storage, TRNG, tamper resistance — stronger isolation than TEE. [Android Keystore system](https://developer.android.com/privacy-and-security/keystore)

Android’s own **API key** checklist (official Security checklist):

- Compiled-in keys can be recovered by **decompiling**.
- “For optimal key management security, use the **Android Keystore**, and encrypt stored keys using a robust tool such as **Tink Java**.”
- Never commit keys to source control.
- Separate keys for dev / test / prod.
- Unique keys per app; **IP restrictions** if possible; **limit mobile app key usage** by package / signing cert (their Maps example).
- Prefer **OAuth 2.0** over a raw key when the service supports it.
- Rotate on the order of **90 days to 6 months** (they cite ISO 27001 as the frame).
- HTTPS always.

[Security checklist — API key management](https://developer.android.com/privacy-and-security/security-tips#api-keys)

Honest Android design: generate a Keystore AES/HMAC key (optional user-auth bound) → encrypt the pasted provider key → store ciphertext in app-private storage. Decrypt only long enough to set an `Authorization` / `x-api-key` / `x-goog-api-key` header.

### 1.3 Server storage (our process, or Cloudflare)

If the key leaves the phone, **whoever’s process decrypts it can see it**. Cloudflare official facts:

- **Workers Secrets** are encrypted bindings for “API keys and auth tokens.” After you set them, the value is **hidden in Wrangler and the dashboard**, but **to the Worker there is no difference** between a secret and an env var — “The secret’s value is passed through as defined.” [Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- **D1**: managed SQLite. All objects (metadata, live and inactive DBs) **encrypted at rest AES-256-GCM**; TLS in transit; **Cloudflare manages the keys**. Time Travel: restore to any minute in the last **30 days**. [D1](https://developers.cloudflare.com/d1/) · [D1 data security](https://developers.cloudflare.com/d1/reference/data-security/)
- **KV**: official example uses include **“Storing user authentication details.”** Values **encrypted at rest AES-256-GCM**. “Values are only decrypted by the process executing your Worker code or responding to your API requests.” [KV](https://developers.cloudflare.com/kv/) · [KV data security](https://developers.cloudflare.com/kv/reference/data-security/)

So: D1/KV **at rest** is encrypted with **Cloudflare’s** KMS, not with a key only the user holds. A Worker that `get()`s a user key **sees plaintext**. That is **server-sync**, not “we never see the key.”

### 1.4 OWASP (official MASVS)

MASVS-STORAGE: mobile apps store PII, crypto material, secrets, and **API keys**. Sensitive data can leak via backups, logs, and public folders.

| ID | Statement |
|---|---|
| [MASVS-STORAGE-1](https://mas.owasp.org/MASVS/controls/MASVS-STORAGE-1) | The app securely stores sensitive data. |
| [MASVS-STORAGE-2](https://mas.owasp.org/MASVS/controls/MASVS-STORAGE-2) | The app prevents leakage of sensitive data. |

[MASVS-STORAGE](https://mas.owasp.org/MASVS/05-MASVS-STORAGE/)

---

## 2. Proxy their key vs they call the provider from the phone

These are different threat models. Official pages argue about **the developer’s** key in **the developer’s** client. BYO is the **user’s** key in **our** client. The extraction mechanics are the same; the ToS/billing party changes.

### 2.1 What each vendor says about keys

**OpenAI / Codex (OpenAI API credentials)**

- “Never deploy your key in client-side environments like browsers or mobile apps.” Malicious users can take the key and bill you. “Requests should **always** be routed through your own backend server.” [Best practices](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- Auth docs: “**Remember that your API key is a secret.** Don’t share it with others or expose it in any client-side code such as browsers or apps. Load API keys from an environment variable or key management service **on the server**.” Bearer `Authorization`. [API authentication](https://developers.openai.com/api/reference/overview#authentication)
- Sharing keys is **against the Terms of Use**; invite members; they get their **own** key. [Best practices](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- **IP allowlisting**: when enabled, only listed IPs work — “trusted infrastructure, such as your backend servers or cloud environment.” A user who enablelists only their home/office IP will **break** phone-direct on cellular. [Best practices §7](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety) (links to the IP allowlisting article)
- Codex in this scrape: `developers.openai.com/codex` resolved to the ChatGPT / Codex **product** overview (CLI, IDE, cloud), not a separate “paste Codex key into a third-party app” API. Treat **Codex API use** as **OpenAI API key** rules until an official Codex-specific credential page is scraped. Prior cowork note: [Codex MCP](https://developers.openai.com/codex/mcp) is how Codex talks to **our** tools, not how we embed Codex billing.

**Claude**

- REST at `https://api.anthropic.com`. Auth: `x-api-key` **or** `Authorization: Bearer` (WIF token), plus required `anthropic-version`. [Getting started](https://docs.anthropic.com/en/api/getting-started)
- Official **three** methods: [Authentication](https://platform.claude.com/docs/en/manage-claude/authentication)

  | Method | Credential | Official “best for” |
  |---|---|---|
  | API key `sk-ant-api…` | Static secret | “Local development, prototyping, scripts, and **single-tenant servers where you control secret storage**” |
  | Workload Identity Federation | Short-lived bearer | Production cloud / CI — **eliminate static secrets** |
  | **App Attest** | Short-lived token after Apple attestation | “**iOS and macOS apps** distributed to end users, where the app calls the Claude API **directly with no back end or proxy**” |

- Keys: create in Console; **expiration** at creation (3h / 1d / 7d / 30d / custom / Never). Store in a **secrets manager**; rotate; revoke leaks. [Authentication](https://platform.claude.com/docs/en/manage-claude/authentication)
- **App Attest** (not BYO): app ships **no API key**; Anthropic issues a token (**1 hour**, **Messages API only**, **no end-user identity**, billed to **your workspace**). Requires Apple Team ID + bundle IDs in Console; Swift package is **beta** (OS 27). [App Attest](https://platform.claude.com/docs/en/manage-claude/app-attest)

**Gemini**

- Header `x-goog-api-key` (REST). Env `GEMINI_API_KEY` / `GOOGLE_API_KEY`. [Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- **Critical rules (official):** never check keys into git; “**Never expose keys client-side in production**”; “Do not hardcode API keys directly in web or mobile apps”; “To secure client-side apps, run a **backend proxy** server to make the actual API calls.”
- **Auth keys** (new default in AI Studio) vs **standard** keys. Unrestricted **standard** keys are already rejected. **September 2026:** Gemini API **rejects all Standard keys**. [Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- Restrictions: IP / website / app origin in Cloud Console. Restrict to Gemini API only in AI Studio. [Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)

### 2.2 If we proxy the user’s key (we can see it)

What is true, not guessed:

- The phone sends the key (or a token that unwraps to it) to **a process we run**. That process can log, persist, or misuse it. D1/KV encryption-at-rest does **not** hide it from the Worker. [KV data security](https://developers.cloudflare.com/kv/reference/data-security/) · [Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- This **is** the architecture OpenAI and Gemini specify for **client apps** — they mean **your** key on **your** server, not “paste a stranger’s key into our SaaS.” [OpenAI](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety) · [Gemini](https://ai.google.dev/gemini-api/docs/api-key)
- We also see **prompts and completions** that transit the proxy (same hop).
- We **can** enforce server-side guardrails: rate limits, model allowlists, tool allowlists, per-user spend caps, team ACLs — because the request hits us first.
- Multi-user / multi-device works: key is bound to a Taskkorb account, not a single phone.
- OpenAI “one key per person, no sharing” still applies to **the user’s OpenAI org**, not to “they typed their key into our settings.” We must not **reuse** user A’s key for user B. [OpenAI](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- Honest UX: **“We will be able to see this key and the traffic sent with it.”** Do not market this as zero-knowledge.

### 2.3 If they call providers from the phone (key stays in the app)

**Native iOS / Android**

- CORS **does not apply**. CORS is a **browser** mechanism around `fetch` / `XHR` and the same-origin policy. [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- The app can `URLSession` / `OkHttp` to `api.openai.com`, `api.anthropic.com`, `generativelanguage.googleapis.com` with the user’s header.
- Leakage that **is** official:
  - Android: keys compiled into the binary are recoverable by decompile. A **user-pasted** key is not in the binary, but it is in Keystore-wrapped storage and in **process memory** when used. Compromised process can **use** Keystore keys. [Keystore](https://developer.android.com/privacy-and-security/keystore) · [API keys](https://developer.android.com/privacy-and-security/security-tips#api-keys)
  - iOS: Keychain item is readable by this app (and same-team access group). Backups/sync depend on accessibility class. [Keychain data protection](https://support.apple.com/guide/security/keychain-data-protection-secb0694df1a/web)
  - OWASP: backups and logs leak secrets. [MASVS-STORAGE](https://mas.owasp.org/MASVS/05-MASVS-STORAGE/)
- Provider-side IP allowlists and HTTP-referrer / app restrictions can **block** phone-direct. [OpenAI IP allowlisting](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety) · [Gemini origin restrictions](https://ai.google.dev/gemini-api/docs/api-key)
- **Guardrails on-device only** can be stripped (modified client). Official Claude App Attest exists because they assume the binary can be swapped; they attest the **genuine build**. [App Attest](https://platform.claude.com/docs/en/manage-claude/app-attest)

**Browser (third Taskkorb client)**

- A page on `https://taskkorb…` calling `https://api.openai.com` is **cross-origin**. The browser sends a **preflight** when you set `Authorization`, `x-api-key`, `x-goog-api-key`, or `content-type: application/json`. The provider must answer with `Access-Control-Allow-Origin` (and allow those headers) or JS **cannot read** the response. [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- This scrape did **not** find an official OpenAI / Anthropic / Gemini page that lists allowed browser origins for the **developer API**. Do not invent a CORS allowlist. Fact: OpenAI and Gemini **tell you not to call from the browser at all**. [OpenAI](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety) · [Gemini](https://ai.google.dev/gemini-api/docs/api-key)
- Practical product fact: a **hosted web client** that BYO-keys **without** a same-origin proxy is not something those vendors document as supported.

### 2.4 Side-by-side

| | Phone → provider | Phone → our proxy → provider |
|---|---|---|
| Who sees the key | The device, and anyone who can read that app’s Keychain/Keystore-wrapped store or memory | **We do**, plus Cloudflare if it transits a Worker/`get()` |
| Who sees prompts | Provider + device | Provider + device + **us** |
| CORS | Irrelevant on native | Our API is same-origin or we set CORS for **our** host |
| Official vendor posture for **our** key in **our** app | Forbidden (OpenAI, Gemini) | Required (OpenAI, Gemini) |
| Official vendor posture for **user** key | Not a documented product; Claude App Attest is the documented “no key in the binary” path and it bills **us** | Same as any server that holds a static key |
| Multi-device | Paste per device, or iCloud Keychain (if class allows) | One server copy |
| Server guardrails | Cannot be guaranteed | Can be enforced |
| “We never see the key” | **Yes**, if we never upload it | **No** |

---

## 3. OpenAPI as the contract for **our** task API

Official definition: the **OpenAPI Specification (OAS)** is a **programming-language-agnostic** description of an **HTTP API**, usually YAML or JSON. It is meant to travel the whole API lifecycle: requirements → design → implementation → gateway config → docs → tests. [What is OpenAPI?](https://www.openapis.org/what-is-openapi)

Official learn site: OpenAPI is “**the most broadly adopted industry standard for describing new APIs**.” A machine-readable description unlocks validation, **data validation of requests/responses**, documentation generation, **client and server codegen**, mock servers, and design-time security analysis. [Getting started](https://learn.openapis.org/)

**What OpenAPI is good for here**

- One artifact for: iOS/Android/web clients, Claude Code / Cursor / Codex **MCP** adapters, and a Cloudflare Worker or other gateway.
- Official: API management tools ingest OAS to build gateway config — path/parameter/body validation and **callouts to security systems**. [What is OpenAPI?](https://www.openapis.org/what-is-openapi)
- Official security types you can put on **our** operations: **API key**, **HTTP auth (Basic/Bearer)**, **mTLS**, **OAuth 2.0**, **OpenID Connect**. [Describing API security](https://learn.openapis.org/specification/security.html)
- OAuth 2.0 in OAS is how you **name scopes** (`board:read` / `board:write` in their example). That is the right place to put **task** permissions (`tasks:read`, `tasks:write`, `team:admin`), not provider keys. [Describing API security](https://learn.openapis.org/specification/security.html)

**What OpenAPI is not**

- Official: “deployment information such as **onboarding or key exchange is out-of-scope**.” OAS will not store or wrap a Gemini key. [Describing API security](https://learn.openapis.org/specification/security.html)
- It is a contract for **Taskkorb’s HTTP API**, not a substitute for Keychain/Keystore or for OpenAI/Claude/Gemini auth.

Sketch (illustrative, not a shipped spec):

```yaml
openapi: 3.1.0
info:
  title: Taskkorb Task API
  version: 0.0.0
security:
  - userOauth:
      - tasks:read
      - tasks:write
paths:
  /tasks:
    get:
      security:
        - userOauth: [tasks:read]
    post:
      security:
        - userOauth: [tasks:write]
components:
  securitySchemes:
    userOauth:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://example.invalid/oauth/authorize
          tokenUrl: https://example.invalid/oauth/token
          scopes:
            tasks:read: Read tasks the user may see
            tasks:write: Create or update permitted tasks
            team:admin: Change membership and roles
```

Provider keys (`sk-…`, `sk-ant-…`, Gemini keys) **do not** belong as OpenAPI `securitySchemes` on **our** public task API. Those authenticate **us (or the phone) to the model vendor**, a different hop.

---

## 4. Cloudflare — official products only

We do **not** assert access to the owner’s Cloudflare account, zones, Workers, D1 databases, or Tunnel list. Below is what the **public docs** say those products are.

### 4.1 Workers

Serverless on Cloudflare’s network. Official jobs: front-end, **back-end APIs**, Workers AI, cron/workflows, observability. Bindings include Durable Objects, **D1**, **KV**, Queues, Hyperdrive. [Workers](https://developers.cloudflare.com/workers/)

Secrets: attach encrypted text (API keys, tokens) via `wrangler secret put`, dashboard, or `--secrets-file`. Hidden after set; **readable as `env.NAME` inside the Worker**. [Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)

A Worker is a valid **proxy** for **our** provider keys (OpenAI/Gemini official pattern). If it `env.USER_KEY` or `KV.get(userId)` a **user** key, that is **server-sync custody**.

### 4.2 Tunnels vs trycloudflare

**Cloudflare Tunnel (named):** `cloudflared` opens **outbound-only** connections from your origin to Cloudflare. No public origin IP. HTTP, SSH, RDP, etc. Create via **dashboard or API** (account required). [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)

**Quick Tunnels / TryCloudflare** (what the owner said they already used for Taskkorb):

- `cloudflared tunnel --url http://localhost:8080`
- Random `*.trycloudflare.com` hostname; **no site added to Cloudflare DNS**.
- Official purpose: experiment / share a laptop server / browser QA / third-party speed tests.
- Official: **no SLA or uptime**; they test new Tunnel features on these; “meant to be used for **testing and development, not for deploying a production website**.”
- Hard limit: **200 in-flight requests** → HTTP **429**.
- **Quick Tunnels do not support Server-Sent Events (SSE).**
- Limits go away only if you **sign up** and **create a Cloudflare Tunnel**.

[Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/)

If Taskkorb voice or model streams use SSE over a trycloudflare URL, that is **outside** what Cloudflare documents as supported on Quick Tunnels.

### 4.3 D1 and KV

| | D1 | KV |
|---|---|---|
| What official docs call it | Serverless **SQLite** | Global **key-value** |
| Stated fits | App data, isolation via many DBs | Cache, **user config**, **user authentication details** |
| At rest | AES-256-GCM, CF-managed keys | AES-256-GCM, CF-managed keys |
| Who decrypts | Worker / HTTP API | Worker / HTTP API |
| Extra | Time Travel 30 days; read replicas | High read, low latency |

[D1](https://developers.cloudflare.com/d1/) · [D1 security](https://developers.cloudflare.com/d1/reference/data-security/) · [KV](https://developers.cloudflare.com/kv/) · [KV security](https://developers.cloudflare.com/kv/reference/data-security/)

**Do not store raw provider keys in D1/KV and call that “we never see them.”** Official decryption happens in **your Worker**.

---

## 5. Permission / guardrail sketch (three custody modes)

Layers that exist in official docs, stacked for Taskkorb. Nothing here is an implementation.

| Layer | What it answers | Official hook |
|---|---|---|
| **L0 Device** | Is this person allowed to unlock the stored key? | Keychain ACL + LocalAuthentication; Keystore user-auth flags |
| **L1 App user** | Who is this Taskkorb account? | Our session / OAuth (describe in OAS `securitySchemes`) |
| **L2 Team / task ACL** | Whose tasks can they read/write? | OAS OAuth scopes + object-level checks (our job; OAS does not implement them) |
| **L3 Provider spend** | Whose OpenAI/Claude/Gemini bill? | User’s own key **or** our workspace (App Attest / our secret) |
| **L4 Tool guardrail** | Which tools / URLs / MCP methods may run? | Only **binding** if enforced **off** the mutable client |
| **L5 Rate / model / IP** | Caps and allowlists | Provider dashboards; OpenAI IP allowlist; Gemini restrictions; our proxy |

### Mode A — Local-only

```
User pastes key
    → iOS Keychain / Android Keystore-wrapped store
    → native app calls OpenAI | Anthropic | Gemini directly
Our API   → tasks, members, sync only (OAuth scopes)
Provider  → never talks to our server about the key
```

- **We never see the key** (if the paste UI never uploads it).
- Matches MASVS “store secrets on device” if Keychain/Keystore + no logs. [MASVS-STORAGE](https://mas.owasp.org/MASVS/05-MASVS-STORAGE/)
- **Conflicts** with OpenAI/Gemini “do not put keys in mobile apps” if we mean **our** key. For **their** key, we must still warn: malware / backups / a modified IPA can spend their quota.
- **Web client:** not documented as supported (CORS + vendor “no browser keys”).
- **Multi-user cowork:** teammates share **tasks** via our API, not one shared provider key (OpenAI forbids key sharing). [OpenAI](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- **L4/L5:** advisory on device only.

### Mode B — Server-sync (we can see the key)

```
User pastes key
    → TLS to our API / Worker
    → D1 or KV (CF at-rest encryption; Worker sees plaintext)
    → Worker adds x-api-key / Authorization / x-goog-api-key
    → provider
```

- This is the architecture OpenAI and Gemini document for **client** apps. [OpenAI](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety) · [Gemini](https://ai.google.dev/gemini-api/docs/api-key)
- Honest label: **custodian**. We can see the key and the transcripts.
- **L2–L5 enforceable.** One key per Taskkorb user; never apply user A’s key to user B’s traffic.
- Cloudflare Secrets are for **our** tokens (DB, our OpenAI org), not a scalable per-user vault — Secrets are Worker bindings, not a user table. Per-user keys → D1/KV/Secrets Store, still visible to the Worker. [Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- Production Tunnel: **named** Tunnel, not trycloudflare (SSE + SLA). [trycloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/)

### Mode C — We never see the key

Three **official or user-held** ways. Do not mix the marketing line with Mode B.

**C1. Mode A, strictly.** No upload. No web BYO. Accept per-device paste.

**C2. Claude App Attest (not BYO).** No user key; **we pay**; token has **no user identity**; Messages only; iOS/macOS; beta. [App Attest](https://platform.claude.com/docs/en/manage-claude/app-attest)

**C3. User-owned proxy.** They deploy a Worker (or any origin) **on an account they control**, put **their** key in **their** `wrangler secret`, point the app at **their** URL. We never receive the secret. **This research cannot configure that account.** Official mechanics: [Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/) · [Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)

**Not C:** “encrypt in KV with a key we also store.” That is B.

**Not C:** Secure Enclave wrapping if we still receive the unwrapped key on the server.

### What to tell the owner in one sentence

- Want **auto-config + multi-device + real guardrails** → **Mode B**, and say we can see the key.  
- Want **“we never see the key”** → **Mode A** (native only) or **C3** (their Worker) or **C2** (we bill Claude).  
- Want **ChatGPT Plus inside the app** → still **no**; that is the cowork note, not a key-storage problem.

---

## 6. Multi-user + 3 vendors (permission picture)

```
                ┌──────────── Taskkorb users / roles (L1–L2) ────────────┐
                │  owner / member · OAuth scopes on /tasks              │
                └──────────────────────────┬─────────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
              OpenAI/Codex              Claude                 Gemini
              user key or              user key or            user key or
              our proxy secret         App Attest (our bill)  our proxy secret
              (L3–L5)                  (L3–L5)                (L3–L5)
```

- **One Taskkorb team ≠ one provider key.** Official OpenAI: unique key per person. [Best practices](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- **Claude workspaces** are the official way to segment keys and spend on **their** side. [Getting started](https://docs.anthropic.com/en/api/getting-started)
- **Gemini** keys are tied to a **Google Cloud project** (billing, IAM). Creating keys needs listed IAM permissions. [Using Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- **App Attest does not identify the end user.** Per-user task ACL stays on **our** API. [App Attest](https://platform.claude.com/docs/en/manage-claude/app-attest)
- MCP / Claude Code / Codex should use **our OpenAPI + OAuth**, not a teammate’s `sk-` pasted into an IDE. That matches the cowork note’s MCP picture.

---

## 7. Gaps (not invented)

- No official OpenAI/Anthropic/Gemini **CORS allowlist** page was retrieved in this pass. Browser BYO is unsupported by their **“no keys in the browser”** text, which is enough to refuse a silent web paste.
- `developers.openai.com/codex` scrape landed on the ChatGPT/Codex **product** overview, not a Codex-specific key-safety article. Codex-as-API follows OpenAI API key rules until a dedicated page is scraped.
- EncryptedSharedPreferences was **not** scraped as its own page (the `/topic/security/data` URL served the Security checklist). Keystore + encrypt is the cited official pair.
- We did **not** open the owner’s Cloudflare dashboard. trycloudflare usage is **owner-stated**.

---

## Sources

**Device storage**

- [Keychain services](https://developer.apple.com/documentation/security/keychain-services) (scraped 26 Aug 2026)
- [Keychain data protection](https://support.apple.com/guide/security/keychain-data-protection-secb0694df1a/web) (scraped 26 Aug 2026)
- [Protecting keys with the Secure Enclave](https://developer.apple.com/documentation/security/protecting-keys-with-the-secure-enclave) (scraped 26 Aug 2026)
- [Local Authentication](https://developer.apple.com/documentation/localauthentication) (scraped 26 Aug 2026)
- [Android Keystore system](https://developer.android.com/privacy-and-security/keystore) (scraped 26 Aug 2026)
- [Android Security checklist (API keys)](https://developer.android.com/privacy-and-security/security-tips#api-keys) (scraped 26 Aug 2026)
- [OWASP MASVS-STORAGE](https://mas.owasp.org/MASVS/05-MASVS-STORAGE/) (scraped 26 Aug 2026)

**Provider keys**

- [OpenAI — Best practices for API key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety) (updated “yesterday” on scrape day)
- [OpenAI API authentication](https://developers.openai.com/api/reference/overview#authentication) (scraped 26 Aug 2026)
- [Claude API getting started](https://docs.anthropic.com/en/api/getting-started) (scraped 26 Aug 2026)
- [Claude authentication](https://platform.claude.com/docs/en/manage-claude/authentication) (scraped 26 Aug 2026)
- [Claude App Attest](https://platform.claude.com/docs/en/manage-claude/app-attest) (scraped 26 Aug 2026)
- [Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key) (page “Last updated 2026-08-17 UTC”)

**CORS / OpenAPI**

- [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) (scraped 26 Aug 2026)
- [What is OpenAPI?](https://www.openapis.org/what-is-openapi) (scraped 26 Aug 2026)
- [Learn OpenAPI — Getting started](https://learn.openapis.org/) (scraped 26 Aug 2026)
- [Learn OpenAPI — Describing API security](https://learn.openapis.org/specification/security.html) (scraped 26 Aug 2026)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) (scraped 26 Aug 2026)

**Cloudflare (public docs only)**

- [Workers](https://developers.cloudflare.com/workers/) (docs “Last updated Apr 23, 2026”)
- [Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/) (docs “Last updated Jul 3, 2026”)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/) (docs “Last updated Aug 4, 2026”)
- [Quick Tunnels / trycloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/) (docs “Last updated Apr 20, 2026”)
- [D1](https://developers.cloudflare.com/d1/) (docs “Last updated Apr 30, 2026”)
- [D1 data security](https://developers.cloudflare.com/d1/reference/data-security/) (docs “Last updated Apr 21, 2026”)
- [KV](https://developers.cloudflare.com/kv/) (docs “Last updated Jul 31, 2026”)
- [KV data security](https://developers.cloudflare.com/kv/reference/data-security/) (docs “Last updated Apr 21, 2026”)
