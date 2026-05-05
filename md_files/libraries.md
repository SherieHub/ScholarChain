# ScholarChain — Libraries & npm Packages

> A complete reference of all npm packages required to build ScholarChain, grouped by category, with installation commands and the increment in which each package is first needed.

---

## Installation by Increment

### Increment 1 — Bootstrap the Project

```bash
# Initialize a Next.js app with TypeScript and TailwindCSS
npx create-next-app@latest scholar-chain --typescript --tailwind --eslint --app

cd scholar-chain

# MeshJS — Cardano Web3 SDK
npm install @meshsdk/core @meshsdk/react
```

### Increment 2 — Firebase Integration

```bash
# Firebase SDK
npm install firebase
```

### Increment 5 — Blockfrost API Client

```bash
# Blockfrost Node.js SDK (used server-side in Next.js API routes)
npm install @blockfrost/blockfrost-js
```

---

## Full Package Reference

### Core Framework

| Package | Version (min) | Purpose | Increment |
|---|---|---|---|
| `next` | 14.x | Full-stack React framework with file routing and API routes | 1 |
| `react` | 18.x | UI component library | 1 |
| `react-dom` | 18.x | React DOM renderer | 1 |
| `typescript` | 5.x | Static type checking | 1 |

### Styling

| Package | Version (min) | Purpose | Increment |
|---|---|---|---|
| `tailwindcss` | 3.x | Utility-first CSS framework | 1 |
| `postcss` | 8.x | CSS transformation pipeline (required by Tailwind) | 1 |
| `autoprefixer` | 10.x | Vendor prefix automation (required by Tailwind) | 1 |

> **Optional UI Component Libraries** (pick one if desired):
> - `@shadcn/ui` — Copy-paste accessible Tailwind components
> - `@headlessui/react` — Unstyled, accessible UI primitives
> - `lucide-react` — Icon set compatible with React/Tailwind

### Web3 / Cardano SDK

| Package | Version (min) | Purpose | Increment |
|---|---|---|---|
| `@meshsdk/core` | 1.7.x+ | Core Cardano transaction builder, ForgeScript, asset utilities | 1 |
| `@meshsdk/react` | 1.7.x+ | `MeshProvider`, `<CardanoWallet />` component, React hooks | 1 |

> **Key MeshJS APIs used in ScholarChain:**
> 
> | API / Class | Used For | Increment |
> |---|---|---|
> | `MeshProvider` | Wraps app to provide wallet context | 1 |
> | `<CardanoWallet />` | Pre-built wallet connect button | 1 |
> | `useWallet()` | Hook to access connected wallet state | 1 |
> | `Transaction` | Build ADA transfer transactions | 1 |
> | `Transaction.sendLovelace()` | Send ADA (in Lovelaces) to recipient | 1 |
> | `Transaction.sendAssets()` | Send multi-asset (ADA + tokens) | 4 |
> | `ForgeScript.withOneSignature()` | Generate minting policy | 3 |
> | `Transaction.mintAsset()` | Mint NFTs and fungible tokens | 3, 4 |
> | `wallet.getAssets()` | Scan wallet for owned NFTs/tokens | 3 |
> | `wallet.signTx()` | Request cryptographic signature from Admin | 1+ |
> | `wallet.submitTx()` | Submit signed transaction to network | 1+ |

### Off-Chain Database

| Package | Version (min) | Purpose | Increment |
|---|---|---|---|
| `firebase` | 10.x | Firebase SDK: Firestore, App initialization | 2 |

> **Key Firebase APIs used:**
>
> | API | Used For | Increment |
> |---|---|---|
> | `initializeApp()` | Bootstrap Firebase connection | 2 |
> | `getFirestore()` | Get Firestore database instance | 2 |
> | `collection()` | Reference a Firestore collection | 2 |
> | `addDoc()` | Add new Scholar/Sponsor document | 2 |
> | `getDocs()` | Fetch collection documents (Admin dashboard) | 2 |
> | `query() + where()` | Filter Scholars by `status === "Approved"` | 2 |
> | `updateDoc()` | Update Scholar status, add TxHash / RewardStatus | 2, 4 |

### Blockchain Data API

| Package | Version (min) | Purpose | Increment |
|---|---|---|---|
| `@blockfrost/blockfrost-js` | 5.x | Server-side Cardano blockchain querying | 5 |

> **Key Blockfrost API calls used:**
>
> | Method | Used For | Increment |
> |---|---|---|
> | `BlockFrostAPI.addresses(addr)` | Fetch live ADA balance of Admin wallet | 5 |
> | `BlockFrostAPI.addressesTransactions(addr)` | Fetch full transaction history | 5 |

### Development Dependencies

| Package | Purpose |
|---|---|
| `eslint` | Code linting |
| `eslint-config-next` | Next.js ESLint ruleset |
| `@types/react` | TypeScript types for React |
| `@types/node` | TypeScript types for Node.js |

---

## `package.json` Scripts Reference

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## Environment Variables Required

Create a `.env.local` file in the project root:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Blockfrost (server-side ONLY — no NEXT_PUBLIC_ prefix)
BLOCKFROST_PROJECT_ID=preprod_your_blockfrost_key

# Admin Wallet Address (used for Blockfrost treasury queries)
ADMIN_WALLET_ADDRESS=addr_test1...
```

> ⚠️ **Security:** `BLOCKFROST_PROJECT_ID` must **never** use the `NEXT_PUBLIC_` prefix. It must only be accessed inside `/app/api/` route handlers (server-side), never in client components.
