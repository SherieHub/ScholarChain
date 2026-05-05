# ScholarChain — Increment 3: The Digital Badge

> **Central Execution Contract · Team of 5 · Parallel Development Strategy**
> Builds directly on Increments 1 & 2. All prior code must be merged to `main` before this increment begins.
> Last Updated: May 2026 · Status: 🟡 In Progress

---

## 📋 Table of Contents

1. [Increment Objective & Scope](#objective)
2. [Definition of Done](#done)
3. [Technical Constraints](#constraints)
4. [Phase Execution Plan](#phases)
5. [Team Task Distribution](#tasks)
   - [Shervin — IPFS & NFT Infrastructure Lead](#shervin)
   - [Austine — NFT Minting Engine](#austine)
   - [Sherielyn — Scholar Portal UI & Wallet-Gate](#sherielyn)
   - [Christian — NFT Verification & Auth Logic](#christian)
   - [Jamiel — QA, NFT Integrity & Demo Lead](#jamiel)
6. [Parallel Development Strategy & Dependency Map](#parallel)
7. [Integration Checklist](#integration)
8. [Branch & Git Strategy](#git)
9. [Daily Standup Template](#standup)
10. [Risk Register](#risks)

---

## 1. Increment Objective & Scope {#objective}

### Goal
Introduce NFTs as un-forgeable digital identity credentials. The Admin mints a unique Scholar Badge NFT (per CIP-25 standard) with the student's name and course baked into the on-chain metadata, and sends it directly to the student's wallet. The Scholar Portal then uses NFT ownership — not a username or password — as the authentication mechanism.

### Elevator Pitch
> *"By the end of this increment, the Admin clicks 'Mint Scholar ID' next to a Pending student, a unique NFT with that student's name and course is permanently written to the Cardano blockchain, the student navigates to the Scholar Portal, connects their wallet, and the system instantly scans their wallet for the University's official badge. If found, they're in. If not, access denied — no username, no password, no server, just cryptographic proof."*

### What Changes from Increment 2

| Increment 2 | Increment 3 |
|---|---|
| Scholar status manually set in Firebase Console | Admin clicks "Mint Scholar ID" button on dashboard |
| No on-chain identity for scholars | Scholar Badge NFT minted per student, metadata includes name + course |
| No student-facing authenticated portal | Scholar Portal (`/scholar-portal`) gated by NFT ownership |
| Scholars log in via... nothing (no student portal) | Students connect wallet — NFT ownership IS the login |
| Firebase `status` = "Approved" set manually | Status updated to "Approved" programmatically after mint TxHash confirmed |

### Strict Scope Boundaries

| ✅ IN SCOPE | ❌ OUT OF SCOPE |
|---|---|
| IPFS upload of Scholar Badge image via Pinata | Dynamic per-student NFT images (one shared badge image is fine) |
| CIP-25 NFT metadata (name, course, image, policyId) | NFT marketplace listing or trading |
| MeshJS `ForgeScript` policy generation | Smart contract (Plutus) validation |
| Admin "Mint Scholar ID" button on dashboard | Bulk minting of multiple NFTs in one transaction |
| Scholar Portal (`/scholar-portal`) route | Persistent Scholar login sessions (wallet connect is per-session) |
| `wallet.getAssets()` NFT ownership scan | Multi-wallet support for the same scholar |
| Policy ID saved to Firestore Scholar document | Policy ID revocation |
| Scholar Dashboard (basic: balance, name, course) | Full student grade portal (Increment 4) |
| `status` → "Approved" written to Firestore after mint | Automated approval pipelines |

---

## 2. Definition of Done {#done}

Increment 3 is **complete and demonstrable** when ALL of the following are true:

- [ ] Scholar Badge image uploaded to IPFS via Pinata; IPFS URI obtained and stored in Firestore config
- [ ] Admin Dashboard shows "Mint Scholar ID" button next to Pending scholars
- [ ] Clicking "Mint Scholar ID" triggers wallet signing, mints a CIP-25 NFT containing `scholarName` and `course` from Firestore, sends it to `scholar.walletAddress`
- [ ] On mint TxHash confirmation, Firestore Scholar document updates: `status → "Approved"`, `policyId` saved
- [ ] Student connects their wallet to `/scholar-portal`
- [ ] `wallet.getAssets()` correctly identifies the University Policy ID NFT in the student's wallet
- [ ] Scholar with valid NFT sees their personal dashboard (name, course, ADA balance)
- [ ] Wallet without the NFT receives "Access Denied" screen
- [ ] A wallet with a fake NFT (different Policy ID) correctly receives "Access Denied"
- [ ] All Increment 1 & 2 functionality still works (no regressions)
- [ ] All code merged to `main` via reviewed PRs
- [ ] Live demo runnable in under 8 minutes

---

## 3. Technical Constraints {#constraints}

| # | Constraint | Reason |
|---|---|---|
| C3-01 | NFT `name` and `course` fields in metadata must be dynamically pulled from Firestore — never hardcoded | Each badge must uniquely identify the specific scholar |
| C3-02 | NFT supply must be exactly `1` per student | Scholar Badges are identity credentials, not tradeable assets |
| C3-03 | The Scholar Badge NFT policy must be a **different** Policy ID from the SCHOLAR reward token (Increment 4) | Mixing policies breaks the `getAssets()` filter logic in authentication |
| C3-04 | NFT image must be hosted on IPFS (permanent, decentralized) — not a regular web URL | Regular URLs can go offline; IPFS content-addressed links are permanent |
| C3-05 | Metadata must conform to **CIP-25 v1** format | Non-standard metadata won't render correctly in wallets or explorers |
| C3-06 | Scholar Portal authentication must check `policyId` only — not asset name | Asset names may be duplicated; Policy ID is the institution's unforgeable seal |
| C3-07 | `isAuthorized` state must default to `false` — never `true` | Security: fail closed, not fail open |
| C3-08 | `wallet.getAssets()` call must happen inside a `try/catch` | Wallet API calls can fail if the extension disconnects |
| C3-09 | The University Policy ID must be stored in the Firestore `config` document — not hardcoded in `.env` or components | Enables the Policy ID to be updated without code deployments |

---

## 4. Phase Execution Plan {#phases}

```
Phase 1: IPFS Badge Upload & Config Setup      [Day 1]       → Shervin leads
Phase 2: NFT Minting Engine                    [Day 1-2]     → Austine leads
Phase 3: Scholar Portal UI Shell               [Day 1-2]     → Sherielyn leads
Phase 4: NFT Verification & Auth Logic         [Day 2-3]     → Christian leads
Phase 5: QA, NFT Integrity & Demo             [Day 3-4]     → Jamiel leads
```

### Phase 1 — IPFS Badge Upload & Config Setup
Upload the Scholar Badge image to IPFS, obtain the permanent CID link, and store it in the Firestore `config` collection so all minting operations reference the same decentralized asset.

### Phase 2 — NFT Minting Engine
Build the MeshJS minting function using `ForgeScript`, construct the CIP-25 metadata dynamically from Firestore scholar data, and upgrade the Admin Dashboard with a "Mint Scholar ID" action.

### Phase 3 — Scholar Portal UI Shell
Build the `/scholar-portal` route with wallet connection, the NFT scan trigger, and the two conditional UI states (authorized dashboard vs. access denied screen).

### Phase 4 — NFT Verification & Auth Logic
Implement the `wallet.getAssets()` scan logic and the Policy ID filter that gates access, and wire the authorized state to the Scholar Dashboard content.

### Phase 5 — QA, NFT Integrity & Demo
Verify on-chain NFT metadata accuracy, test all access scenarios, and prepare the final demo showing the complete flow from minting to wallet-gated login.

---

## 5. Team Task Distribution {#tasks}

---

### 🔧 SHERVIN — IPFS & NFT Infrastructure Lead {#shervin}

**Domain:** Provision the IPFS image storage via Pinata, establish the Firestore `config` singleton document, and update all shared configuration to support the NFT minting workflow.

**Priority:** 🔴 CRITICAL PATH — The IPFS URI and Policy ID config must be available before minting can work.

**Working Branch:** `feature/nft-infrastructure`

---

#### Task S3-01 — Upload Scholar Badge Image to IPFS via Pinata

**Estimated Time:** 1–2 hours

**Objective:** Permanently host the Scholar Badge artwork on IPFS, obtaining a content-addressed URI that will be embedded in every Scholar Badge NFT's on-chain metadata.

**Detailed Steps:**
1. Design or obtain the Scholar Badge image. Requirements:
   - Format: PNG or SVG
   - Recommended dimensions: 512×512px or 1024×1024px
   - Content: ScholarChain logo, "Scholar Badge" text, University seal/emblem
   - Background: dark or transparent for wallet display compatibility
2. Register at [pinata.cloud](https://pinata.cloud) (free tier is sufficient).
3. In the Pinata dashboard, click **Upload → File**. Upload the badge PNG.
4. Once uploaded, copy the **IPFS CID** (e.g., `QmXyZ1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t`).
5. Construct the full IPFS URI: `ipfs://QmXyZ...` — this is the exact string that goes into CIP-25 metadata.
6. Test the image resolves via an IPFS gateway: `https://ipfs.io/ipfs/QmXyZ...` — should display the badge in browser.
7. Store the IPFS URI securely; it will be needed by Shervin in Task S3-02.

**Deliverable:** Scholar Badge image live on IPFS. IPFS URI obtained and shared with team.

---

#### Task S3-02 — Create the Firestore `config` Singleton Document

**Estimated Time:** 1 hour

**Objective:** Create a single Firestore document that acts as the application's system-wide configuration store — holding the IPFS URI, Policy IDs (once minted), and Admin wallet address for use across all increments.

**Detailed Steps:**
1. In the Firebase Console, create a new collection called `config`.
2. Create a single document with a fixed ID of `"config"` (the document ID itself is `"config"`).
3. Add the following fields (populate what is known now; leave others for later increments):
   ```
   badgeIPFSUri:          (string) "ipfs://Qm..."       ← from Task S3-01
   nftPolicyId:           (string) ""                   ← populated after first mint (Task A3-03)
   tokenPolicyId:         (string) ""                   ← populated in Increment 4
   adminWalletAddress:    (string) "addr_test1..."       ← Admin's Preprod wallet address
   scholarTokenTotalSupply: (number) 0                  ← populated in Increment 4
   ```
4. Update the Firestore security rules (from Increment 2's S2-03) to add:
   ```javascript
   match /config/{configId} {
     allow read: true;    // All clients can read config
     allow write: if false; // Config set manually via Console only
   }
   ```
5. Create `lib/firebase/config-store.ts` (not to be confused with `lib/firebase/config.ts`):
   ```ts
   import { doc, getDoc, updateDoc } from "firebase/firestore";
   import { db } from "./config";

   export interface UniversityConfig {
     badgeIPFSUri: string;
     nftPolicyId: string;
     tokenPolicyId: string;
     adminWalletAddress: string;
     scholarTokenTotalSupply: number;
   }

   export async function getUniversityConfig(): Promise<UniversityConfig> {
     const ref = doc(db, "config", "config");
     const snap = await getDoc(ref);
     if (!snap.exists()) throw new Error("University config document not found in Firestore.");
     return snap.data() as UniversityConfig;
   }

   export async function updateNftPolicyId(policyId: string): Promise<void> {
     const ref = doc(db, "config", "config");
     await updateDoc(ref, { nftPolicyId: policyId });
   }
   ```

**Deliverable:** `config` Firestore collection with singleton document. `lib/firebase/config-store.ts` service functions committed.

---

#### Task S3-03 — Create the CIP-25 Metadata Builder Utility

**Estimated Time:** 1–2 hours

**Objective:** Build the function that constructs the CIP-25-compliant metadata object for each Scholar Badge NFT. This utility must produce the exact JSON structure that MeshJS and Cardano wallets expect.

**Detailed Steps:**
1. Create `lib/utils/metadataBuilder.ts`:
   ```ts
   /**
    * Builds a CIP-25 compliant NFT metadata object for a Scholar Badge.
    * CIP-25 Reference: https://github.com/cardano-foundation/CIPs/tree/master/CIP-0025
    *
    * @param policyId - The ForgeScript Policy ID for the minting session
    * @param assetName - Unique asset name (e.g., "ScholarBadge_JaneDoe_001")
    * @param scholarName - Scholar's full name from Firestore
    * @param course - Scholar's course from Firestore
    * @param ipfsUri - IPFS URI of the badge image
    */
   export function buildScholarBadgeMetadata(
     policyId: string,
     assetName: string,
     scholarName: string,
     course: string,
     ipfsUri: string
   ): object {
     return {
       "721": {
         [policyId]: {
           [assetName]: {
             name: `ScholarChain Badge — ${scholarName}`,
             image: ipfsUri,
             mediaType: "image/png",
             description: `Official Scholar ID · ${course}`,
             scholar: scholarName,
             course: course,
             issuer: "ScholarChain University",
             issuedAt: new Date().toISOString().split("T")[0], // YYYY-MM-DD
           },
         },
         version: 1,
       },
     };
   }

   /**
    * Generates a URL-safe, unique asset name for the NFT.
    * Example: "ScholarBadge_JaneDoe_1717891200000"
    */
   export function generateAssetName(scholarName: string): string {
     const sanitized = scholarName.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
     return `ScholarBadge_${sanitized}_${Date.now()}`;
   }
   ```
2. The `assetName` must be unique per mint — the timestamp suffix in `generateAssetName` ensures this.
3. The `name` field in CIP-25 is what Cardano wallet extensions display to users. Ensure it is human-readable.
4. Export from `lib/utils/index.ts`.

**Deliverable:** `lib/utils/metadataBuilder.ts` committed. Austine imports this in his minting function.

---

#### Task S3-04 — Update TypeScript Types for NFT Data

**Estimated Time:** 30 minutes

**Objective:** Extend the shared TypeScript types to include NFT metadata and the updated Scholar interface fields.

**Detailed Steps:**
1. Create `types/nft.ts`:
   ```ts
   export interface NFTMetadata {
     policyId: string;
     assetName: string;
     scholarName: string;
     course: string;
     imageIPFSUri: string;
     txHash?: string;
   }
   ```
2. Update `types/scholar.ts` — add `scholarTokenId?: string` field (already present from Increment 2 setup per Shervin's S2-04, confirm it's there).
3. Export `NFTMetadata` from `types/index.ts`.

**Deliverable:** `types/nft.ts` committed. Types barrel updated.

---

### 🪙 AUSTINE — NFT Minting Engine Lead {#austine}

**Domain:** Implement the MeshJS ForgeScript minting function, wire dynamic CIP-25 metadata from Firestore scholar data, add the "Mint Scholar ID" action to the Admin Dashboard, and handle the post-mint Firestore updates.

**Dependency:** Requires Shervin's S3-02 (config store with IPFS URI) and S3-03 (metadata builder).

**Working Branch:** `feature/nft-minting`

---

#### Task A3-01 — Build the `mintScholarNFT()` Core Function

**Estimated Time:** 3–4 hours

**Objective:** Implement the MeshJS transaction that forges a CIP-25 Scholar Badge NFT and sends it directly to the scholar's wallet address in a single transaction.

**Detailed Steps:**
1. Create `lib/mesh/mintNFT.ts`:
   ```ts
   import { Transaction, ForgeScript } from "@meshsdk/core";
   import { buildScholarBadgeMetadata, generateAssetName } from "@/lib/utils/metadataBuilder";
   import type { Scholar } from "@/types";

   export interface MintNFTResult {
     txHash: string;
     policyId: string;
     assetName: string;
   }

   /**
    * Mints a Scholar Badge NFT and sends it directly to the scholar's wallet.
    * Uses MeshJS ForgeScript to generate a Policy ID unique to this minting session.
    *
    * @param wallet - Connected Admin BrowserWallet
    * @param scholar - Scholar document from Firestore (provides name, course, walletAddress)
    * @param badgeIPFSUri - IPFS URI of the Scholar Badge image (from Firestore config)
    * @returns MintNFTResult containing txHash, policyId, and assetName
    */
   export async function mintScholarNFT(
     wallet: any,
     scholar: Scholar,
     badgeIPFSUri: string
   ): Promise<MintNFTResult> {
     if (!wallet) throw new Error("Wallet not connected.");
     if (!scholar.id) throw new Error("Scholar ID is required for minting.");

     // Step 1: Generate a unique asset name for this scholar's badge
     const assetName = generateAssetName(scholar.name);

     // Step 2: Create the ForgeScript — this generates the Policy ID
     // ForgeScript.withOneSignature creates a policy requiring the Admin's signature
     const forgingScript = ForgeScript.withOneSignature(
       await wallet.getPaymentPubKeyHash()
     );
     const policyId = forgingScript; // In MeshJS, the script IS the policy identifier

     // Step 3: Build CIP-25 metadata dynamically from scholar's Firestore data
     const metadata = buildScholarBadgeMetadata(
       typeof forgingScript === "string" ? forgingScript : JSON.stringify(forgingScript),
       assetName,
       scholar.name,
       scholar.course,
       badgeIPFSUri
     );

     // Step 4: Build the mint transaction
     const tx = new Transaction({ initiator: wallet });
     tx.mintAsset(forgingScript, {
       assetName,
       assetQuantity: "1",          // NFT: supply of exactly 1
       metadata,
       label: "721",                // CIP-25 label
       recipient: scholar.walletAddress,  // Sent directly to scholar's wallet
     });

     // Step 5: Build, sign, and submit
     const unsignedTx = await tx.build();
     const signedTx = await wallet.signTx(unsignedTx);
     const txHash = await wallet.submitTx(signedTx);

     return {
       txHash,
       policyId: typeof forgingScript === "string" ? forgingScript : JSON.stringify(forgingScript),
       assetName,
     };
   }
   ```
2. Add error handling for: wallet not connected, scholar wallet address invalid, metadata build failure, user cancels signing.
3. Note: MeshJS `ForgeScript.withOneSignature()` generates a **session-scoped** policy. For a production system, a time-locked or multi-sig policy would be used. For this MVP, single-signature is correct and demonstrates the concept.

**Deliverable:** `lib/mesh/mintNFT.ts` — fully functional NFT minting function.

---

#### Task A3-02 — Add "Mint Scholar ID" Button to Admin Dashboard

**Estimated Time:** 2–3 hours

**Objective:** Upgrade the Admin Dashboard Scholar Table to show a "Mint Scholar ID" button next to Pending scholars, separate from the "Send ADA" button (which appears for Approved scholars).

**Detailed Steps:**
1. Update `components/dashboard/ScholarTable.tsx` to accept a second action callback:
   ```tsx
   interface ScholarTableProps {
     scholars: Scholar[];
     onSend: (scholar: Scholar) => void;
     onMint: (scholar: Scholar) => void;         // NEW
     processingId: string | null;
     mintingId: string | null;                    // NEW — scholar currently being minted
   }
   ```
2. Update the Action column rendering logic:
   - `status === "Pending"` AND no `lastPaidTxHash`: show "Mint Scholar ID 🎖️" button → calls `onMint(scholar)`
   - `status === "Approved"` AND no `lastPaidTxHash`: show "Send ADA" button → calls `onSend(scholar)`
   - `status === "Approved"` AND `lastPaidTxHash` exists: show "Paid ✓" TxHashLink
   - `mintingId === scholar.id`: show minting spinner + "Minting NFT..." label
3. Show a second column "Scholar ID" that displays the `policyId` (truncated) if present, or "Not Minted" badge if absent.
4. Update `app/admin/page.tsx` to handle `handleMint`:
   ```tsx
   const handleMint = async (scholar: Scholar) => {
     if (!wallet || !scholar.id) return;
     setMintingId(scholar.id);
     try {
       const config = await getUniversityConfig();
       const result = await mintScholarNFT(wallet, scholar, config.badgeIPFSUri);
       // Post-mint: update Firestore
       await updateScholarStatus(scholar.id, "Approved");
       await updateScholarPolicyId(scholar.id, result.policyId, result.assetName);
       // Save policyId to global config if first mint
       if (!config.nftPolicyId) {
         await updateNftPolicyId(result.policyId);
       }
       refresh();
     } catch (err: any) {
       // Show per-row error
     } finally {
       setMintingId(null);
     }
   };
   ```

**Deliverable:** Admin Dashboard with "Mint Scholar ID" button operational. Pending scholars can be minted.

---

#### Task A3-03 — Implement Post-Mint Firestore Updates

**Estimated Time:** 1–2 hours

**Objective:** After a successful mint, update the Scholar's Firestore document with `policyId`, `scholarTokenId` (the NFT asset name), and flip `status` to `"Approved"`.

**Detailed Steps:**
1. Add `updateScholarPolicyId` to `lib/firebase/scholars.ts`:
   ```ts
   export async function updateScholarPolicyId(
     scholarId: string,
     policyId: string,
     scholarTokenId: string
   ): Promise<void> {
     const ref = doc(db, SCHOLARS_COLLECTION, scholarId);
     await updateDoc(ref, {
       policyId,
       scholarTokenId,
       status: "Approved",
       updatedAt: serverTimestamp(),
     });
   }
   ```
2. Call this function in `handleMint` in `app/admin/page.tsx` immediately after `mintScholarNFT()` returns successfully.
3. Handle the same resilience pattern as Increment 2: if the Firestore write fails after a successful mint, log the error and display a warning to the Admin showing the Policy ID and Asset Name so they can manually update the record.

**Deliverable:** `updateScholarPolicyId()` implemented. Scholar documents updated atomically after mint.

---

#### Task A3-04 — Display Mint TxHash in Admin Dashboard

**Estimated Time:** 1 hour

**Objective:** After minting, show the mint TxHash to the Admin as confirmation — the same pattern used for ADA payment TxHashes.

**Detailed Steps:**
1. Add `mintTxHash` to the row results state in the Admin Dashboard.
2. After a successful mint, display a brief inline success toast or row update: "Scholar ID Minted! 🎖️" with the mint TxHash as a `<TxHashLink />`.
3. The TxHash link opens Cardanoscan where the evaluator can verify: the NFT was created, its metadata contains the scholar's name and course, and it was sent to the scholar's wallet.

**Deliverable:** Mint TxHash displayed inline in the Scholar Table row after successful minting.

---

### 🎨 SHERIELYN — Scholar Portal UI & Wallet-Gate Lead {#sherielyn}

**Domain:** Build the Scholar Portal (`/scholar-portal`) with wallet connection UI, the two conditional states (authorized vs. denied), and the Scholar Dashboard content displayed to NFT holders.

**Dependency:** Requires Christian's NFT verification logic (Task C3-01) to fully wire up, but the UI shell can be built with mock `isAuthorized` state from Day 1.

**Working Branch:** `feature/scholar-portal`

---

#### Task SH3-01 — Build the Scholar Portal Route and Wallet-Connect Entry Point

**Estimated Time:** 2–3 hours

**Objective:** Create the `/scholar-portal` page with a prominent "Connect Wallet to Login" entry point — replacing the traditional username/password form with a single blockchain authentication step.

**Detailed Steps:**
1. Create `app/scholar-portal/page.tsx`.
2. The page has **three visual states** controlled by `portalState`:
   - `"disconnected"` — Show the connect wallet CTA
   - `"scanning"` — Show a scanning animation while `getAssets()` runs
   - `"authorized"` — Show the Scholar Dashboard
   - `"denied"` — Show the Access Denied screen
3. Build the `"disconnected"` state:
   ```tsx
   <div className="flex flex-col items-center justify-center min-h-screen gap-6">
     <div className="text-6xl">🎓</div>
     <h1 className="text-3xl font-bold">Scholar Portal</h1>
     <p className="text-gray-400 text-center max-w-md">
       This portal is exclusively for verified ScholarChain scholars.
       Connect your Cardano wallet to authenticate with your Scholar Badge NFT.
     </p>
     <CardanoWallet />
     <p className="text-xs text-gray-600">
       Don't have a Scholar Badge? Contact your institution's admin.
     </p>
   </div>
   ```
4. Add a `useEffect` that triggers the NFT scan (Christian's function) when `connected` changes from `false` to `true`.
5. Ensure this page uses `MeshProvider` context (it's already available from the root layout).

**Deliverable:** `app/scholar-portal/page.tsx` with wallet-connect entry point and state machine skeleton.

---

#### Task SH3-02 — Build the "Access Denied" Component

**Estimated Time:** 1 hour

**Objective:** Create a clear, professional access denied screen shown to wallets that do not contain a valid Scholar Badge NFT.

**Detailed Steps:**
1. Create `components/wallet/AccessDenied.tsx`:
   ```tsx
   export default function AccessDenied() {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen gap-4">
         <div className="w-24 h-24 rounded-full bg-red-900 flex items-center justify-center text-4xl">🚫</div>
         <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
         <p className="text-gray-400 text-center max-w-sm">
           No valid Scholar Badge NFT was found in this wallet.
         </p>
         <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-500 max-w-sm">
           <p className="font-semibold text-gray-400 mb-2">This portal requires:</p>
           <ul className="list-disc list-inside space-y-1">
             <li>A ScholarChain official Scholar Badge NFT</li>
             <li>Issued by your institution's administrator</li>
             <li>Present in the connected wallet</li>
           </ul>
         </div>
         <button
           onClick={() => window.location.reload()}
           className="text-sm text-blue-400 underline">
           Try a different wallet
         </button>
       </div>
     );
   }
   ```
2. Show the connected wallet address (truncated) on the denied screen so students know which wallet was checked.
3. Add a link to contact the institution's admin.

**Deliverable:** `components/wallet/AccessDenied.tsx` committed.

---

#### Task SH3-03 — Build the Scholar Dashboard (Authorized State)

**Estimated Time:** 2–3 hours

**Objective:** Create the Scholar's private dashboard, displayed only when NFT ownership is verified. Shows their profile data from Firestore and their live on-chain ADA balance.

**Detailed Steps:**
1. Create `components/dashboard/ScholarDashboard.tsx`:
   - Props: `scholar: Scholar` (Firestore data), `walletBalance: string` (live from `wallet.getBalance()`)
2. Dashboard sections:
   - **Header:** Scholar's name, "Verified Scholar 🎖️" badge, connected wallet address (truncated)
   - **Scholar Info Card:** Course, Enrollment Status ("Approved"), Scholar Token ID (NFT asset name)
   - **Wallet Card:** Live tADA balance with a Preprod Testnet badge, last payment TxHash (if exists)
   - **NFT Badge Card:** Display the Scholar Badge — embed the IPFS image URI: `<img src={scholar.policyId ? "https://ipfs.io/ipfs/..." : "/badge-placeholder.png"} />`
   - **[Coming in Increment 4]:** Achievement submission section (placeholder card with "Coming Soon" state)
3. Add a logout mechanism: a "Disconnect Wallet" button that disconnects the wallet via MeshJS's `disconnect()` method and resets `portalState` to `"disconnected"`.

**Deliverable:** `components/dashboard/ScholarDashboard.tsx` — the authenticated scholar's home screen.

---

#### Task SH3-04 — Add the NFT Scanning State UI

**Estimated Time:** 1 hour

**Objective:** Show a professional scanning animation while `wallet.getAssets()` runs (this call can take 1–5 seconds on Preprod).

**Detailed Steps:**
1. Create `components/wallet/NFTScanningState.tsx`:
   ```tsx
   export default function NFTScanningState() {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen gap-4">
         <div className="relative w-20 h-20">
           <div className="w-20 h-20 border-4 border-brand border-t-transparent rounded-full animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center text-2xl">🎖️</div>
         </div>
         <h2 className="text-xl font-semibold">Scanning Wallet</h2>
         <p className="text-gray-400 text-sm">Checking for your Scholar Badge NFT...</p>
       </div>
     );
   }
   ```
2. This is shown for the `"scanning"` portal state — between wallet connection and the authorize/deny decision.

**Deliverable:** `components/wallet/NFTScanningState.tsx` committed.

---

### 🔐 CHRISTIAN — NFT Verification & Auth Logic Lead {#christian}

**Domain:** Implement the `wallet.getAssets()` NFT ownership scan, the Policy ID verification filter, and the complete Scholar Portal authentication state machine that connects wallet state to UI rendering.

**Dependency:** Requires Shervin's S3-02 (Firestore config with `nftPolicyId`) to run the live check. Can build and test with a hardcoded Policy ID during development.

**Working Branch:** `feature/nft-verification`

---

#### Task C3-01 — Build the `verifyScholarBadge()` Function

**Estimated Time:** 2–3 hours

**Objective:** The core security function of the Scholar Portal. Scans the connected wallet's assets and returns whether a valid Scholar Badge (matching the University's Policy ID) is present.

**Detailed Steps:**
1. Create `lib/mesh/verifyNFTOwnership.ts`:
   ```ts
   import { getUniversityConfig } from "@/lib/firebase/config-store";

   export interface VerificationResult {
     isAuthorized: boolean;
     matchedAsset: { policyId: string; assetName: string } | null;
   }

   /**
    * Scans the connected wallet for a Scholar Badge NFT matching the University's Policy ID.
    * The University Policy ID is fetched from Firestore config — not hardcoded.
    *
    * @param wallet - Connected BrowserWallet instance from MeshJS
    * @returns VerificationResult with authorization status and matched asset details
    */
   export async function verifyScholarBadge(wallet: any): Promise<VerificationResult> {
     if (!wallet) return { isAuthorized: false, matchedAsset: null };

     // Fetch the University's official Policy ID from Firestore
     const config = await getUniversityConfig();
     const universityPolicyId = config.nftPolicyId;

     if (!universityPolicyId) {
       console.warn("University NFT Policy ID not yet set in Firestore config.");
       return { isAuthorized: false, matchedAsset: null };
     }

     // Scan the wallet for ALL assets (tokens, NFTs)
     const assets = await wallet.getAssets();

     // Filter for assets whose policyId matches the University's official seal
     const scholarBadge = assets.find(
       (asset: { policyId: string }) => asset.policyId === universityPolicyId
     );

     if (scholarBadge) {
       return { isAuthorized: true, matchedAsset: scholarBadge };
     }

     return { isAuthorized: false, matchedAsset: null };
   }
   ```
2. **Security invariant:** `isAuthorized` defaults to `false`. A wallet without the badge always returns denied.
3. **Fake NFT test:** A wallet containing an NFT with a different `policyId` returns `isAuthorized: false`. The University's Policy ID is the only accepted value.

**Deliverable:** `lib/mesh/verifyNFTOwnership.ts` — the cryptographic authentication gate.

---

#### Task C3-02 — Build the `useNFTVerification` Hook

**Estimated Time:** 1–2 hours

**Objective:** Create a React hook that orchestrates the wallet connection event, triggers the NFT scan, and manages the `portalState` for Sherielyn's Scholar Portal UI.

**Detailed Steps:**
1. Create `hooks/useNFTVerification.ts`:
   ```ts
   "use client";
   import { useState, useEffect } from "react";
   import { useWallet } from "@meshsdk/react";
   import { verifyScholarBadge } from "@/lib/mesh/verifyNFTOwnership";

   export type PortalState = "disconnected" | "scanning" | "authorized" | "denied";

   export function useNFTVerification() {
     const { wallet, connected } = useWallet();
     const [portalState, setPortalState] = useState<PortalState>("disconnected");
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
       if (!connected || !wallet) {
         setPortalState("disconnected");
         return;
       }
       // Wallet just connected — begin NFT scan
       setPortalState("scanning");
       const runVerification = async () => {
         try {
           const result = await verifyScholarBadge(wallet);
           setPortalState(result.isAuthorized ? "authorized" : "denied");
         } catch (err: any) {
           setError(err.message ?? "Verification failed");
           setPortalState("denied");
         }
       };
       runVerification();
     }, [connected, wallet]);

     return { portalState, error };
   }
   ```
2. Export from `hooks/index.ts`.
3. Provide this hook to Sherielyn — she imports it in `app/scholar-portal/page.tsx` and drives all UI rendering from `portalState`.

**Deliverable:** `hooks/useNFTVerification.ts` — the authentication state machine hook.

---

#### Task C3-03 — Fetch Scholar Profile Data After Authorization

**Estimated Time:** 1–2 hours

**Objective:** Once `isAuthorized === true`, look up the Scholar's Firestore profile by their connected wallet address, so the Scholar Dashboard can display their name, course, and payment history.

**Detailed Steps:**
1. Add a new Firestore service function to `lib/firebase/scholars.ts`:
   ```ts
   export async function getScholarByWalletAddress(walletAddress: string): Promise<Scholar | null> {
     const q = query(
       collection(db, SCHOLARS_COLLECTION),
       where("walletAddress", "==", walletAddress)
     );
     const snapshot = await getDocs(q);
     if (snapshot.empty) return null;
     const doc = snapshot.docs[0];
     return { id: doc.id, ...doc.data() } as Scholar;
   }
   ```
2. In `hooks/useNFTVerification.ts`, after `isAuthorized` is confirmed, call `getScholarByWalletAddress(await wallet.getChangeAddress())` and return the scholar data alongside the portal state.
3. Pass the scholar data to Sherielyn's `<ScholarDashboard />` component as a prop.

**Deliverable:** Scholar profile loaded from Firestore after NFT verification. Scholar Dashboard populated with real data.

---

#### Task C3-04 — Security Hardening: Edge Cases and Bypass Attempts

**Estimated Time:** 1 hour

**Objective:** Document and test against all realistic bypass attempts to ensure the NFT gate is robust.

**Detailed Steps:**
Test and document results for each scenario in `docs/nft-security-cases.md`:

| Scenario | Expected Behavior |
|---|---|
| Wallet with valid University NFT | `isAuthorized = true` → Scholar Dashboard shown |
| Wallet with NO NFTs at all | `isAuthorized = false` → Access Denied shown |
| Wallet with NFTs from different policy (e.g., a random NFT) | `isAuthorized = false` → Access Denied shown |
| Wallet with MULTIPLE NFTs including the correct one | `isAuthorized = true` → authorized (badge found in array) |
| University Policy ID not yet set in Firestore config | `isAuthorized = false` → Access Denied + warning logged |
| `wallet.getAssets()` throws an error | `isAuthorized = false` → Access Denied + error message shown |
| User transfers their Scholar Badge to another wallet, tries to login | `isAuthorized = false` → Access Denied (badge no longer in original wallet) |

**Deliverable:** `docs/nft-security-cases.md` committed. All scenarios tested by Jamiel in Task J3-02.

---

### 🧪 JAMIEL — QA, NFT Integrity & Demo Lead {#jamiel}

**Domain:** Verify NFT metadata accuracy on-chain, test all Scholar Portal access scenarios, and prepare the Increment 3 demo that showcases the full flow from minting to wallet-gated login.

**Working Branch:** `feature/qa-increment-3`

---

#### Task J3-01 — Prepare NFT Testing Wallets

**Estimated Time:** 1 hour

**Objective:** Set up the additional wallets needed to test NFT ownership scenarios, including a "non-scholar" wallet for access denied testing.

**Detailed Steps:**
1. Using the existing Preprod wallet setup from Increment 1:
   - **Admin Wallet** — already set up; will perform minting
   - **Scholar Wallet A** — will receive the minted NFT; used for authorized access test
   - **Non-Scholar Wallet** — create a NEW wallet with NO ScholarChain NFTs; used to test Access Denied
2. Note the Eternl wallet extension can manage multiple wallets — switch between them during testing.
3. Ensure Scholar Wallet A has at least 2 tADA (needed to hold UTxO with the NFT).

**Deliverable:** Three configured Preprod wallets documented. Non-Scholar wallet confirmed to have zero ScholarChain NFTs.

---

#### Task J3-02 — Execute NFT Integrity and Portal Access Tests

**Estimated Time:** 3–4 hours

**Objective:** Comprehensive test coverage for all Increment 3 functionality.

**Detailed Steps:**
Create and execute `docs/increment-3-test-plan.md`:

**Section 1: NFT Minting**

| ID | Test Case | Expected Result |
|---|---|---|
| NFT-01 | Mint Scholar ID happy path | NFT sent to scholar wallet, TxHash returned |
| NFT-02 | Verify NFT metadata on Cardanoscan | Name, course, IPFS image URI visible on explorer |
| NFT-03 | Verify NFT metadata in Eternl wallet | Badge visible with correct name in wallet UI |
| NFT-04 | Scholar Firestore doc updated post-mint | `status: "Approved"`, `policyId`, `scholarTokenId` set |
| NFT-05 | IPFS badge image resolves | Click image URI from Cardanoscan → image loads |
| NFT-06 | Admin cancels mint signing | Friendly error, no Firestore update, no TxHash |

**Section 2: Scholar Portal — Access Scenarios**

| ID | Test Case | Expected Result |
|---|---|---|
| PORTAL-01 | Scholar Wallet A (has NFT) connects | Authorized → Scholar Dashboard shown |
| PORTAL-02 | Non-Scholar Wallet (no NFT) connects | Access Denied screen shown |
| PORTAL-03 | Admin Wallet (no scholar NFT) connects | Access Denied screen shown |
| PORTAL-04 | Scholar Dashboard shows correct name + course | Data matches Firestore document |
| PORTAL-05 | Scholar Dashboard shows live tADA balance | Balance matches Eternl wallet balance |
| PORTAL-06 | Disconnect and reconnect Scholar wallet | Re-scan runs, authorized again |
| PORTAL-07 | Fake NFT wallet (different policyId) | Access Denied — Policy ID mismatch |

**Section 3: Regression Tests (Increments 1 & 2)**

| ID | Test Case | Expected Result |
|---|---|---|
| REG-01 | ADA payment flow still works | Send ADA from Admin → TxHash returned |
| REG-02 | Scholar application form still writes to Firestore | New document created with status "Pending" |
| REG-03 | Admin Dashboard table still loads approved scholars | Table renders with Scholar rows |

**Deliverable:** Fully executed test plan. All 16+ cases marked pass/fail. Bugs filed as GitHub Issues.

---

#### Task J3-03 — Verify NFT Metadata On-Chain

**Estimated Time:** 1 hour

**Objective:** Independently confirm that the minted NFT's metadata matches what was built dynamically from the scholar's Firestore data — proving the system works as designed.

**Detailed Steps:**
1. After Test NFT-01, copy the mint TxHash.
2. Navigate to `https://preprod.cardanoscan.io/transaction/{txHash}`.
3. In the "Metadata" tab, confirm the CIP-25 JSON structure:
   - `721` > `{policyId}` > `{assetName}` > `scholar` field = exact scholar name from Firestore
   - `course` field = exact course from Firestore
   - `image` field = the IPFS URI from Pinata
   - `version: 1` present
4. Navigate to Cardanoscan's token page for the minted NFT. Confirm the IPFS image renders.
5. Screenshot the metadata view and the rendered NFT image. Add to `docs/nft-verification-screenshots/`.

**Deliverable:** Screenshot evidence of on-chain NFT metadata matching Firestore data.

---

#### Task J3-04 — Prepare and Rehearse the Increment 3 Demo Script

**Estimated Time:** 2 hours

**Objective:** Create and rehearse a demo script showcasing the full "Mint → Wallet Scan → Authorized Access" flow.

**Detailed Steps:**
Create `docs/increment-3-demo-script.md` with the full scene sequence:

**Pre-Demo Setup additions:**
- [ ] Two Chrome windows open: Window 1 = Admin Dashboard, Window 2 = Scholar Portal
- [ ] Scholar Wallet A set up in Eternl (will receive the NFT)
- [ ] Non-Scholar Wallet ready in Eternl for the "denied" demo
- [ ] Pending scholar in Firestore ready to be minted

**Key Demo Scenes:**
1. Show Pending scholar in Admin Dashboard — "No badge yet."
2. Click "Mint Scholar ID." Sign in Eternl. Wait for TxHash. Show TxHash on Cardanoscan with metadata.
3. Switch to Scholar Portal (Window 2). Connect Non-Scholar Wallet → show Access Denied.
4. Switch Eternl to Scholar Wallet A (the one that just received the NFT). Connect. Show scanning state. Show authorized Scholar Dashboard with name and course.
5. *"The NFT in this student's wallet IS their password. No database lookup. No JWT token. Pure blockchain cryptography."*

**Deliverable:** Rehearsed demo script. Team dry-run completed at least once.

---

## 6. Parallel Development Strategy & Dependency Map {#parallel}

```
DAY 1                          DAY 2                        DAY 3-4
─────────────────────────────────────────────────────────────────────────
SHERVIN
  S3-01: IPFS Upload ───────────►│
  S3-02: Config Store ───────────►│ IPFS URI + config available
  S3-03: Metadata Builder ────────►│
  S3-04: TypeScript Types ────────►│

AUSTINE                          │
  (waits for S3-01, S3-02, S3-03)├── A3-01: mintScholarNFT() ──► A3-02: Mint Button ──► A3-03: Post-Mint DB ──► A3-04: Mint TxHash Display

SHERIELYN                        │
  (can build UI shell with mocks) ├── SH3-01: Portal Route ────► SH3-02: Access Denied ──► SH3-03: Scholar Dashboard ──► SH3-04: Scanning State

CHRISTIAN                        │
  (waits for S3-02 for live test) ├── C3-01: verifyScholarBadge() ──► C3-02: useNFTVerification() ──► C3-03: Fetch Scholar Profile ──► C3-04: Security Hardening

JAMIEL                           │
  J3-01: Wallet Setup ───────────►│                          J3-02: Test Execution ─────────────────────────────► J3-03: NFT Metadata Verify ──► J3-04: Demo Script
─────────────────────────────────────────────────────────────────────────
```

---

## 7. Integration Checklist {#integration}

- [ ] IPFS URI stored in Firestore `config` document — not hardcoded in code
- [ ] University Policy ID stored in Firestore `config.nftPolicyId` after first mint
- [ ] `mintScholarNFT()` uses `badgeIPFSUri` from Firestore config (not hardcoded)
- [ ] CIP-25 metadata `scholar` and `course` fields populated from Firestore Scholar document
- [ ] NFT `assetQuantity` is exactly `"1"` in all minting code
- [ ] `verifyScholarBadge()` reads `nftPolicyId` from Firestore — not from a `.env` variable
- [ ] `isAuthorized` defaults to `false` in all code paths
- [ ] Scholar Portal does not render dashboard content before `isAuthorized === true`
- [ ] Scholar profile fetched by wallet address after authorization (not by scholar ID)
- [ ] All 19+ test cases in `docs/increment-3-test-plan.md` marked ✅
- [ ] NFT metadata screenshot showing correct `scholar` and `course` fields on Cardanoscan

---

## 8. Branch & Git Strategy {#git}

```
main (protected)
  ├── feature/nft-infrastructure    (Shervin)
  ├── feature/nft-minting           (Austine)
  ├── feature/scholar-portal        (Sherielyn)
  ├── feature/nft-verification      (Christian)
  └── feature/qa-increment-3        (Jamiel)
```

### Recommended Merge Order
1. Shervin: `feature/nft-infrastructure` (types, config, metadata builder — unblocks all)
2. Sherielyn: `feature/scholar-portal` (UI only, no blockchain dependency)
3. Christian: `feature/nft-verification` (verification logic + hook)
4. Austine: `feature/nft-minting` (minting engine + dashboard update — largest, last)
5. Jamiel: `feature/qa-increment-3` (docs only)

---

## 9. Daily Standup Template {#standup}

```
👤 [Name] — [Date] — Increment 3

✅ DONE: [Task ID + description]
🔨 DOING: [Current focus]
🚧 BLOCKED: [Blocker + who can resolve]
📢 NEEDS FROM TEAM: [Coordination needed]
```

---

## 10. Risk Register {#risks}

| ID | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R3-01 | MeshJS ForgeScript API changed in latest version | Medium | High | Pin MeshJS version; test minting in isolation before wiring to UI | Austine |
| R3-02 | Pinata IPFS link doesn't render in Cardano wallets | Low | Medium | Test IPFS URI via `https://ipfs.io/ipfs/` gateway before using in metadata | Shervin |
| R3-03 | Scholar Wallet A doesn't have enough UTxO to receive NFT | Low | Medium | Ensure Scholar Wallet has at least 2 tADA before minting (NFT must attach to a UTxO) | Jamiel |
| R3-04 | Policy ID not saved to Firestore config after first mint | Medium | High | `updateNftPolicyId()` called in `handleMint` — implement resilience fallback showing Policy ID to Admin | Austine |
| R3-05 | `wallet.getAssets()` returns empty array on Preprod despite NFT existing | Medium | Medium | Preprod indexer can lag 30-60s — add retry logic or instruct user to wait 1 minute | Christian |
| R3-06 | CIP-25 metadata format rejected by Cardano | Low | High | Validate against CIP-25 spec before submission; test with a known working metadata structure | Shervin/Austine |

---

*Document Version: 1.0 · ScholarChain Team · Approved for Execution ✅*
