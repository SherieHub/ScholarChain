# ScholarChain — JSON / NoSQL Schema Definitions

> Complete Firestore document schema definitions for all collections, with TypeScript interfaces and annotated JSON examples. Reflects the full data model across Increments 2–5.

---

## Collection: `scholars`

### TypeScript Interface

```typescript
// types/scholar.ts

export type ScholarStatus = "PENDING" | "APPROVED" | "REJECTED";
export type RewardStatus = "PENDING_REVIEW" | "APPROVED" | "PAID";

export interface Achievement {
  subject: string;
  grade: string;
  proofLink: string;
  rewardStatus: RewardStatus;
  adaRewarded?: number;          // Set when Admin approves reward
  tokensRewarded?: number;       // Set when Admin approves reward
  rewardTxHash?: string;         // Set when reward transaction confirmed
  submittedAt: Date;
  paidAt?: Date;
}

export interface Scholar {
  id?: string;                   // Firestore auto-generated document ID
  name: string;                  // Full legal name
  course: string;                // Degree program (e.g., "BS Computer Science")
  walletAddress: string;         // Cardano Preprod wallet address
  status: ScholarStatus;         // Application lifecycle state
  policyId?: string;             // University NFT Policy ID [assigned on mint, Inc 3]
  scholarTokenId?: string;       // Unique asset name of the Scholar Badge NFT [Inc 3]
  lastPaidTxHash?: string;       // TxHash of most recent ADA scholarship payment [Inc 2]
  achievement?: Achievement;     // Current semester academic achievement [Inc 4]
  createdAt: Date;               // Application submission date
  updatedAt: Date;               // Last modification date
}
```

### Firestore JSON Document Example

```json
{
  "id": "FSTORE_AUTO_ID_001",
  "name": "Jane Dela Cruz",
  "course": "BS Computer Science",
  "walletAddress": "addr_test1qpzk5gh7r2ltn4gxlmhv3k6p3tys8lk24e0jflqwxnp9mfc5g...",
  "status": "APPROVED",
  "policyId": "d9312da562da182b52e166f5e2afa03b1c60f5d966d1fb49f4e37e2",
  "scholarTokenId": "ScholarBadge_JaneDelacruz_001",
  "lastPaidTxHash": "a5b8f2c3d4e6a7b8f2c3d4e6a7b8f2c3d4e6a7b8f2c3d4e6a7b8f2c3d4e6a7b8",
  "achievement": {
    "subject": "Data Structures and Algorithms",
    "grade": "A+",
    "proofLink": "https://drive.google.com/file/d/abc123/view",
    "rewardStatus": "PAID",
    "adaRewarded": 50,
    "tokensRewarded": 200,
    "rewardTxHash": "b6c9g3d4e7b6c9g3d4e7b6c9g3d4e7b6c9g3d4e7b6c9g3d4e7b6c9g3d4e7b6c9",
    "submittedAt": "2025-06-15T08:30:00.000Z",
    "paidAt": "2025-06-16T14:22:00.000Z"
  },
  "createdAt": "2025-06-01T09:00:00.000Z",
  "updatedAt": "2025-06-16T14:22:00.000Z"
}
```

### Field Lifecycle Notes

| Field | Set At | Set By | Increment |
|---|---|---|---|
| `name`, `course`, `walletAddress` | Application submission | Student | 2 |
| `status: "PENDING"` | Application submission | System | 2 |
| `lastPaidTxHash` | ADA scholarship sent | System (post-tx) | 2 |
| `status: "APPROVED"`, `policyId`, `scholarTokenId` | NFT minted | System (post-tx) | 3 |
| `achievement` (embedded doc) | Grade submitted by student | Student | 4 |
| `achievement.rewardStatus: "PAID"`, `rewardTxHash` | Reward transaction confirmed | System (post-tx) | 4 |

---

## Collection: `sponsors`

### TypeScript Interface

```typescript
// types/sponsor.ts

export interface Sponsor {
  id?: string;          // Firestore auto-generated document ID
  sponsorName: string;  // Sponsoring organization or individual's name
  pledgedAmount: number; // Total ADA pledged (human-readable, not Lovelaces)
  createdAt: Date;      // Pledge submission timestamp
}
```

### Firestore JSON Document Example

```json
{
  "id": "FSTORE_AUTO_ID_S01",
  "sponsorName": "Cebu Tech Foundation",
  "pledgedAmount": 10000,
  "createdAt": "2025-05-15T10:00:00.000Z"
}
```

---

## Collection: `transaction_log`

### TypeScript Interface

```typescript
// types/transaction.ts

export type TransactionType =
  | "ADA_SCHOLARSHIP"
  | "NFT_MINT_AND_SEND"
  | "TOKEN_MINT"
  | "MULTI_ASSET_REWARD";

export interface TransactionRecord {
  id?: string;
  txHash: string;
  scholarId: string;
  recipientAddress: string;
  adaAmount: number;             // Human-readable ADA (e.g., 50)
  lovelaceAmount: number;        // Raw value sent on-chain (e.g., 50000000)
  tokenAmount?: number;          // SCHOLAR tokens included (0 for ADA-only)
  tokenPolicyId?: string;        // SCHOLAR token policy (if tokens included)
  transactionType: TransactionType;
  issuedAt: Date;
}
```

