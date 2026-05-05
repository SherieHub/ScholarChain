# ScholarChain — Tech Stack

> The complete, layered technology stack for the ScholarChain Decentralized Scholarship Tracking System, organized by concern and mapped to the increment in which each technology is introduced.

---

## Stack Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                               │
│              React / Next.js (TypeScript)  +  TailwindCSS           │
├─────────────────────────────────────────────────────────────────────┤
│                       WEB3 INTEGRATION LAYER                        │
│                    MeshJS  (@meshsdk/core + @meshsdk/react)         │
├──────────────────────────┬──────────────────────────────────────────┤
│    OFF-CHAIN BACKEND     │         BLOCKCHAIN READ LAYER            │
│   Firebase Firestore     │     Blockfrost API (@blockfrost/js)      │
├──────────────────────────┴──────────────────────────────────────────┤
│                     CARDANO BLOCKCHAIN                              │
│                  Preprod Testnet (development)                      │
│                  Mainnet (production target)                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Frontend Framework

| Technology | Role | Introduced |
|---|---|---|
| **Next.js 14+** | Full-stack React framework; provides file-based routing, API routes (for BFF pattern), and SSR/SSG capabilities | Increment 1 |
| **React 18** | Component model, state management (`useState`, `useEffect`), UI rendering | Increment 1 |
| **TypeScript** | Static typing across all components, data models, and API calls | All increments |
| **TailwindCSS** | Utility-first styling; responsive layout for Admin Dashboard, Scholar Portal, and Transparency Page | All increments |

---

## Layer 2: Web3 / Blockchain SDK

| Technology | Role | Introduced |
|---|---|---|
| **MeshJS (`@meshsdk/core`)** | Core Cardano transaction builder: constructs, signs, and submits UTxO transactions | Increment 1 |
| **MeshJS (`@meshsdk/react`)** | React-specific hooks and pre-built components (`<CardanoWallet />`, `MeshProvider`) for wallet connection | Increment 1 |
| **MeshJS ForgeScript** | Policy ID generation and NFT/token minting scripts | Increment 3 |
| **MeshJS `wallet.getAssets()`** | Asset scanning — used to verify NFT ownership for Scholar Portal authentication | Increment 3 |
| **MeshJS `sendAssets()`** | Multi-asset transaction dispatch (ADA + SCHOLAR tokens in one tx) | Increment 4 |

---

## Layer 3: Blockchain Network

| Technology | Role | Introduced |
|---|---|---|
| **Cardano Preprod Testnet** | Development network for all testing; free test ADA available via Cardano Faucet | Increment 1 |
| **Cardano Mainnet** | Production deployment target (outside project scope but architectural target) | — |
| **Cardano Faucet** | Source of free test ADA for funding the Admin wallet on Preprod | Increment 1 |

---

## Layer 4: Wallet Infrastructure (Browser Extensions)

| Technology | Role | Introduced |
|---|---|---|
| **Eternl** (recommended) | Browser wallet extension; handles key storage, signing, and Preprod switching | Increment 1 |
| **Nami** (alternative) | Lightweight browser wallet extension for Cardano; compatible with MeshJS | Increment 1 |

---

## Layer 5: Off-Chain Database

| Technology | Role | Introduced |
|---|---|---|
| **Firebase Firestore** | NoSQL document database; stores Scholar applications, Sponsor pledges, and reward statuses | Increment 2 |
| **Firebase SDK (`firebase/app`, `firebase/firestore`)** | Client-side SDK for CRUD operations against Firestore | Increment 2 |

> **Why Firestore?** It requires zero backend server management, integrates natively with React via real-time listeners, and allows rapid collection setup without schema migrations — ideal for an MVP agile build.

---

## Layer 6: Blockchain Data API (Read Layer)

| Technology | Role | Introduced |
|---|---|---|
| **Blockfrost.io** | REST API service that indexes the Cardano blockchain; used to query wallet balances and transaction histories without running a full node | Increment 5 |
| **`@blockfrost/blockfrost-js`** | Official Node.js SDK for Blockfrost; called from Next.js API routes (server-side) to keep the API key secret | Increment 5 |

---

## Layer 7: Decentralized File Storage

| Technology | Role | Introduced |
|---|---|---|
| **IPFS (InterPlanetary File System)** | Decentralized storage for Scholar Badge NFT images | Increment 3 |
| **Pinata** | Free IPFS pinning service; used to upload and persistently host the badge image | Increment 3 |

---

## Layer 8: Development Tooling

| Technology | Role |
|---|---|
| **Node.js 18+** | JavaScript runtime for Next.js development server and build tooling |
| **npm / yarn** | Package management |
| **ESLint** | Code quality linting |
| **Prettier** | Code formatting |
| **`.env.local`** | Secrets management for Firebase config and Blockfrost Project ID |

---

## Increment-to-Technology Mapping Summary

| Increment | New Technologies Introduced |
|---|---|
| **1 — The Plumbing** | Next.js, React, TypeScript, TailwindCSS, MeshJS (core + react), Cardano Preprod, Eternl/Nami |
| **2 — The Dual Registry** | Firebase Firestore, Firebase SDK |
| **3 — The Digital Badge** | MeshJS ForgeScript, IPFS, Pinata, MeshJS `getAssets()`, CIP-25 Metadata |
| **4 — The Incentive Engine** | MeshJS `sendAssets()`, Fungible Token Policy |
| **5 — The Glass House** | Blockfrost.io, `@blockfrost/blockfrost-js`, Next.js API Routes (BFF) |
