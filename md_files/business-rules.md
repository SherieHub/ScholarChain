# ScholarChain — Business Rules

> The strict operational rules, constraints, invariants, and validations that govern the ScholarChain system. These rules are enforced at the application layer and, where noted, are additionally enforced by the immutability of the Cardano blockchain.

---

## Category 1: ADA / Lovelace Conversion Rules

### BR-001 — All blockchain amounts must be denominated in Lovelaces
**Applies to:** Increments 1, 4, 5

The Cardano protocol does not process decimal values. Every ADA amount entered by the Admin through the UI must be converted to Lovelaces before being passed to MeshJS.

```
Rule:    lovelaceValue = Number(adaInput) * 1_000_000
Example: Admin types "50" → system sends 50,000,000 Lovelaces
```

**Enforcement:** Applied in `lib/utils/lovelaceConversion.ts` before any MeshJS call.

---

### BR-002 — Input must be parsed to Number before Lovelace conversion
**Applies to:** Increment 1

React form inputs return values as strings. String multiplication in JavaScript produces concatenation, not arithmetic.

```
WRONG: "50" * 1000000 = "501000000"  ← JavaScript string concat
RIGHT: Number("50") * 1000000 = 50000000 ← Correct integer
```

**Enforcement:** Always call `Number(inputValue)` or `parseInt(inputValue, 10)` before the multiplication.

---

### BR-003 — Lovelace amounts displayed to users must be converted back to ADA
**Applies to:** Increment 5

Blockfrost returns balances and transaction amounts in raw Lovelaces. The Transparency Dashboard must convert these to human-readable ADA before display.

```
Rule:    displayADA = lovelaceValue / 1_000_000
Example: Blockfrost returns 50000000 → UI shows "50 ADA"
```

---

## Category 2: Wallet & Authorization Rules

### BR-004 — The Admin Dashboard is inaccessible without a connected wallet
**Applies to:** Increments 1–4

No Admin action (send ADA, mint NFT, mint tokens, approve rewards) may be executed unless a Cardano wallet is actively connected via MeshJS. The Admin layout component must check wallet connection state on mount and redirect or block if disconnected.

```
Condition: useWallet().connected === false
Action:    Render "Please connect your wallet to continue" — disable all action buttons
```

---

### BR-005 — Scholar Portal access requires an NFT with the University Policy ID
**Applies to:** Increment 3+

The Scholar Portal (`/scholar-portal`) must not rely on any email/password or Firebase Auth system. Access is gated **exclusively** on-chain by the presence of a valid NFT.

```
Rule:    wallet.getAssets().some(a => a.policyId === UNIVERSITY_POLICY_ID)
If true:  isAuthorized = true → render Scholar Dashboard
If false: isAuthorized = false → render "Access Denied" screen
```

**Invariant (blockchain-enforced):** The NFT cannot be forged. Only the Admin wallet holding the original minting policy can produce an asset with the correct `policyId`. A fake NFT with a different `policyId` will never pass the filter condition.

---

### BR-006 — The Transparency Dashboard is publicly accessible — no wallet required
**Applies to:** Increment 5

The `/transparency` page must be fully readable without wallet connection. It is a **read-only** public accountability page. Under no circumstances should a wallet prompt be triggered on this page.

---

### BR-007 — The Admin must be on the correct network (Preprod)
**Applies to:** All increments

MeshJS will reject transactions submitted from a wallet set to a different network. The application should check `useWallet().wallet.getNetworkId()` and warn the Admin if the wallet is on Mainnet (network ID `1`) instead of Preprod (network ID `0`).

```
Rule:    networkId === 0 → allow operations (Preprod)
         networkId === 1 → show warning: "Please switch wallet to Preprod Testnet"
```

---

## Category 3: Transaction Submission Rules

### BR-008 — All transaction logic must be wrapped in try/catch
**Applies to:** Increments 1–4

The "happy path" assumption that the Admin always completes signing is invalid. Transactions must handle:

| Failure Scenario | System Response |
|---|---|
| Admin closes wallet popup without signing | Catch rejected promise → display "Transaction cancelled" |
| Insufficient ADA balance (gas fees) | Catch MeshJS insufficient funds error → display "Insufficient balance" |
| Network timeout | Catch submission error → display "Network error, please retry" |
| Wallet not connected mid-flow | Check wallet state before building tx → prompt reconnection |

**Enforcement:** `try { ... } catch (error) { setErrorMessage(error.message); }` in all MeshJS wrapper functions.

---

### BR-009 — The UI must show a processing state between submission and TxHash receipt
**Applies to:** Increments 1, 2, 3, 4

Cardano Preprod takes approximately 20 seconds to confirm a block. The "Send Scholarship" button must be disabled and a loading spinner displayed immediately after submission to prevent double-spend attempts.

```
State machine:
  IDLE → (click Send) → PROCESSING → (TxHash received) → SUCCESS | ERROR
```

---

### BR-010 — Every successful transaction must display a verifiable TxHash link
**Applies to:** Increments 1, 2, 3, 4

