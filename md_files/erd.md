# ScholarChain — Entity-Relationship Diagram (ERD)

> A Mermaid.js ERD representing the off-chain Firebase Firestore data model used from Increment 2 onward. Relationships reflect how documents and sub-documents are structured in a NoSQL context.

---

```mermaid
erDiagram

    SCHOLAR {
        string id PK "Firestore Auto-ID"
        string name "Scholar's full name"
        string course "Degree / Program enrolled"
        string walletAddress "Cardano Preprod address (addr_test1...)"
        string status "Enum: PENDING | APPROVED | REJECTED"
        string policyId "University NFT Policy ID (set on mint) [Inc 3]"
        string scholarTokenId "Asset name of minted NFT [Inc 3]"
        string lastPaidTxHash "TxHash of most recent ADA scholarship payment [Inc 2]"
        timestamp createdAt "Application submission timestamp"
        timestamp updatedAt "Last status update timestamp"
    }

    ACHIEVEMENT {
        string id PK "Firestore Auto-ID (sub-collection or embedded)"
        string scholarId FK "References SCHOLAR.id"
        string subject "Subject of academic achievement"
        string grade "Grade attained (e.g. A+)"
        string proofLink "URL link to grade proof or screenshot"
        string rewardStatus "Enum: PENDING_REVIEW | APPROVED | PAID"
        number adaRewarded "ADA amount sent as reward (set on approval)"
        number tokensRewarded "SCHOLAR token amount sent (set on approval)"
        string rewardTxHash "On-chain TxHash of reward transaction"
        timestamp submittedAt "When student submitted the achievement"
        timestamp paidAt "When Admin approved and sent reward"
    }

    SPONSOR {
        string id PK "Firestore Auto-ID"
        string sponsorName "Name of institution or individual sponsor"
        number pledgedAmount "ADA pledged (used in Transparency Dashboard)"
        timestamp createdAt "Pledge submission timestamp"
    }

    UNIVERSITY_CONFIG {
        string id PK "Single document: 'config'"
        string nftPolicyId "The official Scholar Badge Policy ID [Inc 3]"
        string tokenPolicyId "The SCHOLAR reward token Policy ID [Inc 4]"
        string adminWalletAddress "Admin treasury wallet address [Inc 5]"
        string badgeIPFSUri "IPFS URI of the Scholar Badge image [Inc 3]"
        number scholarTokenTotalSupply "Total SCHOLAR tokens minted [Inc 4]"
        timestamp lastUpdated "Config last update timestamp"
    }

    TRANSACTION_LOG {
        string id PK "Firestore Auto-ID"
        string txHash "Cardano on-chain TxHash"
        string scholarId FK "References SCHOLAR.id"
        string recipientAddress "Scholar's wallet address at time of tx"
        number adaAmount "ADA sent (human-readable, not Lovelaces)"
        number lovelaceAmount "Raw Lovelace value submitted on-chain"
        number tokenAmount "SCHOLAR tokens sent (0 if ADA only)"
        string transactionType "Enum: ADA_SCHOLARSHIP | NFT_MINT | TOKEN_MINT | MULTI_ASSET_REWARD"
        timestamp issuedAt "Timestamp when tx was submitted"
    }

    %% ─── RELATIONSHIPS ───

    SCHOLAR ||--o{ ACHIEVEMENT : "has achievements"
    SCHOLAR ||--o{ TRANSACTION_LOG : "receives transactions"
    UNIVERSITY_CONFIG ||--o{ SCHOLAR : "governs all scholars"
```

---

## Entity Notes

### `SCHOLAR`
The central entity. Created when a student submits via `/apply` with `status: "PENDING"`. Updated throughout all increments:
- **Increment 2:** `lastPaidTxHash` added after ADA is sent.
- **Increment 3:** `policyId` and `scholarTokenId` added after NFT is minted; `status` flipped to `"APPROVED"`.
- **Increment 4:** Updated via the `ACHIEVEMENT` sub-document when a reward is paid.

### `ACHIEVEMENT`
Can be modeled as either:
- An **embedded sub-document** directly inside the Scholar document (simpler, Firestore-idiomatic for a single achievement per semester).
- A **sub-collection** (`scholars/{id}/achievements/`) if multiple achievements per scholar per year are needed.

The PDF describes one active achievement at a time, so the embedded approach is recommended for the MVP.

### `SPONSOR`
Write-once document. Read in aggregate (sum of `pledgedAmount`) by the Transparency Dashboard in Increment 5. Never linked directly to a specific Scholar — sponsors fund the general treasury pool.

### `UNIVERSITY_CONFIG`
A **singleton document** (single record with a fixed `id = "config"`). Stores system-wide configuration set by the Admin during setup. Prevents hardcoding the Policy IDs and Admin wallet address in application code.

### `TRANSACTION_LOG`
An **audit log** entity written each time the Admin successfully sends ADA or a multi-asset reward. Provides an application-level ledger that can be cross-referenced with the Blockfrost on-chain data in Increment 5 for double-entry bookkeeping.

---

## Firestore Collection Structure

```
Firestore Database
│
├── scholars/                          (Collection)
│   ├── {scholarId}/                   (Document)
│   │   ├── name: "Jane Doe"
│   │   ├── course: "BS Computer Science"
│   │   ├── walletAddress: "addr_test1..."
│   │   ├── status: "APPROVED"
│   │   ├── policyId: "abc123policy..."
│   │   ├── lastPaidTxHash: "txhash123..."
│   │   └── achievement: { ... }       (Embedded sub-document)
│
├── sponsors/                          (Collection)
│   └── {sponsorId}/                   (Document)
│       ├── sponsorName: "XYZ Foundation"
│       └── pledgedAmount: 5000
│
├── transaction_log/                   (Collection)
│   └── {txId}/                        (Document)
│       ├── txHash: "on_chain_hash..."
│       ├── scholarId: "scholar_ref..."
│       └── adaAmount: 50
│
└── config/                            (Collection)
    └── config/                        (Singleton Document)
        ├── nftPolicyId: "..."
        ├── tokenPolicyId: "..."
        └── adminWalletAddress: "addr_test1..."
```
