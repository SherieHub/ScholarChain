# ScholarChain

A blockchain-powered scholarship management DApp built on the Cardano Preprod testnet. Scholars receive NFT badges as proof of identity, scholarship disbursements are sent as on-chain tADA transactions, and academic achievements are tracked on-chain — all verifiable via Cardanoscan.

---

## What it does

| Role | Capabilities |
|---|---|
| **Admin** | Mint Scholar Badge NFTs, approve/send semester scholarships (tADA), review achievement submissions, send SCHOLAR token rewards, manage treasury |
| **Scholar** | Connect wallet, verify NFT badge, view scholarship status, re-enroll each semester, submit achievements and proof documents |
| **Sponsor** | Register a pledge and view treasury transparency data |
| **Public** | View live on-chain treasury balance, transaction history, and sponsor contributions — no wallet required |

---

## Tech stack

- **Frontend** — Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Blockchain** — Cardano Preprod testnet via [MeshJS](https://meshjs.dev/) (CIP-30 wallet integration)
- **Database** — Firebase Firestore (scholar records, scholarship status, achievements)
- **Chain queries** — Blockfrost API (transaction history, treasury balance)
- **NFT minting** — On-chain via MeshJS `ForgeScript` (no centralised minting service)

---

## Prerequisites

- Node.js 18+
- A Cardano **Preprod** wallet extension — [Eternl](https://eternl.io/) or [Nami](https://namiwallet.io/)
- A [Firebase](https://console.firebase.google.com/) project with Firestore enabled
- A [Blockfrost](https://blockfrost.io/) account with a **Preprod** project ID

---

## Local setup

### 1. Install dependencies

```bash
cd frontend_scholarchain
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Firebase — from Firebase Console → Project Settings → Your Apps → Web app config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Blockfrost (server-side only — never use NEXT_PUBLIC_ prefix)
# Create a Preprod project at https://blockfrost.io
BLOCKFROST_PROJECT_ID=preprod...

# Admin wallet receiving address (addr_test1...)
ADMIN_WALLET_ADDRESS=addr_test1...
```

> `.env.local` is in `.gitignore` and must never be committed.

### 3. Firebase setup

1. Create a Firestore database (test mode is fine for development).
2. Create the config document at path `config/config` with these fields:

```json
{
  "adminWalletAddresses": ["addr_test1..."],
  "badgeIPFSUri": "ipfs://Qm...",
  "nftPolicyId": "",
  "tokenPolicyId": "",
  "scholarTokenTotalSupply": 0
}
```

3. Deploy Firestore security rules from the repo root:

```bash
firebase deploy --only firestore:rules
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Wallet & network setup

- All transactions use **Cardano Preprod** (testnet). No real ADA is spent.
- Get free testnet tADA from the [Cardano Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/).
- Switch your wallet extension to the **Preprod** network before connecting.
- The admin wallet address must match an entry in `config/config → adminWalletAddresses` in Firestore.

---

## Firestore collections

| Collection | Purpose |
|---|---|
| `config/config` | University config (admin wallets, NFT policy ID, token policy ID, badge IPFS URI) |
| `scholars` | Scholar applications and status (Pending / Approved / Rejected) |
| `scholarships` | Per-semester enrollment records and stipend payment status |
| `scholarAchievements` | Achievements submitted by scholars (competition, certification, etc.) |
| `sponsors` | Sponsor pledge records |

---

## Project structure

```
frontend_scholarchain/
├── app/                  # Next.js App Router pages
│   ├── admin/            # Admin dashboard
│   ├── apply/            # Scholar application form
│   ├── scholar-portal/   # Scholar NFT verification + profile
│   ├── sponsor-entry/    # Sponsor pledge registration
│   ├── transparency/     # Public on-chain treasury view
│   └── api/              # Server-side routes (Blockfrost proxy, tx submit)
├── components/
│   ├── achievements/     # Scholar achievement submission & display
│   ├── dashboard/        # Admin and scholar dashboard panels
│   ├── forms/            # Application, enrollment, and reward forms
│   └── wallet/           # Wallet gate and connection components
├── hooks/                # Custom React hooks
├── lib/
│   ├── blockfrost/       # Blockfrost API client
│   ├── firebase/         # Firestore CRUD helpers
│   └── mesh/             # MeshJS transaction builders (mint NFT, send ADA, send tokens)
└── types/                # Shared TypeScript interfaces
```

---

## Build for production

```bash
npm run build
npm start
```

---

## Notes

- The project uses **webpack** (not Turbopack) because the Cardano cryptography libraries (libsodium, sidan-csl-rs) require WebAssembly support that Turbopack does not yet provide.
- Scholar Badge NFTs use `ForgeScript.withOneSignature(changeAddress)` — each mint produces a policy ID unique to the admin's change address at the time of minting.
- Firestore rules live at `../firestore.rules` (repo root) and must be deployed via the Firebase CLI, not through the Firebase Console editor.
