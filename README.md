# 🛡️ NexusGuard Agentic Network

[![Arc Hackathon](https://img.shields.io/badge/Arc%20Hackathon-Track%202:%20Agentic%20Economy-d4af37.svg?style=for-the-badge)](https://www.encodeclub.com/programmes/arc-hackathon)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Circle](https://img.shields.io/badge/Powered%20by-Circle%20Tools-blue.svg?style=for-the-badge)](https://developers.circle.com/)

**NexusGuard** is a fully autonomous network built for the **Agentic Economy**. It replaces traditional human-in-the-loop workflows with a decentralized network of specialized AI Agents. These agents hold their own developer-controlled wallets, autonomously validate job deliverables, and instantly settle payments via USDC micro-transactions without requiring any human approval.

🌐 **Live Demo:** [https://nexusguard-beta-psi.vercel.app](https://nexusguard-beta-psi.vercel.app)

---

## 🎯 The Problem
In traditional B2B software development and freelance platforms, the escrow and validation process is slow, heavily reliant on human trust, and plagued by intermediary fees. Companies wait days for wire transfers, and developers wait weeks for PRs to be manually reviewed and paid out.

## 💡 The Solution
NexusGuard removes the human bottleneck by deploying specialized AI Agents on the Arc Blockchain:
1. **AI Escrow Agent (ERC-8183):** Programmatically analyzes GitHub PRs and UI deployments. Upon successful code and visual validation, it autonomously signs transactions and settles payments in USDC.
2. **AI Treasury Agent:** Autonomously monitors liquidity and manages yield generation in DeFi pools.
3. **M2M Nanopayments:** Agents pay each other instantly for sub-services (e.g., Risk Analysis, Security Scans) using Arc's ultra-low gas fee architecture.

---

## 🚀 Key Features

* **🤖 Autonomous Escrow & Settlement:** Watch the AI Validator node review code delivery and instantly release USDC funds to the developer's wallet.
* **💸 M2M Economy Ledger:** A live dashboard showing sub-cent nanopayments between different AI nodes (Validator, Guardian, Strategy) happening in real-time.
* **🏦 AI Treasury Management:** Autonomous rebalancing of DAO funds to maximize yield based on real-time APY metrics.
* **🧾 B2B Compliance Ready:** Automated tax scanning and invoice generation to ensure enterprise-grade compliance.
* **👻 Invisible Blockchain UX:** Email-based onboarding and seamless gasless experiences. Users see a clean, cyberpunk dashboard—not hex strings or gas fee popups.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, TailwindCSS, Framer Motion for terminal animations.
* **Blockchain/Infrastructure:** Arc L1 Testnet (USDC/EURC).
* **Circle Developer Platform:** 
  * Developer-Controlled Wallets (For AI Agents).
  * Circle App Kit & Contract Platform.
  * Nanopayments Architecture.

---

## 💻 Getting Started (Local Development)

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn

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

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🏆 Built for Programmable Money Hackathon
This project was built specifically for the **Programmable Money Hackathon by Arc & Encode Club**. We strictly adhered to the core philosophy: *"Quality of execution over complexity"* and *"Real use case with a path to production."*

**Track 2: Agentic Economy**
* Demonstrates AI agents that hold wallets.
* Shows autonomous USDC settlement without a human in the loop.
* Implements concepts of ERC-8004 (Agent Identity) and ERC-8183 (Programmable Job Contracts).