### Firestore JSON Document Example

```json
{
  "id": "FSTORE_AUTO_ID_TX01",
  "txHash": "a5b8f2c3d4e6a7b8f2c3d4e6a7b8f2c3d4e6a7b8f2c3d4e6a7b8f2c3d4e6a7b8",
  "scholarId": "FSTORE_AUTO_ID_001",
  "recipientAddress": "addr_test1qpzk5gh7r2ltn4gxlmhv3k6p3tys8lk24e0jflqwxnp9mfc5g...",
  "adaAmount": 50,
  "lovelaceAmount": 50000000,
  "tokenAmount": 200,
  "tokenPolicyId": "f3a7b1c2d5e8f3a7b1c2d5e8f3a7b1c2d5e8f3a7b1c2d5e8f3a7b1c2d5e8",
  "transactionType": "MULTI_ASSET_REWARD",
  "issuedAt": "2025-06-16T14:22:00.000Z"
}
```

---

## Collection: `config` (Singleton)

### TypeScript Interface

```typescript
// types/config.ts

export interface UniversityConfig {
  nftPolicyId: string;           // Scholar Badge NFT Policy ID [Inc 3]
  tokenPolicyId: string;         // SCHOLAR reward token Policy ID [Inc 4]
  adminWalletAddress: string;    // Admin treasury wallet (used by Blockfrost) [Inc 5]
  badgeIPFSUri: string;          // IPFS URI of the Scholar Badge image [Inc 3]
  scholarTokenTotalSupply: number; // Total SCHOLAR tokens minted [Inc 4]
  lastUpdated: Date;
}
```

### Firestore JSON Document Example

```json
{
  "id": "config",
  "nftPolicyId": "d9312da562da182b52e166f5e2afa03b1c60f5d966d1fb49f4e37e2",
  "tokenPolicyId": "f3a7b1c2d5e8f3a7b1c2d5e8f3a7b1c2d5e8f3a7b1c2d5e8f3a7b1c2d5e8",
  "adminWalletAddress": "addr_test1vp2fg770ddmqxxduasjej8z7pf6p2h5mw56v5d6txskq9uzj5n",
  "badgeIPFSUri": "ipfs://QmXyZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  "scholarTokenTotalSupply": 100000,
  "lastUpdated": "2025-06-01T09:00:00.000Z"
}
```

---

## CIP-25 NFT Metadata Schema (On-Chain)

> This is not stored in Firestore — it is embedded directly in the Cardano blockchain transaction at mint time per the [CIP-25 standard](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0025).

```typescript
// types/nft.ts

export interface CIP25Metadata {
  "721": {
    [policyId: string]: {
      [assetName: string]: {
        name: string;         // "ScholarChain Badge - Jane Dela Cruz"
        image: string;        // "ipfs://QmXyZ..."
        mediaType: string;    // "image/png"
        description: string;  // "Official Scholar ID for BS Computer Science"
        scholar: string;      // Full scholar name
        course: string;       // Enrolled program
        issuer: string;       // "ScholarChain University"
        issuedAt: string;     // ISO 8601 date string
      };
    };
    version: number;          // CIP-25 version: 1
  };
}
```

### CIP-25 JSON Object Example

```json
{
  "721": {
    "d9312da562da182b52e166f5e2afa03b1c60f5d966d1fb49f4e37e2": {
      "ScholarBadge_JaneDelacruz_001": {
        "name": "ScholarChain Badge - Jane Dela Cruz",
        "image": "ipfs://QmXyZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
        "mediaType": "image/png",
        "description": "Official Scholar ID for BS Computer Science",
        "scholar": "Jane Dela Cruz",
        "course": "BS Computer Science",
        "issuer": "ScholarChain University",
        "issuedAt": "2025-06-15"
      }
    },
    "version": 1
  }
}
```

---

## Firestore Security Rules (Development Reference)

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Scholars: anyone can create (apply), only authenticated can update
    match /scholars/{scholarId} {
      allow read: true;           // Admin dashboard and portal can read
      allow create: true;         // Students submit applications publicly
      allow update: if request.auth != null;  // Tighten in production
      allow delete: if false;
    }

    // Sponsors: anyone can create, read is public (for Transparency Dashboard)
    match /sponsors/{sponsorId} {
      allow read: true;
      allow create: true;
      allow update, delete: if false;
    }

    // Transaction log: server writes only in production
    match /transaction_log/{txId} {
      allow read: true;
      allow write: if request.auth != null;
    }

    // Config: read-only for clients
    match /config/{configId} {
      allow read: true;
      allow write: if false;  // Set manually via Firebase Console
    }
  }
}
```
