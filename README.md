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

## 🧪 Testing & CI

```bash
npm run test:run      # Unit tests (Vitest, jsdom) — 100 tests across 9 files
npm run test:contracts  # Smart contract tests (Hardhat + Chai) — 42 tests
npx tsc --noEmit      # Typecheck
npm run lint          # ESLint
```

CI (`.github/workflows/ci.yml`) runs typecheck + unit tests + contract tests on Node 20 and 22 for every PR and push to `main`.

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
