# ScholarChain — Concepts Applied

> A breakdown of the core Web3, blockchain, and software engineering concepts employed across all five increments of the ScholarChain Decentralized Scholarship Tracking System.

---

## 1. Decentralization

**Increments:** All

Decentralization is the foundational philosophy of ScholarChain. Rather than storing financial records or issuing credentials through a centralized authority (e.g., a university server or bank), all monetary transfers and credential issuances are executed on the **Cardano public blockchain**. This means:

- No single entity can alter, delete, or fabricate a transaction record.
- The ledger is globally visible and independently verifiable.
- The system functions even if the ScholarChain web application goes offline, because the on-chain records persist indefinitely.

---

## 2. Cryptographic Witnessing (Transaction Signing)

**Increments:** 1, 2, 3, 4

Every transfer of value or asset on Cardano requires the wallet owner to **cryptographically sign** the transaction using their private key. This concept — called *witnessing* — is what prevents unauthorized transfers.

- The Admin's browser wallet extension (Nami/Eternl) acts as the **witness**.
- MeshJS constructs the unsigned transaction; the wallet appends the cryptographic signature.
- The signature mathematically proves ownership without ever exposing the private key.
- Attempting to forge a transaction without the correct private key is computationally infeasible.

---

## 3. UTxO Model (Unspent Transaction Output)

**Increment:** 1, 4

Cardano uses the **Extended UTxO** (EUTxO) ledger model, unlike Ethereum's account model. Key implications for ScholarChain:

- Funds are not "stored in an account" — they exist as discrete unspent outputs locked to an address.
- When the Admin sends ADA, MeshJS selects UTxOs from their wallet to satisfy the transaction amount, building a new output for the recipient and a change output back to the sender.
- This model enables **multi-asset transactions** (Increment 4) without requiring a smart contract, a significant architectural advantage.

---

## 4. Lovelace Denomination & Integer Math

**Increments:** 1, 4, 5

The Cardano protocol has no concept of decimal numbers at the ledger level. All ADA values are stored and transmitted as **Lovelaces**, where:

```
1 ADA = 1,000,000 Lovelaces
```

ScholarChain applies this conversion at every input boundary. The UI accepts human-readable ADA values; the application layer converts them before passing to MeshJS. Failure to do so results in string concatenation bugs (a classic JavaScript pitfall) rather than correct multiplication.

---

## 5. NFTs as Identity Credentials (Soulbound Badges)

**Increment:** 3

ScholarChain repurposes the NFT primitive not for speculation but as a **verifiable identity credential**. Key properties exploited:

- **Uniqueness:** Each Scholar Badge NFT has a supply of exactly 1.
- **Policy ID as Institutional Authority:** The university's `Policy ID` acts as an unforgeable seal — only the Admin wallet holding the minting policy can produce valid badges.
- **Wallet-as-Password:** The NFT's presence in a student's wallet replaces username/password authentication entirely. The wallet *is* the credential.
- **CIP-25 Metadata Standard:** The NFT metadata is structured per the Cardano Improvement Proposal 25 standard, encoding the student's name and course directly on-chain.

---

## 6. Fungible Tokens as Programmable Incentives

**Increment:** 4

SCHOLAR tokens are **fungible tokens** (supply > 1) minted using MeshJS's `ForgeScript`. They represent the incentive layer of the platform:

- Minted dynamically by the Admin into their treasury wallet.
- Distributed alongside ADA in a **single multi-asset transaction** — no smart contract required on Cardano.
- The token supply is set at mint time by the Admin, introducing dynamic, non-hardcoded economic parameters.

---

## 7. IPFS for Decentralized Asset Storage

**Increment:** 3

NFT badge images are stored on **IPFS (InterPlanetary File System)** via Pinata, not on a central server. This ensures:

- The image URL embedded in the NFT metadata remains permanently resolvable.
- The badge image cannot be altered or taken down by any single party.
- The content hash in the IPFS URL acts as an implicit integrity check.

---

## 8. Blockchain as an Oracle for Accountability (The Corruption Trap)

**Increment:** 5

In traditional systems, financial audits rely on self-reported data. ScholarChain uses the Cardano blockchain as an **immutable external oracle** to verify the Admin's stated actions:

- **Pledge data** lives in Firebase (off-chain, mutable, human-entered).
- **Treasury balance** is read live from the blockchain via Blockfrost (on-chain, immutable, cryptographically enforced).
- The discrepancy between these two sources is surfaced publicly — the Admin cannot manipulate both simultaneously without detection.

This is the architectural pattern known as a **Transparency Dashboard** or **Glass House**.

---

## 9. Separation of Concerns

**All Increments**

The system cleanly separates responsibilities:

| Layer | Responsibility |
|---|---|
| **React UI** | User interaction, form input, state management |
| **MeshJS SDK** | Cardano transaction construction, signing, submission |
| **Firebase Firestore** | Off-chain mutable state (applications, statuses, achievements) |
| **Blockfrost API** | Read-only blockchain querying (balances, tx history) |
| **Cardano Preprod Testnet** | Immutable ledger of record |

This separation ensures each layer can be tested, replaced, or scaled independently.

---

## 10. Optimistic UI with Mempool Awareness

**Increment:** 1, 2, 4

When a transaction is submitted, Cardano's block finality takes approximately **20 seconds** on Preprod. The system must communicate this latency clearly:

- A loading/spinner state is shown immediately after submission.
- The returned `TxHash` confirms mempool inclusion, not finalization.
- The UI treats the transaction as *in-progress* until the block explorer confirms it.
- This prevents double-submission and sets correct user expectations.

---

## 11. Agile Incremental Delivery (Vertical Slicing)

**All Increments**

ScholarChain is built using an **agile, increment-first** approach. Each increment is a vertical slice of working software:

- **Increment 1:** On-chain payment (no DB, no NFT).
- **Increment 2:** Off-chain registry added (Firebase), Admin dashboard connected.
- **Increment 3:** NFT identity layer added; Scholar Portal with wallet-gate authentication.
- **Increment 4:** Fungible token incentive engine; multi-asset payouts.
- **Increment 5:** Public transparency layer; Blockfrost-powered accountability dashboard.

Each increment is independently demonstrable, reducing risk and enabling early feedback.

---

## 12. API Route Security (Backend-for-Frontend Pattern)

**Increment:** 5

The Blockfrost API key must not be exposed in the browser bundle. ScholarChain follows the **Backend-for-Frontend (BFF)** pattern using Next.js API routes:

- The browser calls `/api/treasury` (an internal Next.js route).
- The server-side route appends the secret Blockfrost Project ID.
- The blockchain data is returned to the frontend without leaking credentials.

---

## 13. Cross-Reference Data Enrichment

**Increment:** 5

The Transparency Dashboard performs a **data join** across two heterogeneous sources:

- Blockfrost returns raw wallet addresses (e.g., `addr_test1...`).
- Firebase holds the human-readable scholar profiles linked to those addresses.
- The application joins on `WalletAddress` to display readable names alongside on-chain receipt hashes.

This is a classic **ETL (Extract, Transform, Load)** micro-pattern applied in a real-time UI context.
