# ScholarChain — Class Diagram

> A Mermaid.js class diagram representing the core data structures, domain models, and their relationships across all five increments of ScholarChain.

---

```mermaid
classDiagram

    %% ─────────────── DOMAIN ENTITIES ───────────────

    class Scholar {
        +String id
        +String name
        +String course
        +String walletAddress
        +ScholarStatus status
        +String? policyId
        +String? lastPaidTxHash
        +Achievement? achievement
        +String? scholarTokenId
        +Timestamp createdAt
        +Timestamp updatedAt
        +apply() void
        +getStatusLabel() String
    }

    class Sponsor {
        +String id
        +String sponsorName
        +Number pledgedAmount
        +Timestamp createdAt
        +submitPledge() void
    }

    class Achievement {
        +String subject
        +String grade
        +String proofLink
        +RewardStatus rewardStatus
        +Number? adaRewarded
        +Number? tokensRewarded
        +String? rewardTxHash
        +Timestamp submittedAt
    }

    class NFTMetadata {
        +String policyId
        +String assetName
        +String scholarName
        +String course
        +String imageIPFSUri
        +Number version
        +buildCIP25Object() Object
        +toOnChainFormat() Object
    }

    class TransactionRecord {
        +String txHash
        +String senderAddress
        +String recipientAddress
        +Number lovelaceAmount
        +Number? tokenAmount
        +String? tokenPolicyId
        +TransactionType type
        +Timestamp blockTime
        +Number blockHeight
        +toDisplayADA() Number
        +getExplorerUrl() String
    }

    class TreasuryState {
        +String adminWalletAddress
        +Number liveLovelaceBalance
        +Number totalPledgedADA
        +Number totalPaidOutADA
        +Number discrepancy
        +toLiveADA() Number
        +computeDiscrepancy() Number
        +isAccountable() Boolean
    }

    %% ─────────────── ENUM / VALUE OBJECTS ───────────────

    class ScholarStatus {
        <<enumeration>>
        PENDING
        APPROVED
        REJECTED
    }

    class RewardStatus {
        <<enumeration>>
        PENDING_REVIEW
        APPROVED
        PAID
    }

    class TransactionType {
        <<enumeration>>
        ADA_SCHOLARSHIP
        NFT_MINT_AND_SEND
        TOKEN_MINT
        MULTI_ASSET_REWARD
    }

    %% ─────────────── SERVICE CLASSES ───────────────

    class MeshTransactionService {
        -wallet BrowserWallet
        -network String
        +sendADA(recipientAddress: String, adaAmount: Number) Promise~String~
        +mintScholarNFT(walletAddress: String, metadata: NFTMetadata) Promise~String~
        +mintTokenSupply(amount: Number) Promise~String~
        +sendMultiAssetReward(address: String, ada: Number, tokens: Number, policyId: String) Promise~String~
        -adaToLovelace(ada: Number) Number
        -buildForgeScript() ForgeScript
    }

    class FirestoreService {
        -db Firestore
        +addScholar(scholar: Scholar) Promise~String~
        +getApprovedScholars() Promise~Scholar[]~
        +getPendingScholars() Promise~Scholar[]~
        +updateScholarStatus(id: String, status: ScholarStatus) Promise~void~
        +updateScholarTxHash(id: String, txHash: String) Promise~void~
        +updateScholarReward(id: String, achievement: Achievement) Promise~void~
        +addSponsor(sponsor: Sponsor) Promise~String~
        +getAllSponsors() Promise~Sponsor[]~
        +getTotalPledged() Promise~Number~
    }

    class BlockfrostService {
        -projectId String
        -api BlockFrostAPI
        +getLiveBalance(address: String) Promise~Number~
        +getTransactionHistory(address: String) Promise~TransactionRecord[]~
        +enrichWithScholarData(txRecords: TransactionRecord[], scholars: Scholar[]) Promise~TransactionRecord[]~
    }

    class NFTVerificationService {
        -wallet BrowserWallet
        -universityPolicyId String
        +verifyScholarBadge() Promise~Boolean~
        +getScholarAsset() Promise~Asset | null~
    }

    %% ─────────────── RELATIONSHIPS ───────────────

    Scholar "1" *-- "0..1" Achievement : contains
    Scholar "1" *-- "1" ScholarStatus : has status
    Achievement "1" *-- "1" RewardStatus : has status
    TransactionRecord "1" *-- "1" TransactionType : classified as

    Scholar "1" ..> "0..1" NFTMetadata : represented by
    Scholar "1" ..> "0..*" TransactionRecord : recipient of

    TreasuryState "1" --> "0..*" TransactionRecord : aggregates
    TreasuryState "1" --> "0..*" Sponsor : reads pledges from

    MeshTransactionService ..> NFTMetadata : uses
    MeshTransactionService ..> TransactionRecord : produces

    FirestoreService ..> Scholar : manages
    FirestoreService ..> Sponsor : manages
    FirestoreService ..> Achievement : updates

    BlockfrostService ..> TransactionRecord : produces
    BlockfrostService ..> TreasuryState : feeds

    NFTVerificationService ..> Scholar : validates access for
    NFTVerificationService ..> NFTMetadata : compares against
```

---

## Class Descriptions

### Domain Entities

| Class | Layer | Description |
|---|---|---|
| `Scholar` | Off-chain (Firestore) | Represents a student applicant and their full lifecycle from `PENDING` application through `APPROVED` scholarship receipt and token `PAID` reward. |
| `Sponsor` | Off-chain (Firestore) | Records an institutional or private pledge amount used by the Transparency Dashboard for the accountability comparison. |
| `Achievement` | Off-chain (Firestore, embedded) | A sub-document within Scholar. Captures the student's academic submission and the reward payment status. |
| `NFTMetadata` | On-chain (Cardano, CIP-25) | The structured data baked into the Scholar Badge NFT at mint time. Contains the student's name, course, and IPFS image URI. |
| `TransactionRecord` | On-chain (read via Blockfrost) | Represents a single submitted transaction on the Cardano ledger. Used in the Transparency Dashboard ledger table. |
| `TreasuryState` | Computed (Firebase + Blockfrost) | A derived view model that combines off-chain pledge data with live on-chain balance to compute the accountability discrepancy. |

### Service Classes

| Class | Wraps | Key Responsibility |
|---|---|---|
| `MeshTransactionService` | MeshJS (`@meshsdk/core`) | Encapsulates all blockchain write operations — ADA transfers, NFT minting, token distribution. |
| `FirestoreService` | Firebase SDK | All CRUD operations for Scholar and Sponsor collections. |
| `BlockfrostService` | `@blockfrost/blockfrost-js` | Server-side reads of live blockchain data — balances and transaction histories. |
| `NFTVerificationService` | MeshJS `wallet.getAssets()` | Client-side logic for gating Scholar Portal access via Policy ID ownership check. |
