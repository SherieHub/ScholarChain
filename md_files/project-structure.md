# ScholarChain — Project Structure

> A comprehensive directory and file tree for the ScholarChain Next.js application implementing all five increments. The structure follows the Next.js 14 App Router convention. Comments indicate the increment and role of each file.

---

```
scholar-chain/
│
├── .env.local                          # All secrets (Firebase, Blockfrost, Admin wallet)
├── .eslintrc.json                      # ESLint configuration
├── .gitignore                          # Git ignore (node_modules, .env.local, .next)
├── next.config.js                      # Next.js configuration
├── package.json                        # npm dependencies and scripts
├── tailwind.config.ts                  # TailwindCSS configuration
├── tsconfig.json                       # TypeScript compiler options
│
├── public/                             # Static assets served at root
│   ├── badge-template.png             # Scholar Badge image (uploaded to IPFS) [Inc 3]
│   └── logo.svg                        # ScholarChain logo
│
├── app/                                # Next.js 14 App Router root
│   │
│   ├── layout.tsx                      # Root layout — wraps app in MeshProvider [Inc 1]
│   ├── page.tsx                        # Landing page / home route
│   │
│   ├── apply/                          # Public student application route [Inc 2]
│   │   └── page.tsx                    # Scholar Application Form (name, course, wallet)
│   │
│   ├── sponsor-entry/                  # Sponsor pledge submission route [Inc 2]
│   │   └── page.tsx                    # Sponsor Entry Form (name, pledge amount)
│   │
│   ├── admin/                          # Admin-only dashboard routes
│   │   ├── layout.tsx                  # Admin layout — enforces wallet connection [Inc 1]
│   │   ├── page.tsx                    # Main Admin Dashboard — scholar table [Inc 1+2]
│   │   ├── mint/
│   │   │   └── page.tsx               # Mint Scholar ID (NFT) action view [Inc 3]
│   │   └── treasury/
│   │       └── page.tsx               # Treasury management — mint SCHOLAR tokens [Inc 4]
│   │
│   ├── scholar-portal/                 # Gated student portal route [Inc 3]
│   │   └── page.tsx                    # NFT-gated Scholar Portal (wallet login + dashboard)
│   │
│   └── transparency/                   # Public accountability dashboard [Inc 5]
│       └── page.tsx                    # Glass House — pledge vs. live balance + ledger
│
├── components/                         # Reusable React components
│   │
│   ├── layout/
│   │   ├── Header.tsx                  # App header with <CardanoWallet /> button [Inc 1]
│   │   ├── Footer.tsx                  # App footer
│   │   └── Sidebar.tsx                 # Admin sidebar navigation
│   │
│   ├── wallet/
│   │   ├── WalletConnectButton.tsx     # Wrapper around MeshJS <CardanoWallet /> [Inc 1]
│   │   └── WalletStatus.tsx            # Displays connected address and balance [Inc 1]
│   │
│   ├── forms/
│   │   ├── SendScholarshipForm.tsx     # ADA transfer form (address + amount) [Inc 1]
│   │   ├── ScholarApplicationForm.tsx  # Public apply form → Firebase [Inc 2]
│   │   ├── SponsorEntryForm.tsx        # Sponsor pledge form → Firebase [Inc 2]
│   │   ├── AchievementSubmitForm.tsx   # Student grade submission form [Inc 4]
│   │   └── RewardApprovalForm.tsx      # Admin reward amount input form [Inc 4]
│   │
│   ├── dashboard/
│   │   ├── ScholarTable.tsx            # Table of approved scholars + Send button [Inc 2]
│   │   ├── PendingRewardsTable.tsx     # Table of scholars awaiting grade rewards [Inc 4]
│   │   ├── TreasuryMintPanel.tsx       # UI for minting SCHOLAR token supply [Inc 4]
│   │   └── MintNFTButton.tsx           # "Mint Scholar ID" action button [Inc 3]
│   │
│   ├── transparency/
│   │   ├── PledgeVsBalanceCard.tsx     # Side-by-side pledge vs live balance cards [Inc 5]
│   │   ├── LedgerTable.tsx             # Paginated transaction history table [Inc 5]
│   │   └── TxHashLink.tsx              # Clickable TxHash → Cardanoscan link [Inc 1+5]
│   │
│   └── ui/
│       ├── StatusBadge.tsx             # "Approved" / "Pending" / "Paid" badge chip
│       ├── LoadingSpinner.tsx          # Generic loading indicator (mempool wait) [Inc 1]
│       ├── SuccessMessage.tsx          # Success state with TxHash display [Inc 1]
│       └── ErrorMessage.tsx            # Error state for rejected transactions [Inc 1]
│
├── lib/                                # Core logic, SDK wrappers, and utilities
│   │
│   ├── mesh/
│   │   ├── sendAda.ts                  # MeshJS ADA transfer logic [Inc 1]
│   │   ├── mintNFT.ts                  # ForgeScript NFT minting logic [Inc 3]
│   │   ├── mintTokens.ts               # Fungible SCHOLAR token minting logic [Inc 4]
│   │   ├── sendMultiAsset.ts           # Multi-asset (ADA + tokens) send logic [Inc 4]
│   │   └── verifyNFTOwnership.ts       # wallet.getAssets() + Policy ID check [Inc 3]
│   │
│   ├── firebase/
│   │   ├── config.ts                   # Firebase app initialization [Inc 2]
│   │   ├── scholars.ts                 # Firestore CRUD for Scholars collection [Inc 2]
│   │   └── sponsors.ts                 # Firestore CRUD for Sponsors collection [Inc 2]
│   │
│   ├── blockfrost/
│   │   └── client.ts                   # Blockfrost SDK initialization (server-side) [Inc 5]
│   │
│   └── utils/
│       ├── lovelaceConversion.ts       # adaToLovelace() / lovelaceToAda() helpers [Inc 1]
│       ├── addressUtils.ts             # Address masking / shortening for display
│       └── metadataBuilder.ts          # CIP-25 NFT metadata object builder [Inc 3]
│
├── types/                              # TypeScript type/interface definitions
│   ├── scholar.ts                      # Scholar interface [Inc 2]
│   ├── sponsor.ts                      # Sponsor interface [Inc 2]
│   ├── transaction.ts                  # TransactionRecord interface [Inc 5]
│   └── nft.ts                          # NFTMetadata interface (CIP-25) [Inc 3]
│
├── hooks/                              # Custom React hooks
│   ├── useScholarData.ts               # Fetches and returns scholars from Firestore [Inc 2]
│   ├── useSponsorData.ts               # Fetches and sums sponsor pledges [Inc 5]
│   └── useWalletConnection.ts          # Wraps useWallet() from MeshJS with UX state [Inc 1]
│
└── app/api/                            # Next.js API Routes (server-side / BFF pattern)
    ├── treasury/
    │   └── route.ts                    # GET: Fetch live Admin wallet balance via Blockfrost [Inc 5]
    └── transactions/
        └── route.ts                    # GET: Fetch Admin wallet tx history via Blockfrost [Inc 5]
```

---

## Key Architectural Notes

### `app/layout.tsx` — MeshProvider Root Wrapper
All pages that need wallet access must be children of `MeshProvider`. The root layout wraps the entire app so wallet state is globally accessible.

```tsx
// app/layout.tsx
import { MeshProvider } from "@meshsdk/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MeshProvider>
          {children}
        </MeshProvider>
      </body>
    </html>
  );
}
```

### `app/api/` — Server-Side BFF Routes (Increment 5)
All Blockfrost calls live here. The browser never sees the `BLOCKFROST_PROJECT_ID` key.

```
app/api/treasury/route.ts          →  GET /api/treasury
app/api/transactions/route.ts      →  GET /api/transactions
```

### `lib/mesh/` — Transaction Logic Separation
All MeshJS transaction-building functions are extracted into `lib/mesh/` pure functions that accept inputs and return `TxHash | null`. This keeps components clean and logic independently testable.

### `types/` — Shared TypeScript Contracts
All Firestore document shapes are mirrored as TypeScript interfaces in `types/`. This prevents type mismatches between what is written to Firestore and what components expect to receive.
