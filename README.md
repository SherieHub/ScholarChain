# ScholarChain

A decentralized scholarship tracking system built on the **Cardano blockchain**. ScholarChain replaces opaque, centralized scholarship disbursement with a fully verifiable, tamper-proof system where every payment, credential, and reward is recorded on-chain and publicly auditable.

---

## Overview

ScholarChain is a web application that connects students, sponsors, and administrators through a shared blockchain ledger. The system is built in five increments, each adding a distinct layer of functionality:

| Increment | Name | What It Does |
|---|---|---|
| 1 | The Plumbing | Admin connects a Cardano wallet and sends ADA scholarships with a verifiable TxHash |
| 2 | The Dual Registry | Firebase-backed scholar applications and sponsor pledges; Admin dashboard with a live scholar table |
| 3 | The Digital Badge | Each approved scholar receives a unique NFT (Scholar ID) minted on Cardano and stored via IPFS |
| 4 | The Incentive Engine | Scholars earn fungible SCHOLAR tokens for academic achievements; Admin approves and dispatches rewards |
| 5 | The Glass House | A public transparency dashboard showing live treasury balance vs. sponsor pledges with full transaction history |

### Key Features

- **Wallet-based authentication** — Admin access is gated by cryptographic wallet ownership, not a username/password
- **NFT-gated Scholar Portal** — Students prove enrollment by holding their Scholar ID NFT
- **On-chain payment proofs** — Every scholarship disbursement produces a third-party-verifiable TxHash on Cardanoscan
- **Public transparency** — Anyone can verify the Admin treasury balance against total sponsor pledges in real time
- **No smart contracts required** — All fund movement uses Cardano's native multi-asset UTxO model via MeshJS

---

## Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| Next.js | 16.x | Full-stack React framework; App Router, API routes (BFF pattern) |
| React | 19.x | Component model and state management |
| TypeScript | 5.x | Static typing across all components, hooks, and data models |
| TailwindCSS | 4.x | Utility-first styling |

### Web3 / Blockchain SDK
| Technology | Role |
|---|---|
| MeshJS `@meshsdk/core` | Cardano transaction builder — constructs, signs, and submits UTxO transactions |
| MeshJS `@meshsdk/react` | React hooks and pre-built components (`<CardanoWallet />`, `MeshProvider`) |
| MeshJS ForgeScript | Policy ID generation and NFT/fungible token minting |

### Blockchain Network
| Technology | Role |
|---|---|
| Cardano Preprod Testnet | Development and testing network (free test ADA via the Cardano Faucet) |
| Cardano Mainnet | Production deployment target |
| Eternl / Nami | Browser wallet extensions for signing and submitting transactions |

### Off-Chain & Storage
| Technology | Role |
|---|---|
| Firebase Firestore | NoSQL document store for scholar applications, sponsor pledges, and reward statuses |
| Blockfrost.io | REST API for querying live wallet balances and transaction histories without running a full node |
| IPFS / Pinata | Decentralized storage for Scholar Badge NFT images |

---

## Project Structure

```
ScholarChain/
├── frontend_scholarchain/      # Main Next.js application
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── apply/              # Public scholar application form
│   │   ├── sponsor-entry/      # Public sponsor pledge form
│   │   ├── admin/              # Admin dashboard (wallet-gated)
│   │   │   ├── mint/           # Mint Scholar ID NFT
│   │   │   └── treasury/       # Treasury management + token minting
│   │   ├── scholar-portal/     # NFT-gated student portal
│   │   ├── transparency/       # Public Glass House dashboard
│   │   └── api/                # Server-side BFF routes (Blockfrost)
│   ├── components/             # Reusable React components
│   ├── lib/                    # Core logic: MeshJS, Firebase, Blockfrost wrappers
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # Shared TypeScript interfaces
├── md_files/                   # Architecture docs, diagrams, increment specs
└── scholar-chain/              # Scaffold / reference project
```

---

## Setup

### Prerequisites

- **Node.js** 18 or later
- **npm** or **yarn**
- A Chromium-based browser (Chrome or Brave)
- The **[Eternl](https://eternl.io)** or **[Nami](https://namiwallet.io)** browser wallet extension installed
- Your wallet set to the **Preprod Testnet** network (Eternl: Settings → Network → Preprod)
- Test ADA from the [Cardano Preprod Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet) (needed only for the Admin wallet)

### 1. Clone the repository

```bash
git clone https://github.com/SherieHub/ScholarChain.git
cd ScholarChain/frontend_scholarchain
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and populate the following:

```bash
# Firebase — get these from Firebase Console → Project Settings → Your Apps → Web config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Blockfrost — server-side only, never use NEXT_PUBLIC prefix here
# BLOCKFROST_PROJECT_ID=
# ADMIN_WALLET_ADDRESS=
```

> Firebase credentials are required from Increment 2 onward. Increment 1 (wallet connection + ADA transfer) works with an empty `.env.local`.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Connect your wallet

Click **Connect Wallet** in the header, select Eternl or Nami, and approve the connection. The Admin wallet must hold test ADA on Preprod to send scholarship payments.

---

## Available Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/apply` | Public | Scholar application form |
| `/sponsor-entry` | Public | Sponsor pledge submission form |
| `/admin` | Wallet-gated | Admin dashboard with scholar table and Send ADA |
| `/admin/mint` | Wallet-gated | Mint Scholar ID NFTs |
| `/admin/treasury` | Wallet-gated | Mint and manage SCHOLAR tokens |
| `/scholar-portal` | NFT-gated | Student portal (requires Scholar ID NFT) |
| `/transparency` | Public | Live treasury vs. pledge Glass House dashboard |

---

## Team

| Name |
|---|
| Shervin Dale Tabernero |
| Austine John Lomocso |
| Sherielyn Guadiana |
| Christian Luis Fernandez |
| Jamiel Kyne Pinca |

---

## Useful Links

- [Cardano Preprod Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet)
- [Preprod Block Explorer (Cardanoscan)](https://preprod.cardanoscan.io)
- [MeshJS Documentation](https://meshjs.dev)
- [Firebase Console](https://console.firebase.google.com)
- [Blockfrost Dashboard](https://blockfrost.io)