On transaction success, the returned `TxHash` must be rendered as a hyperlink to the Cardano Preprod block explorer. This provides instant independent verifiability.

```
URL pattern:  https://preprod.cardanoscan.io/transaction/{txHash}
Render as:    <a href={url} target="_blank" rel="noopener noreferrer">{txHash}</a>
```

---

## Category 4: NFT & Token Minting Rules

### BR-011 — Each Scholar Badge NFT must have a supply of exactly 1
**Applies to:** Increment 3

Scholar Badges are identity credentials, not tradeable assets. MeshJS ForgeScript must specify `amount: 1` when minting. Minting more than 1 breaks the uniqueness guarantee of the credential.

---

### BR-012 — Scholar Badge NFT metadata must be dynamically generated per student
**Applies to:** Increment 3

The `name` and `course` fields in the CIP-25 metadata block must be pulled from the specific Scholar's Firestore document at the time of minting. Hardcoding metadata defeats the purpose of the system.

```
Required dynamic fields:
  metadata.scholar = scholar.name       (from Firestore)
  metadata.course  = scholar.course     (from Firestore)
  metadata.image   = UNIVERSITY_BADGE_IPFS_URI  (from config)
```

---

### BR-013 — NFT and fungible token minting must use separate Policy IDs
**Applies to:** Increments 3, 4

The Scholar Badge NFT policy and the SCHOLAR reward token policy must be distinct `Policy IDs`. Using the same policy would make them indistinguishable during asset scans and break the NFT verification logic in BR-005.

---

### BR-014 — Scholar status must be updated to "APPROVED" only after NFT TxHash is confirmed
**Applies to:** Increment 3

The Firestore Scholar document status must only be changed from `"PENDING"` to `"APPROVED"` after the mint transaction has been submitted and a `TxHash` returned. The `policyId` must be saved simultaneously.

```
Sequence:
  1. Admin clicks "Mint Scholar ID"
  2. Transaction builds and signs
  3. TxHash received (mempool confirmed)
  4. THEN: updateDoc(scholarRef, { status: "APPROVED", policyId: forgedPolicyId })
```

---

### BR-015 — Multi-asset reward amounts must be Admin-determined, not hardcoded
**Applies to:** Increment 4

The Admin inputs both the ADA amount and the SCHOLAR token amount per reward. The system must not default to any fixed value. This enforces the business rule that reward size is proportional to achievement quality (e.g., A+ earns more than B).

---

## Category 5: Transparency & Accountability Rules

### BR-016 — Blockfrost API key must never appear in client-side code
**Applies to:** Increment 5

The `BLOCKFROST_PROJECT_ID` environment variable must only be accessed inside Next.js API routes (`/app/api/`). It must not use the `NEXT_PUBLIC_` prefix. Exposing it in the client bundle allows anyone to consume the API quota or read private admin wallet data.

---

### BR-017 — The Transparency Dashboard must compute discrepancy dynamically
**Applies to:** Increment 5

The accountability gap between pledged funds and live treasury balance must be computed at runtime from live data — never cached or hardcoded.

```
Rule:     discrepancy = totalPledgedADA − (liveTreasuryADA + totalPaidOutADA)
Display:  If discrepancy > 0 → highlight in red with warning
          If discrepancy == 0 → show green "Fully Accounted" status
```

---

### BR-018 — TxHash links on the Transparency Ledger must point to an independent third-party explorer
**Applies to:** Increments 1, 5

All TxHash links must open `preprod.cardanoscan.io` (or an equivalent independent Cardano block explorer) in a new browser tab. They must **never** link back to the ScholarChain website itself. The independence of the verification source is the entire value proposition.

---

### BR-019 — Firebase pledge data must never be modified after submission
**Applies to:** Increment 5

Sponsor pledge records are the baseline "expected" figures in the accountability comparison. To prevent the Admin from retroactively lowering pledges to hide discrepancies, Firestore security rules must deny `update` and `delete` on the `sponsors` collection for all clients. Changes can only be made via the Firebase Console by a database administrator.

---

## Category 6: UI / UX Rules

### BR-020 — Recipient wallet address is always sourced from Firebase, not manually entered (Increment 2+)
**Applies to:** Increments 2–4

From Increment 2 onward, the Admin must not manually type a recipient wallet address for scholarship payments. The address is read directly from the Scholar's Firestore document to eliminate transcription errors.

---

### BR-021 — The Admin Dashboard must visually distinguish paid vs. unpaid scholars
**Applies to:** Increment 2+

Once `lastPaidTxHash` is set on a Scholar document, the corresponding table row must visually indicate the scholar has been paid (e.g., status badge changes, button disabled). This prevents accidental duplicate payments.

---

### BR-022 — The Scholar Portal must display the connected wallet's actual on-chain ADA balance
**Applies to:** Increment 3+

The Scholar's portal dashboard must show a live ADA balance fetched via `useWallet().wallet.getBalance()` from MeshJS, not a value stored in Firebase. Displaying a stale Firebase-stored balance as "live" would be misleading.
