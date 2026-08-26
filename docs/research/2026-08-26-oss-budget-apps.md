# Open-source budget apps: what Taskkorb family-budget can copy

Research only. **No product code in this change.** Written 26 Aug 2026.

This note is the **open-source** companion to the commercial family-budget scan (YNAB Together / Spendee Shared Wallets / Wallet Group Sharing / Bluecoins). It answers: official sites, licenses, sync models, and whether Firefly III, Actual Budget, or peers **email/SMS-import** transactions.

**Hard rule for every claim below:** none of these official products publish an iOS Messages inbox API, and **Taskkorb must never claim they (or we) read iOS SMS.** Apple’s public SMS surface for third-party apps is [SMS and MMS Message Filtering](https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering) (unknown-senders filter; the extension cannot write the message body into the containing app). That is not an inbox.

Firecrawl CLI in this environment was **unauthenticated** and the keyless free tier was rate-limited. Facts below are from official-page fetches of the same docs/sites. Treat this as a source list, not a Firefly/Actual code audit.

This is **not legal advice**. Licenses and store rules change.

---

## Answer first

**Copy the product contracts, not the AGPL code.**

| Copy into Taskkorb family-budget v1 | Do not copy |
|---|---|
| **Invite-by-email + own login + one shared ledger** (the commercial pattern). Firefly **cannot** share one administration today; Actual shares a **file**, not roles. | Firefly’s “share the username and password” workaround. [General FAQ](https://docs.firefly-iii.org/references/faq/firefly-iii/general/) |
| **Manual entry + CSV/OFX/QIF file import** (Actual official; Firefly via Data Importer). | Official bank OAuth (GoCardless / SimpleFIN / Plaid-class) as v1. |
| **Outbound SMTP** (“a transaction was imported / confirm this draft”). Firefly does this. | **Inbound mailbox scrape** (IMAP/Gmail OAuth). None of the official OSS apps document that. |
| **User-initiated capture:** iOS Shortcut / share sheet / unique inbound **forward** address. Firefly’s listed iOS tools POST to the API or *send* an SMS. | Any sentence that says Firefly, Actual, GnuCash, Sure, or Ghostfolio **read iOS SMS**. They do not, officially. |
| **Parse → draft → user confirms.** Firefly’s author refuses official AI categorization because models hallucinate. [FAQ](https://docs.firefly-iii.org/references/faq/firefly-iii/general/) | Auto-posting guessed merchants or “whose sale was this?” |
| Actual’s **honesty about conflicts** if two people edit the same file at once. [Sync](https://actualbudget.org/docs/getting-started/sync/) | Pretending Actual is YNAB Together (it is not RBAC). |
| Study Actual **MIT** code with attribution if we actually copy files. [LICENSE.txt](https://github.com/actualbudget/actual/blob/master/LICENSE.txt) | Vendor Firefly / Maybe / Sure / Ghostfolio **AGPL** source into a closed Taskkorb. Firefly’s own license page: “inspired by” without using their code is not AGPL. [License](https://docs.firefly-iii.org/explanation/more-information/license/) |

**v1 sync model to copy:** server-of-record household ledger (YNAB/Spendee shape), **not** Actual’s local-first CRDT and **not** Firefly’s isolated-per-user administrations. Email is **invite + optional user-forwarded bank mail**, never “we connected Gmail.” SMS is **not** an official import path on any of these OSS apps.

---

## Comparison (official facts only)

| App | Official site | Source | License | Sync model | Official email | Official SMS |
|---|---|---|---|---|---|---|
| **Firefly III** | [firefly-iii.org](https://www.firefly-iii.org/) · [docs](https://docs.firefly-iii.org/) | [github.com/firefly-iii/firefly-iii](https://github.com/firefly-iii/firefly-iii) | **AGPLv3** (app + Data Importer + associated tools). [License](https://docs.firefly-iii.org/explanation/more-information/license/) | Self-hosted **web app is the system of record**. Multi-user = isolated administrations. Household share = **same login** until a sharing model ships. [FAQ](https://docs.firefly-iii.org/references/faq/firefly-iii/general/) · [Administrations](https://docs.firefly-iii.org/explanation/financial-concepts/administrations/) | **Outbound SMTP** for events; Data Importer can email import reports. Not mailbox read. [Notifications](https://docs.firefly-iii.org/how-to/firefly-iii/advanced/notifications/) · [Importer mail](https://docs.firefly-iii.org/how-to/data-importer/advanced/notifications/) | **No official inbox read.** Docs list a **third-party** “create transactions by **sending** an SMS from your iPhone” plus an **iOS Shortcut**. [Third-party apps](https://docs.firefly-iii.org/references/firefly-iii/third-parties/apps/) |
| **Actual Budget** | [actualbudget.org](https://actualbudget.org/) · [docs](https://actualbudget.org/docs/) | [github.com/actualbudget/actual](https://github.com/actualbudget/actual) | **MIT** (James Long). [LICENSE.txt](https://github.com/actualbudget/actual/blob/master/LICENSE.txt) | **Local-first.** Device holds the DB. Optional sync server stores a snapshot + change messages. Optional E2E. Bank sync and multi-device need the server. [Install](https://actualbudget.org/docs/install/) · [Sync](https://actualbudget.org/docs/getting-started/sync/) | No official inbound mail import. No official outbound mail product. Community IMAP poll exists; it is **not** Actual. | **None official.** Official mobile apps are **deprecated**; PWA + community iOS clients. [FAQ](https://actualbudget.org/docs/faq/) |
| **GnuCash** | [gnucash.org](https://www.gnucash.org/) | [github.com/Gnucash/gnucash](https://github.com/Gnucash/gnucash) | **GPL-2.0-or-later** (most files). [LICENSE](https://github.com/Gnucash/gnucash/blob/stable/LICENSE) | Desktop file. No official multi-device cloud. | Support **mailing lists**, not transaction import. [Home](https://www.gnucash.org/) | **None official.** |
| **Sure** (Maybe community fork) | [sure.am](https://sure.am/) | [github.com/we-promise/sure](https://github.com/we-promise/sure) | **AGPLv3**. “Maybe” is a Maybe Finance Inc. trademark — forks must not use the name/logo. [Sure README](https://github.com/we-promise/sure) | Self-host web. Marketed account-linking + manual/CSV. | Site does not document mailbox scrape. | **None official.** |
| **Maybe Finance** (archived) | — | [github.com/maybe-finance/maybe](https://github.com/maybe-finance/maybe) | **AGPLv3**. Archived 27 Jul 2025. | Historical only. Do not build on it. | — | — |
| **Ghostfolio** | [ghostfol.io](https://ghostfol.io/en/about) | [github.com/ghostfolio/ghostfolio](https://github.com/ghostfolio/ghostfolio) | **AGPL-3.0** | Self-host or Ghostfolio Premium cloud. | Wealth / portfolio tracker, **not** a household envelope ledger. | **None official.** |

---

## 1. Firefly III

### What it is

Self-hosted personal-finance **web** app (no official desktop). PHP/Laravel. Separate **Data Importer** talks to Firefly over the API and pulls files or third-party bank providers. [Importer intro](https://docs.firefly-iii.org/explanation/data-importer/introduction/) · [Importing data](https://docs.firefly-iii.org/tutorials/firefly-iii/importing-data/)

Budgeting is **not** YNAB zero-sum / envelope-to-zero. You set monthly amounts; leftover income can sit in savings / piggy banks. [FAQ](https://docs.firefly-iii.org/references/faq/firefly-iii/general/)

### License (copy implication)

[Official license page](https://docs.firefly-iii.org/explanation/more-information/license/):

- Firefly III, the Data Importer, and associated tools by the author are **AGPLv3**.
- Modified hosted copies must offer source to users.
- **White-label / commercial host is allowed if changes stay AGPL.**
- **“Inspired by” without using or changing Firefly code is not AGPL.** Name and logo have a separate page.
- A mobile app that only **calls the API** (no Firefly source) is not forced to AGPL.

**Taskkorb:** do not vendor Firefly PHP. Do not use the name/logo. API-shaped “create transaction” is fine.

### Sync / multi-user (this is the important gap)

| Official statement | Source |
|---|---|
| Unlimited users; each has a **completely separated** financial administration. Registration closes after the first user (security default). First user is owner. | [Make it multi-user](https://docs.firefly-iii.org/how-to/firefly-iii/features/multi-user/) |
| **Cannot share one administration.** Sharing model (read/write parts) is a long project, not shipped. | Same page · [Administrations](https://docs.firefly-iii.org/explanation/financial-concepts/administrations/) |
| Partner share **today** = share username and password. | [General FAQ](https://docs.firefly-iii.org/references/faq/firefly-iii/general/) |
| Data Importer can be multi-user via OAuth to Firefly (no personal access token). CLI / POST import then unavailable. Authelia-style remote auth forces per-user tokens → one importer per user. | [Importer intro](https://docs.firefly-iii.org/explanation/data-importer/introduction/) |

**Do not copy Firefly’s household model.** Taskkorb family-budget already chose YNAB Together: own logins, invite by email, one ledger. Firefly’s official answer for couples is the opposite.

### Email

Official email is **outbound**:

- Core app: SMTP / sendmail / Mailgun / Mandrill / Sparkpost / MailerSend / log. Test button at `/settings/notifications`. Slack / Discord / Mattermost incoming webhooks. Separate **transaction webhooks** on `/webhooks/*`. [Notifications](https://docs.firefly-iii.org/how-to/firefly-iii/advanced/notifications/)
- Data Importer: `ENABLE_MAIL_REPORT` emails import results (useful for cron). [Importer notifications](https://docs.firefly-iii.org/how-to/data-importer/advanced/notifications/)

Official import sources: CSV, CAMT.052 / CAMT.053, and third-party bank providers (not the user’s IMAP inbox). [Importer GitHub](https://github.com/firefly-iii/data-importer)

A community “Summary emails” tool (monthly category overview) is listed as third-party. [Third-party apps](https://docs.firefly-iii.org/references/firefly-iii/third-parties/apps/)

**Copy:** SMTP “draft ready / import finished.” **Do not copy:** “Firefly reads Gmail.” It does not.

### SMS — official vs community (do not conflate)

**Official Firefly does not read SMS on any OS.**

The [third-party apps](https://docs.firefly-iii.org/references/firefly-iii/third-parties/apps/) page lists, as **community** tools:

- **“iPhone SMS to Firefly III transaction”** — “create transactions in Firefly III **by sending an SMS** from your iPhone.” That is **user-originated send**, not Messages inbox read.
- **“iOS Shortcut”** — create transactions (community Shortcuts POST the Firefly API with a personal access token; examples: [dtrainych/firefly-ios-shortcuts](https://github.com/dtrainych/firefly-ios-shortcuts), [Sid Verma](https://sidverma.io/posts/firefly-iii-ios-shortcuts/), [Jesse Dyck](https://jessedyck.me/2019/03/ios-shortcuts-firefly-iii/)).
- Telegram bots that create transactions from chat.

**Not official, do not market as Firefly, do not copy as Taskkorb iOS v1:**

- [SMSReceiver-iOS](https://github.com/mrahmadt/SMSReceiver-iOS) (community) uses Apple **Message Filtering** and forwards SMS to a server for [smartMoney](https://github.com/mrahmadt/smartMoney) → Firefly API. The author states you **cannot publish** it because the server URL is hardcoded (Apple’s extension rules). That is **not** “Firefly reads iOS SMS,” and it is not App Store–shippable as described.
- [SreejitS/auto-budget](https://github.com/SreejitS/auto-budget) is a user pipeline: iOS Shortcut automation and/or **macOS iMessage `chat.db`**, then Firefly API. Not Firefly. Not an iOS inbox API.

Android Firefly clients ([Waterfly III](https://docs.firefly-iii.org/references/firefly-iii/third-parties/apps/), Photuris III, etc.) connect to a self-hosted instance. Official docs do not claim they hold `READ_SMS`.

**Taskkorb line:** user can **Share / Shortcut / forward a text they picked**. We never say the iOS app reads Messages.

### Other official “no”

- **No official AI** in Firefly. Author: LLMs hallucinate; will not send user data to the cloud; local models are impractical. Webhooks exist so *you* can bolt on suggestions. [FAQ](https://docs.firefly-iii.org/references/faq/firefly-iii/general/)
- **No PSD2 “just work”** — registration as an AISP is expensive and per-bank APIs differ. [FAQ](https://docs.firefly-iii.org/references/faq/firefly-iii/general/)
- Author is **not** interested in Firefly-as-a-Service; insider DB access, weak admin, high change rate. [FAQ](https://docs.firefly-iii.org/references/faq/firefly-iii/general/)

---

## 2. Actual Budget

### What it is

Local-first **envelope** budgeting. Started 2017, opened 2022. Official hosted subscription **shut down in 2024**; today’s product is self-host + desktop + PWA. [FAQ](https://actualbudget.org/docs/faq/) · [Home](https://actualbudget.org/)

### License (copy implication)

[LICENSE.txt](https://github.com/actualbudget/actual/blob/master/LICENSE.txt) is **MIT**, copyright James Long. GitHub SPDX: MIT. [actualbudget/actual](https://github.com/actualbudget/actual)

**Taskkorb may study and, if we copy files, keep the MIT notice.** That is the only OSS budget stack here that is license-easy to learn from in a closed app.

### Sync model (copy the honesty, not necessarily the engine)

From [Syncing Across Devices](https://actualbudget.org/docs/getting-started/sync/) and [Installing](https://actualbudget.org/docs/install/):

| Fact | Official |
|---|---|
| Data lives on the **device** and, if configured, on **your** sync server. Works offline. | Sync page |
| Server is optional for budgeting + file import. **Required** for: other devices, browser/mobile install, bank sync, API. | Install table |
| Optional **E2E**: second password; server cannot read budget data. Bank-sync tokens (SimpleFIN / GoCardless / Pluggy) stay on the server and are **not** covered by E2E. | Sync page |
| Same file may be opened by two browsers / two people. “This should work unless the edits conflict. To be safe, **avoid simultaneous usage**.” | Sync → Multi-user Support |
| Different E2E passwords can isolate files on a **shared server**. That is file isolation, not household roles. | Sync page |
| Sync reset treats one local file as truth; other devices revert. | Sync page |
| No REST API. `@actual-app/api` runs the UI headless against the **local** DB. Sync server holds a snapshot + messages, not the live full DB. | [FAQ](https://actualbudget.org/docs/faq/) · [API](https://actualbudget.org/docs/api/) |

**Taskkorb family-budget v1** wants invite-by-email and a manager who can see the household ledger. That is closer to a **server-of-record** (Firefly/YNAB shape) than to Actual’s message-log. Copy Actual’s **conflict warning** and **optional E2E later**, not the “no REST, local DB is canonical” architecture, unless we explicitly choose a local-first product.

Official bank sync: GoCardless (EU/UK) and SimpleFIN (US/Canada). [Home](https://actualbudget.org/) · [FAQ](https://actualbudget.org/docs/faq/). File import: QIF, OFX, QFX, CAMT.053, CSV. YNAB4 / nYNAB importers. [Home](https://actualbudget.org/)

Official mobile apps **deprecated**. Responsive PWA; community native clients (e.g. Actuali) listed separately. [FAQ](https://actualbudget.org/docs/faq/) · [Community projects](https://actualbudget.org/docs/community-repos/)

### Email / SMS

**Official Actual does not import from email or SMS.**

[Community projects](https://actualbudget.org/docs/community-repos/) lists bank exporters, tap-to-pay helpers, AI categorizers, a local REST bridge, iOS Shortcuts via community apps — **no first-party mail or SMS importer**. A third-party [actual-imap-poll](https://git.gotroot.ca/ktims/actual-imap-poll) polls IMAP and pushes via the API; that is community, not Actual.

**Do not write “Actual reads your bank emails / SMS.”**

---

## 3. Other OSS (so “maybe others” is grounded)

### GnuCash — [gnucash.org](https://www.gnucash.org/)

Desktop double-entry for personal **and small-business** books. GPL. Linux / BSD / Solaris / macOS / Windows. Volunteer project. **No official cloud sync, no official SMS, no official receipt-mailbox.** Email on the site is **project mailing lists**. Too much accounting surface for a family-budget v1; Firefly’s own FAQ says GnuCash has more accounting (funds, stock, equity). [FAQ](https://docs.firefly-iii.org/references/faq/firefly-iii/general/)

**Copy:** nothing for v1 except “file-based honesty.”

### Sure — [sure.am](https://sure.am/) · Maybe archive

[maybe-finance/maybe](https://github.com/maybe-finance/maybe) is **archived**, AGPLv3. Community fork **Sure** ([we-promise/sure](https://github.com/we-promise/sure), [sure.am](https://sure.am/)): AGPLv3, must not use the Maybe name/logo. Site: link institutions, manual accounts, CSV, rules, category budgets, optional AI Q&A.

**Copy:** “manual + CSV still work if linking is off.” **Do not copy:** Maybe trademark, AGPL codebase, or “link 10,000 institutions” as v1.

### Ghostfolio — [ghostfol.io](https://ghostfol.io/en/about)

AGPL wealth tracker for stocks / ETFs / crypto. Wrong job for a household grocery ledger.

### Not in this table (on purpose)

Plain-text ledgers (Ledger / hledger / beancount) are CLI workflows, not family apps. KMyMoney / HomeBank are desktop GPL cousins of GnuCash. Lunch Money / YNAB / Spendee are **not** OSS (covered in the commercial note).

---

## 4. What Taskkorb family-budget should take

Maps onto the already-chosen v1 (shared ledger, invite by email, manual + optional Gmail **forward**, confirm drafts). OSS apps **confirm** that v1; they do not replace YNAB Together as the sharing model.

### Copy (ideas / contracts)

1. **Own logins, not a shared Firefly password.** Firefly documents the password-share hack because sharing is unfinished. We already rejected that.
2. **File import in week one.** Actual’s official formats + Firefly’s CSV/CAMT importer are how self-hosted users actually get bank data without Plaid.
3. **Unique inbound address + Gmail filter/forward** (commercial note). OSS does **not** officialize IMAP/Gmail OAuth; community IMAP for Actual is a warning, not a template for store review.
4. **Outbound mail:** Firefly SMTP for “import finished / please confirm drafts.”
5. **User-initiated phone capture:** iOS Shortcut or Share sheet → our API (Firefly community pattern). Telegram later if we want a bot. This is **the user sending us a transaction**, not us reading Messages.
6. **Do not guess.** Firefly’s written refusal of official AI categorization is the same sentence as “I am unable to tell whose sale this was.”
7. **Conflict copy** from Actual if two household members edit at once: say so, or lock rows.
8. **Optional E2E later** (Actual), knowing bank-link tokens would sit outside that envelope.
9. **REST API** (Firefly shape) if the household ledger is cloud-hosted. Do not start from Actual’s “no REST, headless UI” unless we pick local-first.
10. **MIT study:** Actual’s envelope UX, undo, reports, transfer linking. Attribution if code is copied.

### Do not copy

1. **AGPL source** from Firefly, Data Importer, Maybe, Sure, Ghostfolio into a closed tree. “Inspired by” is explicitly OK for Firefly **if we do not use their code.** [License](https://docs.firefly-iii.org/explanation/more-information/license/)
2. **Firefly / Actual / Sure names or logos.**
3. **“We read iOS SMS”** or “like Firefly / Actual / SMSReceiver.” Official Firefly SMS item is **send**. SMSReceiver-iOS is unpublished-by-design community code on Message Filter. Apple has **no** public inbox API.
4. **Android `READ_SMS`** on a notes/voice listing. Play’s money-management exception is discretionary; Bluecoins was denied. Budget must be the **core** listing, later, if ever.
5. **Bank aggregators as v1** (GoCardless, SimpleFIN, Plaid, Sure’s “10,000+ institutions”).
6. **Actual’s deprecated native apps** as a promise we will ship official iOS/Android clients. Their official path is PWA.
7. **Ghostfolio** as a budget; it is a portfolio.
8. **Maybe** as a live upstream.

### SMS / email one-liner for marketing and Review

> Taskkorb family-budget does not read the iOS Messages inbox. Nobody we studied — Firefly III, Actual Budget, GnuCash, Sure, Ghostfolio — documents an official iOS SMS reader. Optional capture is: type it, share it, run a Shortcut, or **forward** a bank email to an address we give you.

---

## 5. Method and gaps

| Source class | Used |
|---|---|
| Official marketing + docs (Actual, Firefly docs, GnuCash, Sure, Ghostfolio about, GitHub LICENSE / README) | Yes |
| Firefly third-party list (clearly labeled community) | Yes, quoted as community |
| Community SMS/IMAP repos | Yes, **only** to forbid claiming them as official or as iOS inbox APIs |
| Firecrawl CLI | **Attempted.** Unauthenticated; keyless rate limit. Same URLs fetched directly. |
| firefly-iii.org homepage | Cloudflare-gated this run; GitHub + docs used instead |

**Not claimed:** star counts as quality, 2026 blog comparisons as official, Waterfly/Photuris Play listings’ SMS permissions (not pulled). Re-check Play listings before any Android SMS story.

---

## Sources

- [Firefly III](https://www.firefly-iii.org/)
- [Firefly III license](https://docs.firefly-iii.org/explanation/more-information/license/)
- [Firefly III general FAQ](https://docs.firefly-iii.org/references/faq/firefly-iii/general/)
- [Firefly III multi-user](https://docs.firefly-iii.org/how-to/firefly-iii/features/multi-user/)
- [Firefly III administrations](https://docs.firefly-iii.org/explanation/financial-concepts/administrations/)
- [Firefly III notifications](https://docs.firefly-iii.org/how-to/firefly-iii/advanced/notifications/)
- [Firefly III Data Importer](https://docs.firefly-iii.org/explanation/data-importer/introduction/)
- [Firefly III importing data](https://docs.firefly-iii.org/tutorials/firefly-iii/importing-data/)
- [Firefly III importer notifications](https://docs.firefly-iii.org/how-to/data-importer/advanced/notifications/)
- [Firefly III third-party apps](https://docs.firefly-iii.org/references/firefly-iii/third-parties/apps/)
- [firefly-iii/firefly-iii](https://github.com/firefly-iii/firefly-iii)
- [firefly-iii/data-importer](https://github.com/firefly-iii/data-importer)
- [Actual Budget](https://actualbudget.org/)
- [Actual install](https://actualbudget.org/docs/install/)
- [Actual sync](https://actualbudget.org/docs/getting-started/sync/)
- [Actual FAQ](https://actualbudget.org/docs/faq/)
- [Actual API](https://actualbudget.org/docs/api/)
- [Actual community projects](https://actualbudget.org/docs/community-repos/)
- [actualbudget/actual](https://github.com/actualbudget/actual)
- [Actual LICENSE.txt](https://github.com/actualbudget/actual/blob/master/LICENSE.txt)
- [GnuCash](https://www.gnucash.org/)
- [Gnucash/gnucash LICENSE](https://github.com/Gnucash/gnucash/blob/stable/LICENSE)
- [Sure](https://sure.am/)
- [we-promise/sure](https://github.com/we-promise/sure)
- [maybe-finance/maybe](https://github.com/maybe-finance/maybe)
- [Ghostfolio about](https://ghostfol.io/en/about)
- [Apple SMS and MMS Message Filtering](https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering)
- Community-only (not official products): [SMSReceiver-iOS](https://github.com/mrahmadt/SMSReceiver-iOS), [smartMoney](https://github.com/mrahmadt/smartMoney), [auto-budget](https://github.com/SreejitS/auto-budget), [actual-imap-poll](https://git.gotroot.ca/ktims/actual-imap-poll), [firefly-ios-shortcuts](https://github.com/dtrainych/firefly-ios-shortcuts)
