# 🛡️ NexusGuard Agentic Network

[![Arc Hackathon](https://img.shields.io/badge/Arc%20Hackathon-Track%202:%20Agentic%20Economy-d4af37.svg?style=for-the-badge)](https://www.encodeclub.com/programmes/arc-hackathon)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF.svg?style=for-the-badge&logo=github-actions)](https://github.com/tuannguyenvan95/nexusguard/actions)
[![Circle](https://img.shields.io/badge/Powered%20by-Circle%20Tools-blue.svg?style=for-the-badge)](https://developers.circle.com/)

**NexusGuard** is a fully autonomous network built for the **Agentic Economy**. It replaces traditional human-in-the-loop workflows with a decentralized network of specialized AI Agents. These agents hold their own developer-controlled wallets, autonomously validate job deliverables, and instantly settle payments via USDC micro-transactions without requiring any human approval.

🌐 **Live Demo:** [https://nexusguard-beta-psi.vercel.app](https://nexusguard-beta-psi.vercel.app)

---

## 🎯 The Problem

In traditional B2B software development and freelance platforms, the escrow and validation process is slow, heavily reliant on human trust, and plagued by intermediary fees. Companies wait days for wire transfers, and developers wait weeks for PRs to be manually reviewed and paid out.

## 💡 The Solution

NexusGuard removes the human bottleneck by deploying specialized AI Agents on the **Arc Blockchain**:

1. **AI Escrow Agent (ERC-8183):** Programmatically analyzes GitHub PRs and UI deployments. Upon successful code and visual validation, it autonomously signs transactions and settles payments in USDC.
2. **AI Treasury Agent:** Autonomously monitors liquidity and manages yield generation in DeFi pools.
3. **M2M Nanopayments:** Agents pay each other instantly for sub-services (e.g., Risk Analysis, Security Scans) using Arc's ultra-low gas fee architecture.

---

## 🚀 Key Features

* **🤖 Autonomous Escrow & Settlement:** Watch the AI Validator node review code delivery and instantly release USDC funds to the developer's wallet.
* **🔗 Real Wallet Connect:** Connect MetaMask or Coinbase Wallet directly in the header via `viem` — auto-switches to Arc Testnet (adds the chain if missing), persists the address across reloads, and stays live-synced on account changes. The same shared wallet layer (`src/lib/wallet.ts` + `src/hooks/useWallet.ts`) powers every wallet-aware page.
* **📊 Dashboard Monitoring Suite:** A dedicated monitoring page with live agent health, escrow contract monitors, network status, transaction monitors, alert logs, and uptime trackers.
* **💸 M2M Economy Ledger:** A live dashboard showing sub-cent nanopayments between different AI nodes (Validator, Guardian, Strategy) happening in real-time.
* **🏦 AI Treasury Management:** Autonomous rebalancing of DAO funds to maximize yield based on real-time APY metrics.
* **💳 Milestone-Based Escrow (V2):** Jobs split into payment milestones with `%` splits, on-chain dispute flow, and deadline auto-refund via the `NexusGuardEscrowV2` contract.
* **🧾 B2B Compliance Ready:** Automated tax scanning and invoice generation to ensure enterprise-grade compliance.
* **👻 Invisible Blockchain UX:** Email-based onboarding, one-click wallet connect, and a clean cyberpunk dashboard — no hex strings or gas fee popups.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS 4, Framer Motion, Recharts.
* **Backend:** Next.js Route Handlers (`/api/*`), Supabase (Postgres + Auth), Nodemailer for team invites.
* **Blockchain/Infrastructure:** Arc L1 Testnet (USDC/EURC), `viem` for chain clients + wallet connect, `ethers` for contract encoding, Hardhat for contract development.
* **AI Agents:** OpenAI (deliverable validation) with pluggable agent modules (`src/lib/agents/*`).
* **Circle Developer Platform:**
  * Developer-Controlled Wallets (For AI Agents).
  * Circle App Kit & Contract Platform.
  * Nanopayments Architecture.

---

## 📁 Project Structure

```
contracts/              Solidity escrow contracts (V1 + V2 with milestones/refunds)
scripts/                Hardhat deploy scripts + wallet generation
supabase/migrations/    DB schema (auth profiles, treasury, nexus_jobs)
supabase/*_schema.sql      Standalone schema scripts (nexus_jobs, teams, jobs, treasury_transactions, agent_actions)
src/lib/                Shared logic: wallet layer, agents, chain clients, Supabase, jobs
src/hooks/              useWallet, useTheme, useAudio, useIsClient
src/app/api/            Server routes (agents/*, evaluate, jobs, team, wallets)
src/app/dashboard/      Dashboard pages (jobs, treasury, monitoring, agents, profile…)
src/components/         UI components (layout, monitoring widgets, job forms)
test/                   Hardhat contract tests
src/lib/__tests__/      Vitest unit tests
.github/workflows/      CI pipeline
```

---

## 💻 Getting Started (Local Development)

### Prerequisites

* Node.js **20+** (CI runs on 20 and 22)
* npm or yarn
* A wallet browser extension (MetaMask or Coinbase Wallet) for on-chain flows

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tuannguyenvan95/nexusguard.git
   cd nexusguard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables — create `.env.local` (see the sample keys below):
   ```bash
   # Supabase (required for auth + jobs DB)
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...

   # Wallet / escrow (used by the evaluate route to release funds)
   TREASURY_PRIVATE_KEY=...
   DEPLOYER_PRIVATE_KEY=...
   ESCROW_CONTRACT_ADDRESS=0xECF383892b85CA8e8977f175137567E5bDa02FF0

   # AI validation
   OPENAI_API_KEY=...

   # Circle (optional — developer-controlled wallets)
   CIRCLE_API_KEY=...
   CIRCLE_ENTITY_SECRET=...
   ```

4. Apply the Supabase migrations (`supabase/migrations/*.sql`) in your Supabase project so the auth profiles, treasury, and `nexus_jobs` tables exist.

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🗄️ Database Schema: `nexus_jobs`

The dashboard job flow (create / list / detail / apply / submit / validate / dispute / delete) is backed by the `nexus_jobs` table. It intentionally differs from the `jobs` table used by the agent libs: `nexus_jobs` stores contracts keyed by a short text id (e.g. `job_48162`, generated client-side) with denormalized display fields.

**Columns** (18 total):

| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | e.g. `job_48162`, generated client-side |
| `title` | `text` NOT NULL | |
| `amount` | `text` | display string, e.g. `2500 USDC` |
| `status` | `text` NOT NULL DEFAULT `'Open'` | `Open` / `Draft` / `Funded` / `In Progress` / `Submitted` / `Completed` / … |
| `provider` | `text` | JSON `{ address, name, avatar }` |
| `date` | `text` | display deadline, e.g. `Oct 24, 2026` |
| `deadline` | `text` | ISO date picked in the create form |
| `agent` | `text` | assigned AI agent / swarm label |
| `description` | `text` | |
| `requirements` | `jsonb` NOT NULL DEFAULT `'[]'` | acceptance criteria |
| `payouttype` | `text` NOT NULL DEFAULT `'winner_takes_all'` | |
| `maxwinners` | `text` NOT NULL DEFAULT `'1'` | |
| `milestones` | `jsonb` NOT NULL DEFAULT `'[]'` | `{ name, amount, percent, status, disputeOpen, disputeResult }[]` |
| `applicant` | `text` NOT NULL DEFAULT `'[]'` | JSON `string[]` of applicant addresses |
| `deliverables` | `jsonb` NOT NULL DEFAULT `'[]'` | `{ submitterWallet, githubUrl, previewUrl, socialHandle }[]` |
| `payout_txs` | `jsonb` NOT NULL DEFAULT `'[]'` | `{ address, txHash }[]` |
| `ai_reports` | `jsonb` NOT NULL DEFAULT `'{}'` | `{ "<submitterWallet>": "<report>" }` |
| `created_at` | `timestamptz` NOT NULL DEFAULT `now()` | |

> **Note:** `applicant` is deliberately `text` (a JSON string), not `jsonb` — the job detail page parses it with `JSON.parse()`, which breaks when PostgREST already returns a parsed array.

**Setup & repair:**

* **Migration:** `supabase/migrations/003_nexus_jobs.sql` — creates the table plus RLS policies. Hand-created tables that predate later columns are patched with idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements (`deadline`, `milestones`) followed by `NOTIFY pgrst, 'reload schema';`.
* **Standalone script:** `supabase/nexus_jobs_schema.sql` — a single, shareable, idempotent script: full `CREATE TABLE` + ALTER patch + index + RLS policies + schema-cache reload. Paste it into the Supabase **SQL Editor** and run, or `psql "$DATABASE_URL" -f supabase/nexus_jobs_schema.sql`. Safe to re-run on any project — fresh or existing.
* **Drift guards:** `src/lib/__tests__/nexus-jobs-schema.test.ts` (runs in CI) fails if the app reads or writes a `nexus_jobs` column that isn't declared and patched in the migration, or if the standalone script drifts from migration 003. `src/lib/__tests__/standalone-schema-sync.test.ts` does the same for the other scripts vs migrations 001/002. Keep them in sync when changing either side.

---

## 🗄️ Database Schema: Teams, Jobs, Treasury & Agents

Canonical DDL for these tables lives in `supabase/migrations/001_initial_schema.sql` (+ `002_treasury_insert_policy.sql`), and each has a standalone, idempotent setup script under `supabase/*_schema.sql`. They complement `nexus_jobs` (the dashboard job flow) — `jobs` is the on-chain/team job model used by the agent libs and `GET /api/jobs`.

### teams & team_members

`supabase/teams_schema.sql` · used by the dashboard team pages and `/api/team*` routes.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | default `uuid_generate_v4()` |
| `name` | `text` NOT NULL | |
| `owner_id` | `uuid` → `auth.users` | ON DELETE CASCADE |
| `treasury_wallet_address` | `text` | Circle wallet address |
| `treasury_wallet_id` | `text` | Circle wallet id |
| `created_at` | `timestamptz` | default `now()` |

`team_members` (companion, in the same script): `id`, `team_id` → `teams` (CASCADE), `user_id` → `auth.users` (SET NULL), `email`, `display_name`, `role` (`admin`/`member`/`contractor`), `wallet_address`, `wallet_id`, `reputation_score` int, `joined_at`, `UNIQUE(team_id, user_id)`.

### jobs

`supabase/jobs_schema.sql` · on-chain/team job model used by the agent libs + `GET /api/jobs`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | default `uuid_generate_v4()` |
| `onchain_job_id` | `bigint` | |
| `team_id` | `uuid` → `teams` NOT NULL | ON DELETE CASCADE |
| `title` | `text` NOT NULL | |
| `description` | `text` | |
| `client_address` / `provider_address` / `evaluator_address` | `text` | wallet addresses |
| `provider_user_id` | `uuid` → `auth.users` | |
| `budget_usdc` | `decimal(20,6)` | |
| `status` | `text` default `'draft'` | `draft`/`open`/`funded`/`submitted`/`completed`/`rejected`/`expired` |
| `milestones` | `jsonb` default `'[]'` | |
| `deliverable_hash` / `deliverable_description` | `text` | |
| `validation_score` | `integer` | |
| `validation_feedback` / `tx_hash` | `text` | |
| `expires_at` | `timestamptz` | |
| `created_at` / `updated_at` | `timestamptz` | default `now()` |

Indexes: `idx_jobs_team(team_id)`, `idx_jobs_status(status)`. No RLS policies are defined (server-side client accesses it via the service role) — see the script header.

### treasury_transactions

`supabase/treasury_transactions_schema.sql` · USDC ledger written by `/api/wallets/transfer`, read by the treasury dashboard.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | default `uuid_generate_v4()` |
| `team_id` | `uuid` → `teams` NOT NULL | ON DELETE CASCADE |
| `type` | `text` NOT NULL | `deposit`/`withdrawal`/`payment`/`yield` |
| `amount_usdc` | `decimal(20,6)` NOT NULL | |
| `from_address` / `to_address` / `tx_hash` | `text` | |
| `description` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

Index: `idx_treasury_team(team_id)`. The migration-002 insert policy lets team members/owners record their own ledger entries.

### agent_actions

`supabase/agent_actions_schema.sql` · action ledger written by the agent libs (`src/lib/agents/*`). Its `agents` prerequisite (the AI-agent registry) is included in the same script and seeded with the 5 default NexusGuard agents.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | default `uuid_generate_v4()` |
| `agent_id` | `uuid` → `agents` | ON DELETE CASCADE |
| `action_type` | `text` NOT NULL | free-form action label |
| `job_id` | `uuid` → `jobs` | ON DELETE SET NULL |
| `details` | `jsonb` default `'{}'` | action payload |
| `tx_hash` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

Indexes: `idx_agent_actions_agent(agent_id)`, `idx_agent_actions_job(job_id)`.

> **Setup:** paste each `supabase/*_schema.sql` into the Supabase **SQL Editor** and run (each is self-contained and idempotent), or apply migrations `001` + `002`. The CI drift guard (`src/lib/__tests__/standalone-schema-sync.test.ts`) keeps these scripts in sync with the migrations.

---

## 🧪 Testing & CI

```bash
npm run test:run      # Unit tests (Vitest, jsdom) — 151 tests across 12 files (incl. schema drift guards)
npm run test:contracts  # Smart contract tests (Hardhat + Chai) — 42 tests
npx tsc --noEmit      # Typecheck
npm run lint          # ESLint
```

CI (`.github/workflows/ci.yml`) runs typecheck + unit tests + contract tests on Node 20 and 22 on **every push** to any branch, every pull request, and via manual dispatch. The unit-test run includes **schema drift guards** that keep the app, the migrations, and the standalone setup scripts in sync:

* `src/lib/__tests__/nexus-jobs-schema.test.ts` — fails if the app uses a `nexus_jobs` column that isn't declared and patched in `003_nexus_jobs.sql`, and if `nexus_jobs_schema.sql` drifts from the migration (columns, ALTER patches, RLS policies, cache reload).
* `src/lib/__tests__/standalone-schema-sync.test.ts` — fails if any standalone script (`teams`, `jobs`, `treasury_transactions`, `agent_actions`) drifts from migrations `001`/`002` (columns, RLS policies, indexes, cache reload, plus the treasury insert policy and agents seed).

Both suites share their SQL-parsing helpers in `src/lib/__tests__/sql-drift-helpers.ts`.

---

## 🔗 Smart Contracts

* **`contracts/NexusGuardEscrow.sol`** — V1 escrow: fund a job, validate deliverables, release USDC.
* **`contracts/NexusGuardEscrowV2.sol`** — V2 escrow: milestone-based payouts (`createJob` with milestone percentages), on-chain disputes, and `claimRefundAfterDeadline` for unreleased funds after the deadline passes.
* Deploy with `npx hardhat run scripts/deploy_v2.js --network arc_testnet` — the deployed address is saved to `contract-address.txt` and mirrored in `src/lib/constants.ts` (`ESCROW_V2_ADDRESS`).
* Explorer: [testnet.arcscan.app](https://testnet.arcscan.app)

---

## 🏆 Built for Programmable Money Hackathon

This project was built specifically for the **Programmable Money Hackathon by Arc & Encode Club**. We strictly adhered to the core philosophy: *"Quality of execution over complexity"* and *"Real use case with a path to production."*

**Track 2: Agentic Economy**
* Demonstrates AI agents that hold wallets.
* Shows autonomous USDC settlement without a human in the loop.
* Implements concepts of ERC-8004 (Agent Identity) and ERC-8183 (Programmable Job Contracts).
