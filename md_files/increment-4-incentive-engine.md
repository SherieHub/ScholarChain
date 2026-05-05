# ScholarChain — Increment 4: The Incentive Engine

> **Central Execution Contract · Team of 5 · Parallel Development Strategy**
> Builds directly on Increments 1–3. All prior code must be merged to `main` before this increment begins.
> Last Updated: May 2026 · Status: 🟡 In Progress

---

## 📋 Table of Contents

1. [Increment Objective & Scope](#objective)
2. [Definition of Done](#done)
3. [Technical Constraints](#constraints)
4. [Phase Execution Plan](#phases)
5. [Team Task Distribution](#tasks)
   - [Shervin — Token Infrastructure & Treasury DevOps](#shervin)
   - [Austine — Token Minting & Treasury Dashboard](#austine)
   - [Sherielyn — Achievement Submission & Reward UI](#sherielyn)
   - [Christian — Multi-Asset Transaction Engine](#christian)
   - [Jamiel — QA, Token Integrity & Demo Lead](#jamiel)
6. [Parallel Development Strategy & Dependency Map](#parallel)
7. [Integration Checklist](#integration)
8. [Branch & Git Strategy](#git)
9. [Daily Standup Template](#standup)
10. [Risk Register](#risks)

---

## 1. Increment Objective & Scope {#objective}

### Goal
Add a dual-asset incentive layer to the platform. The Admin first mints a supply of fungible SCHOLAR reward tokens into their treasury wallet. When a student (already verified via NFT) submits an academic achievement, the Admin reviews it and dispatches **both ADA and SCHOLAR tokens in a single Cardano transaction** — leveraging Cardano's native multi-asset capability without any smart contract.

### Elevator Pitch
> *"By the end of this increment, an Admin can mint 10,000 SCHOLAR tokens, a verified student can submit their A+ grade from inside the Scholar Portal, the Admin sees the pending reward on their dashboard, enters an ADA amount and a token amount, clicks Send, signs once — and both assets land in the student's wallet simultaneously in one transaction. No Ethereum gas hell. No smart contracts. One signature, two assets, done."*

### What Changes from Increment 3

| Increment 3 | Increment 4 |
|---|---|
| Scholar Portal shows basic profile info | Scholar Portal includes Achievement Submission form |
| No reward mechanism | Admin can mint SCHOLAR fungible tokens as a treasury |
| ADA payment uses fixed 5 ADA amount | Admin inputs dynamic ADA + token amounts per scholar |
| Single-asset ADA transactions only | Multi-asset transactions: ADA + SCHOLAR tokens in one tx |
| No achievement tracking | Achievement objects stored in Firestore with `RewardStatus` |

### Strict Scope Boundaries

| ✅ IN SCOPE | ❌ OUT OF SCOPE |
|---|---|
| Admin Treasury tab: mint SCHOLAR token supply | SCHOLAR token market/exchange listing |
| Dynamic token supply input (Admin decides amount) | Automatic distribution triggers / smart contracts |
| Student Achievement submission form in Scholar Portal | Grade verification with external systems |
| Admin Pending Rewards table (fetches submitted achievements) | Complex tokenomics or vesting schedules |
| Dynamic ADA + Token amount inputs per reward | Governance voting on reward amounts |
| MeshJS `sendAssets()` multi-asset transaction | Cross-chain token bridging |
| Firestore `Achievement` embedded document | Historical achievement tracking (multiple per student) |
| `RewardStatus` lifecycle: `Pending Review → Approved → Paid` | Automated approval |
| Post-reward Firestore update: `rewardStatus → "Paid"`, `rewardTxHash` | Refund mechanisms |

---

## 2. Definition of Done {#done}

Increment 4 is **complete and demonstrable** when ALL of the following are true:

- [ ] Admin can navigate to the Treasury Management tab and mint SCHOLAR tokens into their wallet
- [ ] SCHOLAR token supply input is dynamic (Admin decides the amount — not hardcoded)
- [ ] SCHOLAR tokens visible in Admin's Eternl wallet after minting
- [ ] Scholar Portal (NFT-gated) includes an Achievement Submission section
- [ ] Student submits Subject, Grade, and Proof Link → Firestore Scholar doc updated with Achievement object, `rewardStatus: "Pending Review"`
- [ ] Admin Pending Rewards table shows students with submitted achievements
- [ ] Admin can input a custom ADA amount and custom SCHOLAR token amount per scholar row
- [ ] Admin clicks "Approve & Send Reward" → MeshJS `sendAssets()` builds a single transaction containing both ADA and SCHOLAR tokens
- [ ] Wallet signing popup shows correct combined value (ADA + tokens)
- [ ] On TxHash confirmation: Firestore `rewardStatus → "Paid"`, `rewardTxHash` saved, `paidAt` timestamp set
- [ ] Student's Eternl wallet shows both the received ADA and SCHOLAR tokens after the transaction
- [ ] All Increment 1–3 functionality still works (no regressions)
- [ ] Live demo runnable in under 10 minutes

---

## 3. Technical Constraints {#constraints}

| # | Constraint | Reason |
|---|---|---|
| C4-01 | SCHOLAR token Policy ID must be **separate** from the Scholar Badge NFT Policy ID | Mixing policies breaks the NFT verification logic in the Scholar Portal |
| C4-02 | Token supply amount must be parsed with `Number()` before minting | Prevents JavaScript string math errors |
| C4-03 | `sendAssets()` must send **both** ADA and tokens in a **single** transaction | Demonstrates Cardano's multi-asset native advantage — two separate transactions defeats the purpose |
| C4-04 | Token Policy ID must be saved to Firestore `config.tokenPolicyId` after first mint | Enables `sendAssets()` to reference the correct policy when building the reward transaction |
| C4-05 | ADA reward amount must be validated as a positive integer > 0 | No zero-ADA reward transactions |
| C4-06 | Token reward amount must be a positive integer > 0 | No zero-token reward transactions |
| C4-07 | `RewardStatus` must follow strict enum: `"Pending Review"` → `"Approved"` → `"Paid"` | Prevents partial state corruptions |
| C4-08 | Only one active Achievement per scholar document (embedded, not sub-collection) | MVP simplification — multi-achievement tracking deferred to production |
| C4-09 | `rewardTxHash` must only be written after TxHash is confirmed — same resilience pattern as `lastPaidTxHash` | Avoids marking paid before on-chain confirmation |

---

## 4. Phase Execution Plan {#phases}

```
Phase 1: Token Infrastructure & Firestore Schema   [Day 1]      → Shervin leads
Phase 2: Token Minting (Treasury)                  [Day 1-2]    → Austine leads
Phase 3: Achievement Submission UI                 [Day 1-2]    → Sherielyn leads
Phase 4: Multi-Asset Reward Engine                 [Day 2-3]    → Christian leads
Phase 5: QA, Token Integrity & Demo               [Day 3-4]    → Jamiel leads
```

---

## 5. Team Task Distribution {#tasks}

---

### 🔧 SHERVIN — Token Infrastructure & Treasury DevOps Lead {#shervin}

**Domain:** Extend the TypeScript types and Firestore schema to support Achievement tracking, update Firestore security rules for the new data patterns, and update the `config` document structure to support the SCHOLAR token Policy ID.

**Working Branch:** `feature/token-infrastructure`

---

#### Task S4-01 — Extend TypeScript Types for Achievement and RewardStatus

**Estimated Time:** 1 hour

**Objective:** Add the `Achievement` embedded interface and `RewardStatus` enum to the shared type system. These types are used by Sherielyn (achievement form), Christian (transaction logic), and Austine (reward table).

**Detailed Steps:**
1. Update `types/scholar.ts` to add the `Achievement` interface and extend the `Scholar` interface:
   ```ts
   export type RewardStatus = "Pending Review" | "Approved" | "Paid";

   export interface Achievement {
     subject: string;
     grade: string;
     proofLink: string;
     rewardStatus: RewardStatus;
     adaRewarded?: number;
     tokensRewarded?: number;
     rewardTxHash?: string;
     submittedAt: Timestamp;
     paidAt?: Timestamp;
   }

   // Add to Scholar interface:
   // achievement?: Achievement;   ← already planned in schema.md
   ```
2. Verify `Scholar` interface in `types/scholar.ts` includes:
   ```ts
   achievement?: Achievement;
   ```
3. Export `Achievement` and `RewardStatus` from `types/index.ts`.

**Deliverable:** Updated `types/scholar.ts`. All team members import from `@/types`.

---

#### Task S4-02 — Add Achievement Firestore Service Functions

**Estimated Time:** 1–2 hours

**Objective:** Add service functions for writing achievement submissions and updating reward status to `lib/firebase/scholars.ts`.

**Detailed Steps:**
1. Add to `lib/firebase/scholars.ts`:
   ```ts
   /** Student submits their academic achievement — sets rewardStatus to "Pending Review" */
   export async function submitAchievement(
     scholarId: string,
     achievement: Omit<Achievement, "rewardStatus" | "submittedAt">
   ): Promise<void> {
     const ref = doc(db, SCHOLARS_COLLECTION, scholarId);
     await updateDoc(ref, {
       achievement: {
         ...achievement,
         rewardStatus: "Pending Review",
         submittedAt: serverTimestamp(),
       },
       updatedAt: serverTimestamp(),
     });
   }

   /** Fetch all scholars with rewardStatus "Pending Review" for the Rewards Dashboard */
   export async function getPendingRewardScholars(): Promise<Scholar[]> {
     const q = query(
       collection(db, SCHOLARS_COLLECTION),
       where("achievement.rewardStatus", "==", "Pending Review")
     );
     const snapshot = await getDocs(q);
     return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Scholar));
   }

   /** Update achievement reward details after Admin approves and sends reward */
   export async function markRewardAsPaid(
     scholarId: string,
     txHash: string,
     adaRewarded: number,
     tokensRewarded: number
   ): Promise<void> {
     const ref = doc(db, SCHOLARS_COLLECTION, scholarId);
     await updateDoc(ref, {
       "achievement.rewardStatus": "Paid",
       "achievement.rewardTxHash": txHash,
       "achievement.adaRewarded": adaRewarded,
       "achievement.tokensRewarded": tokensRewarded,
       "achievement.paidAt": serverTimestamp(),
       updatedAt: serverTimestamp(),
     });
   }
   ```
2. Note: Firestore supports dot-notation field updates for nested objects. `"achievement.rewardStatus"` updates only that sub-field without overwriting the whole achievement object.

**Deliverable:** Three new service functions in `lib/firebase/scholars.ts`. Exported from `lib/firebase/index.ts`.

---

#### Task S4-03 — Update Firestore Security Rules for Achievement Data

**Estimated Time:** 30 minutes

**Objective:** Extend the security rules to allow students to write their achievement data (update their own document's achievement field) while keeping other fields protected.

**Detailed Steps:**
1. Update the `scholars` rule in Firebase Console:
   ```javascript
   match /scholars/{scholarId} {
     allow read: true;
     allow create: if ...; // same as Increment 2
     // Allow update ONLY of achievement field — not status, policyId, etc.
     allow update: if request.resource.data.diff(resource.data).affectedKeys()
       .hasOnly(['achievement', 'updatedAt']);
   }
   ```
2. This rule ensures students can only update their `achievement` sub-document — they cannot change their own `status` or `walletAddress`.
3. Publish and test using the Rules Playground with a simulated update to `achievement` only.

**Deliverable:** Updated Firestore security rules published.

---

#### Task S4-04 — Update Firestore Config Document for Token Policy

**Estimated Time:** 30 minutes

**Objective:** Ensure the `config` Firestore document has the `tokenPolicyId` and `scholarTokenTotalSupply` fields ready for Austine's token minting function to populate.

**Detailed Steps:**
1. In Firebase Console, open the `config/config` document.
2. Confirm these fields exist (add if missing):
   - `tokenPolicyId: ""` (string, will be populated after first mint)
   - `scholarTokenTotalSupply: 0` (number)
3. Add `updateTokenPolicyId` to `lib/firebase/config-store.ts`:
   ```ts
   export async function updateTokenPolicyId(
     policyId: string,
     totalSupply: number
   ): Promise<void> {
     const ref = doc(db, "config", "config");
     await updateDoc(ref, {
       tokenPolicyId: policyId,
       scholarTokenTotalSupply: totalSupply,
     });
   }
   ```

**Deliverable:** Config document updated. `updateTokenPolicyId()` function available for Austine.

---

### 🏦 AUSTINE — Token Minting & Treasury Dashboard Lead {#austine}

**Domain:** Build the Admin Treasury Management tab where SCHOLAR fungible tokens are minted, implement the `mintTokenSupply()` MeshJS function, and build the Pending Rewards table where the Admin reviews and approves student achievement rewards.

**Dependency:** Requires Shervin's S4-01 (types) and S4-04 (config functions).

**Working Branch:** `feature/treasury-dashboard`

---

#### Task A4-01 — Build the `mintTokenSupply()` Function

**Estimated Time:** 2–3 hours

**Objective:** Implement the MeshJS transaction that forges a specified quantity of SCHOLAR fungible tokens into the Admin's connected wallet. This is nearly identical to NFT minting from Increment 3, but with `assetQuantity > "1"`.

**Detailed Steps:**
1. Create `lib/mesh/mintTokens.ts`:
   ```ts
   import { Transaction, ForgeScript } from "@meshsdk/core";

   export interface MintTokenResult {
     txHash: string;
     policyId: string;
     tokenName: string;
     supplyMinted: number;
   }

   /**
    * Mints a specified supply of SCHOLAR fungible reward tokens into the Admin's wallet.
    * Uses a NEW, SEPARATE ForgeScript Policy ID from the Scholar Badge NFT policy.
    *
    * @param wallet - Connected Admin BrowserWallet
    * @param supplyAmount - Number of SCHOLAR tokens to mint (e.g., 10000)
    * @returns MintTokenResult with txHash, policyId, tokenName, and supply
    */
   export async function mintTokenSupply(
     wallet: any,
     supplyAmount: number
   ): Promise<MintTokenResult> {
     if (!wallet) throw new Error("Wallet not connected.");
     if (!supplyAmount || supplyAmount <= 0) {
       throw new Error("Token supply amount must be greater than zero.");
     }

     const TOKEN_NAME = "SCHOLAR";

     // CRITICAL: Generate a NEW ForgeScript — separate from the NFT policy
     const forgingScript = ForgeScript.withOneSignature(
       await wallet.getPaymentPubKeyHash()
     );

     const tx = new Transaction({ initiator: wallet });
     tx.mintAsset(forgingScript, {
       assetName: TOKEN_NAME,
       assetQuantity: String(supplyAmount),  // Fungible: supply > 1
       metadata: {
         "721": {
           // Note: Fungible tokens use label "20" in CIP-25 for FTs,
           // but for simplicity in this MVP, label "721" with supply > 1 is accepted
         }
       },
       label: "721",
       recipient: { address: await wallet.getChangeAddress() }, // Minted to Admin's own wallet
     });

     const unsignedTx = await tx.build();
     const signedTx = await wallet.signTx(unsignedTx);
     const txHash = await wallet.submitTx(signedTx);
     const policyId = typeof forgingScript === "string"
       ? forgingScript
       : JSON.stringify(forgingScript);

     return { txHash, policyId, tokenName: TOKEN_NAME, supplyMinted: supplyAmount };
   }
   ```
2. After successful mint, save the `policyId` and `supplyAmount` to Firestore config via `updateTokenPolicyId()`.
3. Key difference from NFT minting: `assetQuantity` is the full supply string (e.g., `"10000"`), and the recipient is the Admin's own wallet (not a scholar).

**Deliverable:** `lib/mesh/mintTokens.ts` — SCHOLAR token minting function.

---

#### Task A4-02 — Build the Treasury Management Tab in Admin Dashboard

**Estimated Time:** 2–3 hours

**Objective:** Create a "Treasury Management" tab in the Admin Dashboard where the Admin can view their current SCHOLAR token balance and mint new supply.

**Detailed Steps:**
1. Create `components/dashboard/TreasuryMintPanel.tsx`:
   - **Supply Amount Input:** Number field, min 1, `placeholder="e.g. 10000"`
   - **Mint Supply Button:** Triggers `mintTokenSupply(wallet, amount)`
   - **Token Info Display:** After minting, shows: Token Name "SCHOLAR", Policy ID (truncated), Supply Minted
   - **Current Balance:** Fetches the Admin's SCHOLAR token balance from `wallet.getAssets()` and displays it
   - **Loading/processing/success/error states** (same pattern as ADA transactions)
2. Add the Treasury tab to `app/admin/page.tsx` using a tab switcher (`useState` for `activeTab: "scholars" | "rewards" | "treasury"`).
3. Show the Treasury tab only when wallet is connected.

**Deliverable:** `components/dashboard/TreasuryMintPanel.tsx` and Treasury tab in Admin Dashboard.

---

#### Task A4-03 — Build the Pending Rewards Table

**Estimated Time:** 2–3 hours

**Objective:** Create the "Pending Rewards" section in the Admin Dashboard — a table of scholars who have submitted achievements with `rewardStatus: "Pending Review"`, ready for the Admin to review and approve.

**Detailed Steps:**
1. Create `components/dashboard/PendingRewardsTable.tsx`. Props:
   ```tsx
   interface PendingRewardsTableProps {
     scholars: Scholar[];
     onApproveReward: (scholar: Scholar, adaAmount: string, tokenAmount: string) => void;
     processingId: string | null;
   }
   ```
2. Table columns: `Scholar Name`, `Course`, `Subject`, `Grade`, `Proof Link`, `ADA Reward`, `Token Reward`, `Action`.
3. Per row:
   - Show `scholar.name`, `scholar.course`, `scholar.achievement.subject`, `scholar.achievement.grade`
   - Render `achievement.proofLink` as a clickable hyperlink (opens in new tab for Admin to verify)
   - Two number inputs: **ADA Amount** and **SCHOLAR Token Amount** (both per-row, managed in local component state)
   - "Approve & Send Reward 🚀" button → calls `onApproveReward(scholar, adaAmount, tokenAmount)`
   - If `processingId === scholar.id`: show spinner + "Sending..."
   - If `achievement.rewardStatus === "Paid"`: show "Paid ✓" with `rewardTxHash` link
4. Use `useScholarData` hook with a custom fetch for `rewardStatus === "Pending Review"` (use `getPendingRewardScholars()` from Shervin's S4-02).

**Deliverable:** `components/dashboard/PendingRewardsTable.tsx` — Pending Rewards admin view.

---

#### Task A4-04 — Add the Rewards Tab to Admin Dashboard

**Estimated Time:** 1 hour

**Objective:** Wire the `PendingRewardsTable` into the Admin Dashboard as the second tab, ensuring the page-level `handleApproveReward` function is passed correctly.

**Detailed Steps:**
1. Add a `"rewards"` tab to the existing tab switcher in `app/admin/page.tsx`.
2. Create `handleApproveReward(scholar, adaAmount, tokenAmount)` — to be fully implemented by Christian in Task C4-02. For now, implement a stub.
3. Fetch `pendingRewardScholars` using `getPendingRewardScholars()` in a `useEffect`.
4. Pass `pendingRewardScholars`, `handleApproveReward`, and `processingId` to `<PendingRewardsTable />`.

**Deliverable:** Rewards tab in Admin Dashboard showing pending achievement reviews.

---

### 🎨 SHERIELYN — Achievement Submission & Reward UI Lead {#sherielyn}

**Domain:** Build the Achievement Submission form inside the NFT-gated Scholar Portal, the reward confirmation UI, and all post-reward display states.

**Dependency:** Requires Shervin's S4-01 (types) and S4-02 (`submitAchievement` service function). Scholar Portal from Increment 3 must be available.

**Working Branch:** `feature/achievement-ui`

---

#### Task SH4-01 — Build the Achievement Submission Form

**Estimated Time:** 2–3 hours

**Objective:** Add an "Submit Achievement" section inside the Scholar Dashboard (the authorized state of `/scholar-portal`) that allows verified scholars to submit their academic achievements for reward review.

**Detailed Steps:**
1. Create `components/forms/AchievementSubmitForm.tsx`. Props:
   ```tsx
   interface AchievementSubmitFormProps {
     scholarId: string;
     onSubmit: (subject: string, grade: string, proofLink: string) => Promise<void>;
     isSubmitting: boolean;
     currentAchievement?: Achievement;
   }
   ```
2. Form fields:
   - **Subject** — text input (e.g., "Data Structures and Algorithms")
   - **Grade Attained** — text input or select (e.g., "A+", "A", "B+")
   - **Proof Link** — URL input (screenshot of grade, portal link, etc.)
3. If `currentAchievement` exists and `rewardStatus !== "Paid"`:
   - Show current submission status: "⏳ Under Review" or "✅ Reward Sent"
   - Disable the form (can't submit a new achievement while one is pending)
4. If `currentAchievement.rewardStatus === "Paid"`: show the reward received:
   - "🎉 Reward Received!" card
   - ADA amount + SCHOLAR token amount displayed
   - `rewardTxHash` as a `<TxHashLink />`
   - Enable the form again (for a new achievement in the next period)
5. On submit: calls `submitAchievement(scholarId, { subject, grade, proofLink })`.

**Deliverable:** `components/forms/AchievementSubmitForm.tsx` — embedded in Scholar Portal's authorized dashboard.

---

#### Task SH4-02 — Integrate Achievement Form into Scholar Dashboard

**Estimated Time:** 1 hour

**Objective:** Add the `AchievementSubmitForm` to the Scholar Dashboard component from Increment 3.

**Detailed Steps:**
1. Update `components/dashboard/ScholarDashboard.tsx`:
   - Import `AchievementSubmitForm`
   - Add a new section below the Wallet Card: "🏆 Achievement & Rewards"
   - Pass `scholar.id`, `handleSubmitAchievement`, `isSubmitting`, and `scholar.achievement` as props
2. Implement `handleSubmitAchievement` inside `app/scholar-portal/page.tsx`:
   ```tsx
   const handleSubmitAchievement = async (subject: string, grade: string, proofLink: string) => {
     if (!scholar?.id) return;
     setIsSubmitting(true);
     try {
       await submitAchievement(scholar.id, { subject, grade, proofLink });
       // Refresh scholar data to reflect new achievement status
       const updated = await getScholarByWalletAddress(walletAddress);
       setScholar(updated);
     } catch (err: any) {
       setAchievementError(err.message);
     } finally {
       setIsSubmitting(false);
     }
   };
   ```

**Deliverable:** Scholar Dashboard updated with Achievement section. Authorized students can submit grades.

---

#### Task SH4-03 — Build Reward Input Components for Admin Dashboard

**Estimated Time:** 1–2 hours

**Objective:** Create the per-row dynamic input fields for the Pending Rewards table — the Admin enters a custom ADA amount and SCHOLAR token amount for each scholar.

**Detailed Steps:**
1. Create `components/forms/RewardApprovalForm.tsx` (used inline in each `PendingRewardsTable` row):
   ```tsx
   interface RewardApprovalFormProps {
     scholarId: string;
     onApprove: (adaAmount: string, tokenAmount: string) => void;
     isProcessing: boolean;
   }
   ```
2. Two compact number inputs side-by-side:
   - **ADA:** `placeholder="50"` with a small "tADA" label
   - **Tokens:** `placeholder="200"` with a small "SCHOLAR" label
3. "Approve & Send 🚀" button — disabled during processing or when either input is empty/zero.
4. Add input validation: both values must be positive integers > 0.
5. Include a brief helper text: *"ADA covers living allowance; SCHOLAR tokens represent academic merit recognition."*

**Deliverable:** `components/forms/RewardApprovalForm.tsx` used inline in each reward table row.

---

#### Task SH4-04 — Achievement Status Display Component

**Estimated Time:** 1 hour

**Objective:** Create a reusable component that displays the current state of a scholar's achievement across both the Scholar Portal and Admin Dashboard.

**Detailed Steps:**
1. Create `components/ui/AchievementStatusCard.tsx`:
   ```tsx
   const statusConfig = {
     "Pending Review": { icon: "⏳", label: "Under Review", color: "yellow" },
     "Approved": { icon: "✅", label: "Approved — Awaiting Payment", color: "blue" },
     "Paid": { icon: "🎉", label: "Reward Received!", color: "green" },
   };
   ```
2. Show the achievement subject, grade, and current `rewardStatus` badge.
3. If `rewardStatus === "Paid"`: show `adaRewarded` and `tokensRewarded` values + `rewardTxHash` link.
4. Use in both the Scholar Dashboard and the Admin's Pending Rewards table.

**Deliverable:** `components/ui/AchievementStatusCard.tsx` committed.

---

### ⛓️ CHRISTIAN — Multi-Asset Transaction Engine Lead {#christian}

**Domain:** Implement the MeshJS `sendAssets()` multi-asset transaction function that bundles ADA and SCHOLAR tokens into a single Cardano transaction, and wire it to the Admin's Pending Rewards approval flow.

**Dependency:** Requires Austine's token Policy ID (from A4-01 stored in Firestore config) and the `markRewardAsPaid()` service function from Shervin's S4-02.

**Working Branch:** `feature/multi-asset-tx`

---

#### Task C4-01 — Build the `sendMultiAssetReward()` Function

**Estimated Time:** 3–4 hours

**Objective:** The flagship transaction of Increment 4. A single MeshJS transaction that sends both ADA (in Lovelaces) and SCHOLAR tokens to a scholar's wallet simultaneously — demonstrating Cardano's native multi-asset capability.

**Detailed Steps:**
1. Create `lib/mesh/sendMultiAsset.ts`:
   ```ts
   import { Transaction } from "@meshsdk/core";
   import { adaToLovelace } from "@/lib/utils/lovelaceConversion";
   import { isValidPreprodAddress } from "@/lib/utils/addressUtils";
   import { getUniversityConfig } from "@/lib/firebase/config-store";

   export interface MultiAssetRewardResult {
     txHash: string;
     adaSent: number;
     tokensSent: number;
   }

   /**
    * Sends both ADA and SCHOLAR tokens to a scholar in a SINGLE Cardano transaction.
    * This leverages Cardano's native multi-asset capability — no smart contract required.
    *
    * @param wallet - Connected Admin BrowserWallet
    * @param recipientAddress - Scholar's Preprod wallet address
    * @param adaAmount - ADA to send (human-readable string, e.g., "50")
    * @param tokenAmount - SCHOLAR tokens to send (string, e.g., "200")
    * @returns MultiAssetRewardResult with txHash and amounts sent
    */
   export async function sendMultiAssetReward(
     wallet: any,
     recipientAddress: string,
     adaAmount: string,
     tokenAmount: string
   ): Promise<MultiAssetRewardResult> {
     if (!wallet) throw new Error("Wallet not connected.");
     if (!isValidPreprodAddress(recipientAddress)) {
       throw new Error("Invalid recipient address.");
     }

     const parsedAda = Number(adaAmount);
     const parsedTokens = Number(tokenAmount);
     if (parsedAda <= 0) throw new Error("ADA amount must be greater than zero.");
     if (parsedTokens <= 0) throw new Error("Token amount must be greater than zero.");

     // Fetch the SCHOLAR token Policy ID from Firestore config
     const config = await getUniversityConfig();
     if (!config.tokenPolicyId) {
       throw new Error("SCHOLAR token policy not found. Please mint the token supply first.");
     }

     const lovelaceAmount = adaToLovelace(adaAmount);

     // Build the multi-asset transaction
     const tx = new Transaction({ initiator: wallet });

     // The sendAssets() call bundles BOTH assets in a single output to the recipient
     tx.sendAssets(
       { address: recipientAddress },
       [
         {
           unit: "lovelace",
           quantity: lovelaceAmount,
         },
         {
           unit: `${config.tokenPolicyId}SCHOLAR`,  // PolicyId + AssetName
           quantity: String(parsedTokens),
         },
       ]
     );

     const unsignedTx = await tx.build();
     const signedTx = await wallet.signTx(unsignedTx);
     const txHash = await wallet.submitTx(signedTx);

     return {
       txHash,
       adaSent: parsedAda,
       tokensSent: parsedTokens,
     };
   }
   ```
2. The `unit` field format for native tokens in MeshJS is `{policyId}{assetNameHex}`. The asset name "SCHOLAR" should be hex-encoded if MeshJS requires it — check MeshJS docs for the exact unit format and adjust.
3. Add comprehensive error handling for: tokens not in Admin wallet, insufficient ADA, user cancels signing.

**Deliverable:** `lib/mesh/sendMultiAsset.ts` — the multi-asset reward function.

---

#### Task C4-02 — Wire Multi-Asset Reward to Admin Dashboard

**Estimated Time:** 2 hours

**Objective:** Replace Austine's stub `handleApproveReward` in `app/admin/page.tsx` with the real `sendMultiAssetReward()` call, followed by the Firestore `markRewardAsPaid()` update.

**Detailed Steps:**
1. Coordinate with Austine on `app/admin/page.tsx`. Implement `handleApproveReward`:
   ```tsx
   const handleApproveReward = async (
     scholar: Scholar,
     adaAmount: string,
     tokenAmount: string
   ) => {
     if (!wallet || !scholar.id) return;
     setProcessingRewardId(scholar.id);
     try {
       // Step 1: Execute multi-asset transaction
       const result = await sendMultiAssetReward(
         wallet,
         scholar.walletAddress,
         adaAmount,
         tokenAmount
       );

       // Step 2: Update Firestore with reward details
       await markRewardAsPaid(
         scholar.id,
         result.txHash,
         result.adaSent,
         result.tokensSent
       );

       // Step 3: Refresh rewards table
       refreshRewards();
     } catch (err: any) {
       setRewardError({ id: scholar.id, message: parseTxError(err) });
     } finally {
       setProcessingRewardId(null);
     }
   };
   ```
2. Apply the same Firestore resilience pattern from Increment 2: always show TxHash even if DB write fails.

**Deliverable:** `handleApproveReward` implemented in Admin Dashboard with real multi-asset transaction.

---

#### Task C4-03 — Verify Multi-Asset Transaction on Cardanoscan

**Estimated Time:** 1 hour

**Objective:** Manually verify that a multi-asset reward transaction correctly shows BOTH ADA and SCHOLAR tokens in a single transaction output on the Cardanoscan explorer.

**Detailed Steps:**
1. Execute a full reward flow: submit achievement as student → approve reward as Admin.
2. Copy the `rewardTxHash` from Firestore or the Admin Dashboard.
3. Navigate to `preprod.cardanoscan.io/transaction/{txHash}`.
4. In the "Outputs" section, confirm:
   - Recipient address = scholar's wallet address
   - ADA amount = Admin-entered ADA value
   - Native token listed: SCHOLAR token with entered quantity
   - Both assets appear in the **same output** (single transaction)
5. Navigate to the scholar's wallet on Cardanoscan. Confirm both assets are in their balance.
6. Document with screenshots in `docs/multi-asset-verification.md`.

**Deliverable:** `docs/multi-asset-verification.md` with Cardanoscan screenshots confirming multi-asset delivery.

---

#### Task C4-04 — Write Multi-Asset Error Handling Documentation

**Estimated Time:** 30 minutes

**Objective:** Extend `lib/mesh/errorHandler.ts` with token-specific error messages.

**Detailed Steps:**
Add to `parseTxError()` in `lib/mesh/errorHandler.ts`:
```ts
if (msg.toLowerCase().includes("not enough")) return "Insufficient SCHOLAR tokens in Admin treasury. Please mint more tokens first.";
if (msg.toLowerCase().includes("policy")) return "Token Policy ID not found. Ensure the SCHOLAR token has been minted in the Treasury tab.";
if (msg.toLowerCase().includes("asset")) return "Asset not found in wallet. Check that the SCHOLAR token policy matches the minted supply.";
```

**Deliverable:** Updated `parseTxError()` with token-specific error messages.

---

### 🧪 JAMIEL — QA, Token Integrity & Demo Lead {#jamiel}

**Domain:** Verify SCHOLAR token minting accuracy, test the complete achievement-to-reward flow, and prepare the most compelling demo yet — showing simultaneous ADA + token delivery.

**Working Branch:** `feature/qa-increment-4`

---

#### Task J4-01 — Set Up Achievement Test Data

**Estimated Time:** 30 minutes

**Objective:** Prepare Firestore test data with scholars in different achievement states for comprehensive testing.

**Detailed Steps:**
1. Using the Firestore Console, create/update scholars:
   - Scholar A (`status: "Approved"`) — has submitted achievement with `rewardStatus: "Pending Review"`
   - Scholar B (`status: "Approved"`) — no achievement submitted yet
   - Scholar C (`status: "Approved"`) — achievement already `rewardStatus: "Paid"` (to test "already paid" display)
2. Ensure all scholars have valid `walletAddress` values (use the funded test wallets from Increment 1).

**Deliverable:** Test data set documented in `docs/increment-4-test-data.md`.

---

#### Task J4-02 — Write and Execute the Increment 4 Test Plan

**Estimated Time:** 3–4 hours

**Objective:** Comprehensive test coverage for all Increment 4 functionality.

**Detailed Steps:**
Create and execute `docs/increment-4-test-plan.md`:

**Section 1: Treasury Token Minting**

| ID | Test Case | Expected Result |
|---|---|---|
| TKN-01 | Mint 1,000 SCHOLAR tokens | TxHash returned; tokens visible in Admin Eternl wallet |
| TKN-02 | Mint with zero supply | Validation error — not submitted |
| TKN-03 | Token Policy ID saved to Firestore config | `config.tokenPolicyId` populated after mint |
| TKN-04 | Token name = "SCHOLAR" on Cardanoscan | Verify token name in explorer |
| TKN-05 | SCHOLAR token Policy ID ≠ NFT Policy ID | Confirm different policies in Firebase Console |
| TKN-06 | Admin cancels token mint signing | Friendly error message, no supply minted |

**Section 2: Achievement Submission (Scholar Portal)**

| ID | Test Case | Expected Result |
|---|---|---|
| ACH-01 | Scholar submits achievement | Firestore doc has achievement with `rewardStatus: "Pending Review"` |
| ACH-02 | Scholar submits with empty proof link | Validation error |
| ACH-03 | Pending achievement shows "Under Review" | Status card shows ⏳ Under Review in Scholar Portal |
| ACH-04 | Already-paid scholar shows reward received | 🎉 Reward card shows amounts and TxHash |
| ACH-05 | Pending scholar cannot submit second achievement | Form disabled when `rewardStatus === "Pending Review"` |

**Section 3: Multi-Asset Reward Transaction**

| ID | Test Case | Expected Result |
|---|---|---|
| MAR-01 | Happy path: approve & send reward | Single TxHash containing both ADA + SCHOLAR tokens |
| MAR-02 | Cardanoscan shows both assets in one output | ADA + SCHOLAR token in same tx output |
| MAR-03 | Scholar receives both ADA and tokens in Eternl | Balance shows new ADA + SCHOLAR token |
| MAR-04 | Firestore `rewardStatus` → "Paid" after tx | Achievement rewardStatus updated in Firebase Console |
| MAR-05 | `rewardTxHash` matches Cardanoscan hash | Manually compare values |
| MAR-06 | `adaRewarded` and `tokensRewarded` values correct | Match Admin-entered amounts in Firestore |
| MAR-07 | Zero ADA amount blocked | Validation error before tx |
| MAR-08 | Zero token amount blocked | Validation error before tx |
| MAR-09 | Reward sent before SCHOLAR tokens minted | Friendly error: "Mint supply first" |
| MAR-10 | Admin cancels multi-asset signing | Friendly error, no Firestore update |

Execute all tests. File GitHub Issues for failures. Re-test after fixes.

**Deliverable:** Fully executed `docs/increment-4-test-plan.md`. All 21 test cases ✅.

---

#### Task J4-03 — Verify Multi-Asset Token Integrity

**Estimated Time:** 1 hour

**Objective:** Independently verify that the SCHOLAR tokens are legitimate on-chain assets — not fake data displayed by the application.

**Detailed Steps:**
1. After Test MAR-01, open both the Scholar Wallet A in Eternl and Cardanoscan.
2. Verify in Eternl: the "Assets" tab shows the SCHOLAR token with the correct quantity.
3. Verify on Cardanoscan (`preprod.cardanoscan.io`):
   - Search the Scholar's wallet address → confirm SCHOLAR token in their balance
   - Search the mint TxHash → confirm SCHOLAR tokens were minted to Admin wallet
   - Search the reward TxHash → confirm SCHOLAR tokens transferred from Admin to Scholar
4. Verify the SCHOLAR token policy is different from the Scholar Badge NFT policy (open both in Cardanoscan and compare Policy IDs).
5. Screenshot all verification steps. Add to `docs/increment-4-token-verification/`.

**Deliverable:** Token integrity verified on-chain. Screenshots committed.

---

#### Task J4-04 — Prepare and Rehearse the Increment 4 Demo Script

**Estimated Time:** 2 hours

**Objective:** The most impressive demo yet. Script must show the full incentive engine flow in a compelling, clear narrative.

**Detailed Steps:**
Create `docs/increment-4-demo-script.md`:

**Pre-Demo Setup:**
- [ ] Admin Wallet funded and connected with SCHOLAR tokens already minted (or mint live as Scene 1)
- [ ] Scholar Wallet A has Scholar Badge NFT (from Increment 3)
- [ ] Scholar Portal open in a second browser window (Scholar Wallet A connected)
- [ ] Scholar A's Firestore doc has an achievement with `rewardStatus: "Pending Review"` — OR submit live during demo

**Key Demo Scenes:**
1. **(Treasury Scene):** Open Admin Dashboard → Treasury tab. "First, the institution mints SCHOLAR reward tokens. These are real Cardano native tokens — not points in a database." Enter 5,000. Click Mint. Sign. Show TxHash. Show tokens in Eternl wallet.
2. **(Student Scene):** Switch to Scholar Portal window. Scholar connected (NFT-verified from Increment 3). Navigate to Achievement section. Submit: Subject "Data Structures", Grade "A+", Proof Link. Click Submit.
3. **(Admin Review Scene):** Switch back to Admin Dashboard → Rewards tab. Refresh. Scholar A appears with their submitted achievement and the proof link. Admin clicks the proof link. "The admin verifies the grade."
4. **(The Money Shot):** Admin enters "50" ADA and "200" SCHOLAR tokens next to Scholar A's row. Clicks "Approve & Send Reward." Signs in Eternl. "One signature. One transaction."
5. **(Verification Scene):** TxHash appears. Click it. Cardanoscan opens showing BOTH 50 ADA and 200 SCHOLAR tokens in a single transaction output. "Cardano allows sending multiple native assets simultaneously without smart contracts. This is one of its core design advantages."
6. **(Scholar Receives):** Switch to Scholar Portal. Show `achievement.rewardStatus = "Paid"` card. Show `adaRewarded = 50` and `tokensRewarded = 200`. Open Eternl on Scholar's device — show both assets in balance.

**Deliverable:** `docs/increment-4-demo-script.md` rehearsed by full team. Dry run completed.

---

## 6. Parallel Development Strategy & Dependency Map {#parallel}

```
DAY 1                          DAY 2                        DAY 3-4
─────────────────────────────────────────────────────────────────────────
SHERVIN
  S4-01: TypeScript Types ──────►│
  S4-02: Achievement Service ────►│ (unblocks Sherielyn + Christian)
  S4-03: Security Rules ─────────►│
  S4-04: Config Token Fields ────►│

AUSTINE                          │
  (waits for S4-01, S4-04)       ├── A4-01: mintTokens() ──► A4-02: Treasury Tab ──► A4-03: Rewards Table ──► A4-04: Rewards Tab Wire

SHERIELYN                        │
  (waits for S4-01, S4-02)       ├── SH4-01: Achievement Form ──► SH4-02: Wire to Portal ──► SH4-03: Reward Inputs ──► SH4-04: Status Card

CHRISTIAN                        │
  (waits for A4-01 + S4-02)      │                           C4-01: sendMultiAsset() ──► C4-02: Wire to Dashboard ──► C4-03: Cardanoscan Verify ──► C4-04: Error Messages

JAMIEL                           │
  J4-01: Test Data ──────────────►│                          J4-02: Test Execution ─────────────────────────────► J4-03: Token Integrity ──► J4-04: Demo Script
─────────────────────────────────────────────────────────────────────────
```

---

## 7. Integration Checklist {#integration}

- [ ] SCHOLAR token Policy ID saved to Firestore `config.tokenPolicyId` after mint
- [ ] SCHOLAR token Policy ID ≠ Scholar Badge NFT Policy ID (confirmed in Firestore config)
- [ ] `sendMultiAssetReward()` reads `tokenPolicyId` from Firestore — not hardcoded
- [ ] Both ADA and tokens sent in a **single** `sendAssets()` call (not two separate transactions)
- [ ] `markRewardAsPaid()` called after TxHash confirmed — never before
- [ ] Scholar Portal achievement form disabled when `rewardStatus === "Pending Review"`
- [ ] Pending Rewards table only shows scholars with `rewardStatus === "Pending Review"`
- [ ] Zero ADA and zero token amounts blocked by validation before transaction builds
- [ ] All 21 test cases in `docs/increment-4-test-plan.md` marked ✅
- [ ] Multi-asset Cardanoscan screenshot showing both assets in single tx output committed

---

## 8. Branch & Git Strategy {#git}

```
main (protected)
  ├── feature/token-infrastructure    (Shervin)
  ├── feature/treasury-dashboard      (Austine)
  ├── feature/achievement-ui          (Sherielyn)
  ├── feature/multi-asset-tx          (Christian)
  └── feature/qa-increment-4          (Jamiel)
```

### Recommended Merge Order
1. Shervin: `feature/token-infrastructure` (types + services — unblocks all)
2. Sherielyn: `feature/achievement-ui` (Scholar Portal additions — no conflict with Admin pages)
3. Austine: `feature/treasury-dashboard` (Treasury tab + Rewards table skeleton)
4. Christian: `feature/multi-asset-tx` (wires real logic to Rewards table — coordinate with Austine)
5. Jamiel: `feature/qa-increment-4` (docs only)

---

## 9. Daily Standup Template {#standup}

```
👤 [Name] — [Date] — Increment 4

✅ DONE: [Task ID + description]
🔨 DOING: [Current focus]
🚧 BLOCKED: [Blocker + who can resolve]
📢 NEEDS FROM TEAM: [Coordination needed]
```

---

## 10. Risk Register {#risks}

| ID | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R4-01 | MeshJS `sendAssets()` unit format for SCHOLAR token is incorrect | High | High | Test `sendAssets()` with a small amount first; check MeshJS docs for exact `unit` string format (`policyId + hex(assetName)`) | Christian |
| R4-02 | Admin sends reward before minting SCHOLAR token supply | Medium | High | `sendMultiAssetReward()` fetches `tokenPolicyId` from config — throws friendly error if empty | Christian |
| R4-03 | Firestore nested field update overwrites whole achievement object | Medium | High | Use dot-notation updates (`"achievement.rewardStatus"`) not full document overwrites | Shervin |
| R4-04 | SCHOLAR token policy conflicts with NFT policy | Medium | High | Generate a NEW ForgeScript in `mintTokens.ts` (separate from `mintNFT.ts`) — enforced by separate function files | Austine |
| R4-05 | Scholar submits achievement but Firestore security rule blocks update | Medium | Medium | Security rule must allow update of `achievement` field specifically (S4-03) | Shervin |
| R4-06 | Token asset name hex encoding mismatch | Low | High | Test `unit` string construction manually before full integration; log the constructed unit string to console during development | Christian |

---

*Document Version: 1.0 · ScholarChain Team · Approved for Execution ✅*
