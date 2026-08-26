# Family budget sync + team daily report

Research only. **No product code in this change.** Written 26 Aug 2026 after the owner asked what real products do, and which v1 we can ship inside the earlier walls.

**Walls this note will not cross** (from [cowork-platform research](./2026-08-26-cowork-platform.md)):

| Wall | Why it is a wall |
|---|---|
| **No iOS SMS inbox** | Apple publishes no public SMS inbox API. Message Filter is unknown-senders only and cannot write into the containing app. [SMS and MMS Message Filtering](https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering) |
| **No Plus-login** | ChatGPT Plus / Claude Pro / Gemini Advanced are consumer chat plans, not API. Login-with-Plus is ToS-blocked. [What is ChatGPT Plus?](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus) · [OpenAI Terms](https://openai.com/policies/row-terms-of-use/) |
| **No Gmail OAuth mailbox scrape in v1** | `gmail.readonly` is Restricted. Budget / receipt-mining is **not** a listed Gmail approved use. [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes) · [Workspace user-data policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy) |

Google Family Link is **not** a budget app. Official product: parental controls, screen time, app approvals, location, account management. [Family Link](https://families.google/familylink/)

This is **not legal advice**. Store and ToS rules change. Dates are scrape dates unless a page states otherwise.

---

## Recommended v1 (answer first)

These are **two products**. Do not ship them as one “assistant + ERP + SMS budget” blob.

### Family budget v1 — shared household ledger

Honest clone of what YNAB Together / Spendee Shared Wallets / Wallet Group Sharing actually do, minus bank OAuth and minus mailbox OAuth.

**Ship**

1. One household. Each person has **their own login**. Invite by email. No shared password. (YNAB: “No need to share a password—invite… up to five people.” [Subscription Sharing](https://www.ynab.com/features/subscription-sharing))
2. Cloud sync: same credentials, same ledger, web + phones. (YNAB: “YNAB updates automatically across all of your devices.” [Features](https://www.ynab.com/features) · Wallet: “log in using the same account credentials on any device.” [Wallet product](https://budgetbakers.com/en/products/wallet/))
3. Shared cash / household accounts that members can add, edit, delete. Optional private accounts the manager does not share. (YNAB plan sharing is optional; manager can keep plans private. [YNAB Together](https://support.ynab.com/en_us/ynab-together-B1nS78Cki) · Wallet: per-account Admin / Track-and-read / Read-only / No access. [Group Sharing](https://support.budgetbakers.com/hc/en-us/articles/7149394922002-Everything-about-Group-Sharing))
4. Manual transaction entry. End-of-day category review.
5. **Optional Google mail, without reading Gmail:** give the household a unique inbound address. User adds a Gmail **filter → Forward it**. Official Gmail feature. No Restricted scope. [Automatically forward Gmail](https://support.google.com/mail/answer/10957)
6. Parse forwarded mail into a **draft**. User confirms. If merchant / payer is unclear: *“I am unable to tell whose sale this was.”* Do not guess.

**Do not ship in v1**

- iOS SMS auto-read.
- Android SMS as a side feature of a notes/voice app. Bluecoins asked for the Play SMS exception for banking SMS and was **denied** (2019). [Bluecoins SMS post](https://www.bluecoinsapp.com/google-policy-removing-sms-permissions/)
- `gmail.readonly` / Gmail API.
- ChatGPT Plus login, or any “use my Plus inside our app.”
- Bank / Plaid / MX linking (real products do this; it is a later paid slice, not the first honest slice).
- Treating Google Family Link as a budget backend.

### Team daily report v1 — shared task list + EOD note

Honest clone of Geekbot / DailyBot / Range **check-ins**, not of SAP / Odoo ERP, not of Linear / Jira.

**Ship**

1. One team of **2–10 people**. Each person has their own login.
2. A **shared task list**: title, owner, status (todo / doing / done), optional due date. Everyone can see everyone else’s tasks.
3. An **EOD note** per person per day: what I did, what is blocked, what is next. Visible to the team. No standup video required.
4. A team feed that compiles today’s notes. That is the “daily report.”
5. Same REST store the phone already needs. MCP later, not required for v1.

**Do not ship in v1**

- ERP: accounting, inventory, HR, payroll, procurement, manufacturing, POS. That is [SAP Cloud ERP](https://www.sap.com/products/erp.html) / [Odoo](https://www.odoo.com/) (“All your business on one platform”).
- Linear / Jira clone: cycles, sprints, roadmaps, agent PRs, 1,000 integrations.
- Notion-shaped everything-wiki.
- ChatGPT Plus login.
- WhatsApp as the task store.
- Claiming Slack/Teams hosting unless we actually ship a Slack app. Geekbot and DailyBot live **inside** Slack/Teams; we do not have that partnership and do not need it for 2–10 people.

**Smallest honest product vs ERP**

| | Smallest honest (v1) | Standup bot (Geekbot class) | Issue tracker (Linear / Jira) | ERP (SAP / Odoo) |
|---|---|---|---|---|
| Shared tasks | Yes | Optional / via Jira hook | Yes, with workflow | Yes, plus jobs/BOM/PO |
| Daily written update | Yes (EOD note) | Yes (scheduled Q&A) | Project updates, not a standup | Status meetings are not the product |
| Inventory / GL / HR / payroll | No | No | No | **Yes — that is the product** |
| Needs Slack | No | Usually yes | No | No |

If the team only needs “who owns what + what happened today,” that is a **shared list + EOD note**. Calling it ERP is false.

---

## 1. Family budget — what real products do

None of the four budget apps advertise “connect Gmail and scrape receipts.” Google account, when present, is **login / Drive file sync / invite email**, not mailbox read.

### YNAB — [ynab.com](https://www.ynab.com/)

| Fact | Official source |
|---|---|
| Multi-device cloud sync. “Access YNAB on your computer, phone, or tablet (even offline!). YNAB updates automatically across all of your devices.” | [Features](https://www.ynab.com/features) |
| Family / couple sharing is **YNAB Together**: one subscription, **up to five additional people** (six total). Each person has **their own login**. Invite by first name + email. | [Subscription Sharing](https://www.ynab.com/features/subscription-sharing) · [YNAB Together](https://support.ynab.com/en_us/ynab-together-B1nS78Cki) |
| “Your plan updates across all devices in real time.” Recent Moves shows who changed what. | [Subscription Sharing](https://www.ynab.com/features/subscription-sharing) |
| Group manager pays. Members’ plans are always visible to the manager. Manager chooses which of *their* plans to share. Shared access = full edit except share / delete / Fresh Start. | [YNAB Together](https://support.ynab.com/en_us/ynab-together-B1nS78Cki) |
| Bank import is **optional Direct Import** via **MX and Plaid**, plus some Apple Wallet connections. Not Gmail. Refresh typically once or twice a day; posted tx can take up to three days. YNAB “receives only limited data—never your login credentials.” | [How Direct Import Works](https://support.ynab.com/en_us/how-direct-import-works-H1IGYLgnxl) |
| Official feature list: bank connection, multi-device sync, subscription sharing, Apple Card import, widgets. **No Gmail / receipt-mailbox item.** | [Features](https://www.ynab.com/features) (schema.org `featureList` on that page) |

**Do they read Gmail?** Official pages scraped for this note do **not** claim Gmail mailbox access. Email is used to **invite** members. A third-party App Store listing “Receipts for YNAB” appeared in search; that is **not** YNAB.

### Spendee — [spendee.com](https://www.spendee.com/)

| Fact | Official source |
|---|---|
| “Sync and backup is valuable for everyone using Spendee across devices and sharing Spendee with others.” Shared wallets “among couples, families and roommates.” | [Spendee home](https://www.spendee.com/) |
| Shared wallet: owner invites by **email**. Owner and guests can add/edit/delete any transaction. Categories belong to the owner. **Only the owner** needs Plus or Premium; guests can stay Free. | [Shared Wallets](https://help.spendee.com/article/224-shared-wallets) |
| **Bank wallets cannot be shared.** Budgets are not shared (each member makes their own). Last updated 19 Aug 2026. | Same page |
| Bank connect: “more than 2500 financial providers.” Premium. Read-only. Mobile or web. User may opt to store bank credentials for automatic updates. Hosted on Google Cloud — that is **Spendee’s servers**, not “read the user’s Gmail.” | [Bank sync](https://www.spendee.com/bank-connect) · [Connect a bank](https://help.spendee.com/article/144-connect-a-bank-account) |

**Do they read Gmail?** Official help uses email as **invite + account identity**. No Gmail API / inbox-import article was found on official Spendee domains.

### Wallet by BudgetBakers — [budgetbakers.com/en/products/wallet](https://budgetbakers.com/en/products/wallet/)

| Fact | Official source |
|---|---|
| Premium **Group Sharing**: household expenses in real time. Owner chooses which accounts are shared or private. | [Wallet product FAQ](https://budgetbakers.com/en/products/wallet/) |
| Premium subscription “works across both mobile and the web… financial data sync automatically… simply log in using the same account credentials on any device.” | Same page |
| Bank sync: “over 15,000 banks.” File import: CSV, XLS, OFX. Free tier = manual tracking. | Same page |
| Group Sharing how-to: invite by the **email already registered in Wallet**. Owner needs Premium; members do not. Permissions per account: Admin / Track and read / Read only / No access. Owner can share **bank accounts** with the group. **Group sharing is not available on the Web App.** Personal Wallet and group Wallet are separate; personal actions do not sync into the group. One group you can *create*; you can *belong to* more. | [Everything about Group Sharing](https://support.budgetbakers.com/hc/en-us/articles/7149394922002-Everything-about-Group-Sharing) |
| Help search snippet: if devices do not sync, use the internet and the **same credentials**. | [Data not syncing](https://support.budgetbakers.com/hc/en-us/articles/7183819864850-Data-not-syncing-between-devices) (page itself was Cloudflare-gated on scrape) |
| Product also advertises MCP + REST for Wallet data (developer slice, not Gmail). | [Wallet product](https://budgetbakers.com/en/products/wallet/) |

**Do they read Gmail?** Official import path is **files** (CSV / XLS / OFX) and **bank sync**. No official “connect Gmail” feature on the product or Group Sharing pages.

### Bluecoins — [bluecoinsapp.com](https://www.bluecoinsapp.com/)

| Fact | Official source |
|---|---|
| Sync is **not** a Bluecoins cloud ledger. It is **file backup/sync** to **Dropbox or Google Drive**. Link provider → authorize → backup / restore. QuickSync on open/close. Attachments can upload to the same store. | [Online Sync](https://www.bluecoinsapp.com/settings/online-sync/) · [Backup and Sync Server](https://www.bluecoinsapp.com/backup-and-sync-server/) |
| Google Drive needs `GET_ACCOUNTS` so the app can pick a Google account **for Drive**. That is Drive, not Gmail. | [Backup and Sync Server](https://www.bluecoinsapp.com/backup-and-sync-server/) |
| SMS banking: Google denied the Play exception (not default SMS handler; SMS “not a core functionality”). SMS features dropped from v7. Posted 26 Jan 2019. | [Removing SMS Permissions](https://www.bluecoinsapp.com/google-policy-removing-sms-permissions/) |

**Do they read Gmail?** No. Google account here means **Drive file hosting**.

### Google Family Link — not in this category

Official: screen time, app limits, Play / YouTube / Chrome / Search controls, location, password reset for a child account. [Family Link](https://families.google/familylink/)

There is no household ledger, no categories, no bank sync, no receipt import.

### Optional “Google account mail” — what is actually allowed

| Path | Allowed as v1? | Official rule |
|---|---|---|
| Gmail **filter / forward** to our inbound address | **Yes** | [Forward Gmail](https://support.google.com/mail/answer/10957) |
| `gmail.readonly` OAuth so we crawl the inbox | **No for v1** | Restricted scope. If a server stores the mail, CASA. [Gmail scopes](https://developers.google.com/workspace/gmail/api/auth/scopes) |
| Approved Gmail uses | Email client, backup of **email**, productivity that **improves the email experience**, reporting that improves email (itinerary / flight / package). **Budget / receipt mining is not listed.** | [Workspace user-data policy — Gmail](https://developers.google.com/workspace/workspace-api-user-data-developer-policy) |

So “optional Google account mail” in v1 = **user forwards bank/receipt mail**. It is not “Sign in with Google and we read Gmail.”

---

## 2. Daily reporting — what real products do

### Slack-hosted standup bots (the actual “morning standup” products)

A standalone consumer app literally named “Morning Standup” was **not found** as an official first-party product. The category is **async check-in bots that live in Slack / Teams**.

**Geekbot** — [geekbot.com](https://geekbot.com/)

- “The easiest way to run Standups, Polls and Surveys in Slack and Microsoft Teams.”
- “The bot comes to you”: Geekbot DMs the team, they answer, updates are posted.
- Scheduled summaries: participation, blockers, sentiment.
- **“Free for teams of up to 10 users.”** Matches the 2–10 person target.
- Daily Standup template: pick template → add participants → pick a broadcast channel → publish. [Daily Standup help](https://help.geekbot.com/en/articles/7041452-daily-standup) (3 Apr 2026)

**DailyBot** — [dailybot.com](https://www.dailybot.com/)

- “One place for team updates, AI reports, and agent activity.”
- Check-ins in **Slack, Microsoft Teams, Google Chat, Discord**. Also VS Code / Cursor / CLI / Chrome.
- Compiles answers into a report; flags blockers; optional Jira / Asana / Trello / Linear hooks.
- Free Starter + paid per-user plans. Listed on the Slack Marketplace: [Dailybot Standups](https://slack.com/marketplace/A44PZQW83-dailybot-standups-ai-agents)

**Standuply** — [standuply.com](https://standuply.com/)

- Slack / Teams standup bot: scheduled or async, text / voice / video.
- Also retros, backlog grooming, planning poker, 360 reviews — **by connecting Jira / Trello / Asana**. That is already past “EOD note.”

**Range** — [range.co](https://www.range.co/)

- “Replace standups with check-ins.” Async updates + meeting agendas/notes + goals. Slack / Teams. 75+ tool integrations.

**Pattern:** the product is **questions on a schedule + a compiled channel post**. Tasks live in Jira/Linear if at all. None of these are ERPs.

### Linear — [linear.app](https://linear.app/)

Official: “The product development system for teams and agents.” Issues, cycles, projects, initiatives, roadmaps, PR review, Linear MCP, agents. [Linear Method](https://linear.app/method) is a *building* philosophy, not a daily standup product.

This is an **issue tracker**. It is the right comparison if the team wants engineering tickets. It is the **wrong** comparison if they want “what did you do today.”

### Notion — [notion.com](https://www.notion.com/)

Official projects: configurable databases, tasks/sub-tasks, assignee, due date, sprints, wiki + docs in the same workspace. [Projects](https://www.notion.com/product/projects)

Official product-team guide: Projects & Tasks databases, meeting-notes DB with a **daily standup repeating template**, buttons that create tasks from notes. [Connected workspace guide](https://www.notion.com/help/guides/connected-workspace-for-product-teams-to-collaborate-ideate-and-launch)

Notion is a **workspace you assemble**. A standup is a *template*, not the product. Shipping “Notion” means shipping pages, databases, permissions, embeds. That is not a 2–10 person v1.

### Jira — [atlassian.com/software/jira](https://www.atlassian.com/software/jira)

Official beginner guide: “Jira is a project management tool that helps any team plan, track, and deliver work.” Boards, timelines, reports, automations, agent work. Explicitly **more than a to-do list**: owners, dependencies, goals, history. [What is Jira](https://www.atlassian.com/software/jira/guides/getting-started/overview)

A Slack standup bot (StandBot, DailyBot) can *post into* Jira. Jira itself is not the standup.

### ERP — so the word stays honest

**SAP** official definition: ERP “helps organizations streamline their core business processes, including **finance, HR, manufacturing, supply chain, sales, and procurement**—with a unified view and a single source of truth.” Even “small business” SAP Business One covers “accounting, purchasing, inventory, sales, and reporting.” [SAP ERP](https://www.sap.com/products/erp.html)

**Odoo** official home: “All your business on one platform” — Accounting, CRM, Sales, Purchase, Inventory, Manufacturing, HR, POS, eCommerce, Helpdesk, … [Odoo](https://www.odoo.com/)

If we do not ship a general ledger, stock, payroll, and purchasing, **we are not shipping ERP-lite**. We are shipping a **team notebook**.

---

## How the two v1s sit next to the earlier stacks

From the cowork note: A = existing web orb, B = local iOS assistant, C = cowork backend.

| v1 | Maps to | Why |
|---|---|---|
| Family budget | **New thin C**, household-scoped | Needs accounts + a synced ledger. Not the orb. Not SMS. |
| Team daily report | **New thin C**, team-scoped | Needs accounts + tasks + EOD notes. MCP later. Telegram later. |

They can share **auth + a sync API**. They should not share one UI blob, one Play listing that asks for SMS, or one “Hermes ERP.”

---

## Honesty / UNVERIFIED

- Firecrawl was **keyless** and hit the free-tier rate limit mid-pass. Some official pages were then fetched with the built-in URL reader. Cloudflare blocked Wallet “data not syncing,” Wallet file-import, and monday.com Daily Standup HTML (bot check). Those three are cited from search snippets or skipped.
- YNAB “How to add transactions” help rendered empty (JS shell). Feature and Direct Import pages were enough to show **bank + devices**, not Gmail.
- A product literally branded “Morning Standup” was **not found** on an official first-party site. monday.com has a “Daily Standup” ceremony article; the page itself was Cloudflare-gated.
- We did **not** audit binary APIs or privacy-policy PDFs line-by-line. Claim is: **official marketing and help do not advertise Gmail mailbox read.** If a vendor uses Gmail privately, that is unverified and not a contract we can copy.
- Bank-link coverage (Plaid/MX, 2,500 / 15,000 institutions) is the vendor’s claim on the cited page.
- CASA cost and Play SMS approval odds are still not official numbers.

---

## Sources

**Budget**

- [YNAB](https://www.ynab.com/)
- [YNAB Features](https://www.ynab.com/features)
- [YNAB Subscription Sharing](https://www.ynab.com/features/subscription-sharing)
- [YNAB Together](https://support.ynab.com/en_us/ynab-together-B1nS78Cki)
- [How Direct Import Works](https://support.ynab.com/en_us/how-direct-import-works-H1IGYLgnxl)
- [Spendee](https://www.spendee.com/)
- [Spendee Shared Wallets](https://help.spendee.com/article/224-shared-wallets)
- [Spendee Bank sync](https://www.spendee.com/bank-connect)
- [Spendee Connect a bank](https://help.spendee.com/article/144-connect-a-bank-account)
- [Wallet by BudgetBakers](https://budgetbakers.com/en/products/wallet/)
- [Wallet Group Sharing](https://support.budgetbakers.com/hc/en-us/articles/7149394922002-Everything-about-Group-Sharing)
- [Bluecoins Online Sync](https://www.bluecoinsapp.com/settings/online-sync/)
- [Bluecoins Backup and Sync Server](https://www.bluecoinsapp.com/backup-and-sync-server/)
- [Bluecoins SMS permissions](https://www.bluecoinsapp.com/google-policy-removing-sms-permissions/)
- [Google Family Link](https://families.google/familylink/)

**Mail / walls**

- [Automatically forward Gmail](https://support.google.com/mail/answer/10957)
- [Gmail API scopes](https://developers.google.com/workspace/gmail/api/auth/scopes)
- [Workspace user data and developer policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy)
- [Apple SMS / MMS filtering](https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering)
- [What is ChatGPT Plus?](https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus)
- [OpenAI Terms](https://openai.com/policies/row-terms-of-use/)

**Standup / tasks / ERP**

- [Geekbot](https://geekbot.com/)
- [Geekbot Daily Standup](https://help.geekbot.com/en/articles/7041452-daily-standup)
- [DailyBot](https://www.dailybot.com/)
- [Dailybot on Slack Marketplace](https://slack.com/marketplace/A44PZQW83-dailybot-standups-ai-agents)
- [Standuply](https://standuply.com/)
- [Range](https://www.range.co/)
- [Linear](https://linear.app/)
- [Linear Method](https://linear.app/method)
- [Notion Projects](https://www.notion.com/product/projects)
- [Notion product-team workspace guide](https://www.notion.com/help/guides/connected-workspace-for-product-teams-to-collaborate-ideate-and-launch)
- [What is Jira](https://www.atlassian.com/software/jira/guides/getting-started/overview)
- [SAP ERP](https://www.sap.com/products/erp.html)
- [Odoo](https://www.odoo.com/)
