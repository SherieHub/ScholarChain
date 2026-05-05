# ScholarChain — Increment 2: The Dual Registry

> **Central Execution Contract · Team of 5 · Parallel Development Strategy**
> Builds directly on Increment 1. All Increment 1 code must be merged to `main` before this increment begins.
> Last Updated: May 2026 · Status: 🟡 In Progress

---

## 📋 Table of Contents

1. [Increment Objective & Scope](#objective)
2. [Definition of Done](#done)
3. [Technical Constraints](#constraints)
4. [Phase Execution Plan](#phases)
5. [Team Task Distribution](#tasks)
   - [Shervin — Firebase DevOps & Integration Lead](#shervin)
   - [Austine — Admin Dashboard Architecture](#austine)
   - [Sherielyn — Public-Facing Forms & UI](#sherielyn)
   - [Christian — Blockchain-to-Database Bridge](#christian)
   - [Jamiel — QA, Data Integrity & Demo Lead](#jamiel)
6. [Parallel Development Strategy & Dependency Map](#parallel)
7. [Integration Checklist](#integration)
8. [Branch & Git Strategy](#git)
9. [Daily Standup Template](#standup)
10. [Risk Register](#risks)

---

## 1. Increment Objective & Scope {#objective}

### Goal
Introduce an off-chain data layer (Firebase Firestore) that persists Scholar applications and Sponsor pledges, and upgrade the Admin Dashboard so it dynamically fetches Approved Scholars from the database — replacing the blank manual-input fields from Increment 1 with a live, data-driven scholar table where each row has its own Send ADA button.

### Elevator Pitch
> *"By the end of this increment, a student can submit their application via a public form, that data lands in a real database, the Admin opens their dashboard, sees a live table of approved scholars, clicks 'Send ADA' next to a student's name, signs the transaction, and the student's record is automatically updated with the TxHash proof of payment."*

### What Changes from Increment 1

| Increment 1 | Increment 2 |
|---|---|
| Admin manually types recipient address | Address automatically fetched from Firebase scholar record |
| No data persistence | Firebase Firestore stores Scholar + Sponsor data |
| Single blank payment form | Dynamic table of scholars — one Send button per row |
| No application flow | Public `/apply` route for students to submit applications |
| No sponsor tracking | Public `/sponsor-entry` route for pledge submissions |
| No payment history | `LastPaidTxHash` written back to Firestore on success |

### Strict Scope Boundaries

| ✅ IN SCOPE | ❌ OUT OF SCOPE |
|---|---|
| Firebase Firestore setup (2 collections: `scholars`, `sponsors`) | NFT minting (Increment 3) |
| Public Scholar Application Form (`/apply`) | Firebase Authentication / login systems |
| Public Sponsor Entry Form (`/sponsor-entry`) | Token minting (Increment 4) |
| Admin Dashboard: dynamic Scholar table | Transparency Dashboard (Increment 5) |
| Admin manually sets scholar `status` to "Approved" in Firebase Console | Automated approval workflows |
| `SendADA` button per Scholar row (using Increment 1 MeshJS logic) | Role-based access control |
| Writing `LastPaidTxHash` back to Firestore after payment | Real-time Firestore listeners (polling is fine for MVP) |
| `PaidAt` timestamp update | Email/SMS notifications |

---

## 2. Definition of Done {#done}

Increment 2 is **complete and demonstrable** when ALL of the following are true:

- [ ] Firebase project created, Firestore enabled, and SDK credentials in `.env.local`
- [ ] A student can visit `/apply`, fill the form, submit, and their data appears in Firestore with `status: "Pending"`
- [ ] A sponsor can visit `/sponsor-entry`, fill the form, submit, and their data appears in the `sponsors` Firestore collection
- [ ] The Admin Dashboard fetches and renders a table of scholars where `status === "Approved"` (set manually in Firebase Console for demo)
- [ ] Each Scholar row displays: Name, Course, truncated Wallet Address, Status badge, and a "Send ADA" button
- [ ] Clicking "Send ADA" on a row uses **that scholar's wallet address from Firestore** (not a typed address) to build the MeshJS transaction
- [ ] On successful transaction, `LastPaidTxHash` is written back to the scholar's Firestore document
- [ ] The "Send ADA" button for a paid scholar changes to a "Paid ✓" state with a TxHash link
- [ ] All Increment 1 functionality still works (no regressions)
- [ ] All code merged to `main` via reviewed PRs
- [ ] Live demo runnable in under 7 minutes

---

## 3. Technical Constraints {#constraints}

| # | Constraint | Reason |
|---|---|---|
| C-01 | Scholar `walletAddress` field from Firestore must be used directly in `sendADA()` — no copy-pasting | Eliminates transcription errors; validates the DB-driven architecture |
| C-02 | Firestore writes must never be called client-side with exposed Admin credentials | Use standard Firebase SDK with public config; security rules protect sensitive ops |
| C-03 | `status` field must be a strict enum: `"Pending"` \| `"Approved"` \| `"Rejected"` | Prevents inconsistent strings breaking the Admin Dashboard filter |
| C-04 | `LastPaidTxHash` must only be written **after** a TxHash is confirmed (not optimistically) | Avoids marking a scholar as paid before the transaction is final |
| C-05 | The public `/apply` and `/sponsor-entry` routes must be accessible **without** wallet connection | Students and sponsors don't hold Cardano wallets at this stage |
| C-06 | All Firestore document writes must use server-side Timestamp (`serverTimestamp()`) for `createdAt` | Prevents clock skew from client machines |
| C-07 | Sponsor `pledgedAmount` must be stored as a **Number**, not a string | Required for summation in Increment 5's Transparency Dashboard |
| C-08 | Firebase config keys that use `NEXT_PUBLIC_` prefix are acceptable — they are non-secret project identifiers, not API secrets | Firebase security is enforced by Firestore security rules, not by hiding the config |

---

## 4. Phase Execution Plan {#phases}

```
Phase 1: Firebase Setup & Configuration        [Day 1]       → Shervin leads
Phase 2: Firestore Service Layer               [Day 1-2]     → Austine leads
Phase 3: Public-Facing Forms                   [Day 1-2]     → Sherielyn leads
Phase 4: Admin Dashboard Upgrade               [Day 2-3]     → Christian leads
Phase 5: QA, Data Integrity & Demo             [Day 3-4]     → Jamiel leads
```

### Phase 1 — Firebase Setup & Configuration
Initialize the Firebase project, configure Firestore collections, and provide the SDK configuration to the team so all subsequent work can connect to a real database.

### Phase 2 — Firestore Service Layer
Build the typed TypeScript service functions that abstract all Firestore read/write operations. These are the "data access layer" — all components call these functions, never raw Firestore SDK calls.

### Phase 3 — Public-Facing Forms
Build the two public routes: the Scholar Application Form and the Sponsor Entry Form. These write to Firestore and require no wallet connection.

### Phase 4 — Admin Dashboard Upgrade
Replace the static payment form from Increment 1 with a dynamic table that fetches Approved Scholars from Firestore. Wire the "Send ADA" button to use the scholar's Firestore wallet address and write back the TxHash on success.

### Phase 5 — QA, Data Integrity & Demo
Validate the full end-to-end data flow from student form submission → database → Admin dashboard → blockchain transaction → database update. Prepare the upgraded demo script.

---

## 5. Team Task Distribution {#tasks}

---

### 🔧 SHERVIN — Firebase DevOps & Integration Lead {#shervin}

**Domain:** Firebase project provisioning, Firestore schema initialization, environment variable distribution, and security rules configuration. Shervin's output unblocks Austine, Sherielyn, and Christian simultaneously.

**Priority:** 🔴 CRITICAL PATH — Tasks S2-01 and S2-02 must complete before others can write Firestore code.

**Working Branch:** `feature/firebase-setup`

---

#### Task S2-01 — Create and Configure the Firebase Project

**Estimated Time:** 1–2 hours

**Objective:** Provision the Firebase project that will serve as ScholarChain's off-chain database for Increments 2–5.

**Detailed Steps:**
1. Navigate to [console.firebase.google.com](https://console.firebase.google.com). Click **Add project**.
2. Name the project `scholarchain-dev`. Disable Google Analytics (not needed). Create project.
3. Once created, go to **Build → Firestore Database**. Click **Create database**.
   - Select **Start in test mode** (allows all reads/writes during development — will be locked down later).
   - Choose the region closest to your team (e.g., `asia-southeast1` for Cebu-based team).
4. Inside Firestore, manually create the two primary collections by adding placeholder documents:
   - **`scholars` collection:** Add a document with fields: `name` (string), `course` (string), `walletAddress` (string), `status` (string: `"Approved"`), `createdAt` (timestamp). Use your own test data. This placeholder makes the collection visible and allows the dashboard to render at least one row immediately.
   - **`sponsors` collection:** Add a document with fields: `sponsorName` (string), `pledgedAmount` (number: `5000`), `createdAt` (timestamp).
5. Go to **Project Settings → Your Apps**. Click the web app icon (`</>`). Register the app as `scholar-chain-web`.
6. Copy the Firebase config object and populate `.env.local`:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=scholarchain-dev.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=scholarchain-dev
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=scholarchain-dev.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```
7. Share the populated `.env.local` values with the full team via a secure channel (not Git). Update `.env.example` with the key names (empty values).

**Deliverable:** Live Firebase project with two seeded collections. `.env.local` distributed to all team members.

---

#### Task S2-02 — Install Firebase SDK and Create the Config Module

**Estimated Time:** 1 hour

**Objective:** Install the Firebase npm package and create the singleton initialization module so all service functions connect to the same Firestore instance.

**Detailed Steps:**
1. Install the Firebase SDK:
   ```bash
   npm install firebase
   ```
2. Create `lib/firebase/config.ts`:
   ```ts
   import { initializeApp, getApps, getApp } from "firebase/app";
   import { getFirestore } from "firebase/firestore";

   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
   };

   // Prevent multiple Firebase app initializations in Next.js hot-reload
   const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
   export const db = getFirestore(app);
   ```
3. The `getApps().length === 0` guard is **critical** for Next.js — without it, hot-reloading triggers "Firebase app already initialized" errors during development.
4. Test the connection by importing `db` in a throwaway component and calling `getDocs(collection(db, "scholars"))`. Confirm it returns the placeholder document from Task S2-01.

**Deliverable:** `lib/firebase/config.ts` committed. Firebase SDK installed. All team members can import `db` and query Firestore.

---

#### Task S2-03 — Configure Firestore Security Rules

**Estimated Time:** 1–2 hours

**Objective:** Write security rules that protect the database while allowing the application's intended access patterns. Test mode (allow all) is acceptable for Day 1 but must be replaced before the demo.

**Detailed Steps:**
1. In the Firebase Console, go to **Firestore → Rules**. Replace the default rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       // Scholars: public can CREATE (apply), anyone can READ (admin dashboard)
       // Only allow UPDATE for specific fields (status updates via console for Inc 2)
       match /scholars/{scholarId} {
         allow read: true;
         allow create: if request.resource.data.keys()
           .hasAll(['name', 'course', 'walletAddress', 'status', 'createdAt'])
           && request.resource.data.status == 'Pending';
         allow update: if true; // Relaxed for Inc 2 — tightened in Inc 3+
         allow delete: if false;
       }

       // Sponsors: public can CREATE, anyone can READ (for Transparency Dashboard later)
       match /sponsors/{sponsorId} {
         allow read: true;
         allow create: if request.resource.data.keys()
           .hasAll(['sponsorName', 'pledgedAmount', 'createdAt'])
           && request.resource.data.pledgedAmount is number;
         allow update, delete: if false;
       }
     }
   }
   ```
2. Click **Publish**.
3. Test the rules using the Firebase Console's **Rules Playground**:
   - Simulate a `create` on `scholars` with all required fields → should allow.
   - Simulate a `create` on `scholars` with `status: "Approved"` → should deny.
   - Simulate a `delete` on `scholars` → should deny.
4. Share the rules with the team so they understand what operations are permitted.

**Deliverable:** Firestore security rules published and tested. Team informed of access patterns allowed.

---

#### Task S2-04 — Create TypeScript Type Definitions for Firestore Documents

**Estimated Time:** 1 hour

**Objective:** Define the shared TypeScript interfaces for Scholar and Sponsor documents that the entire team will use, preventing type mismatches between what's written to and read from Firestore.

**Detailed Steps:**
1. Create `types/scholar.ts`:
   ```ts
   import { Timestamp } from "firebase/firestore";

   export type ScholarStatus = "Pending" | "Approved" | "Rejected";

   export interface Scholar {
     id?: string;            // Firestore auto-ID (added after fetch)
     name: string;
     course: string;
     walletAddress: string;
     status: ScholarStatus;
     policyId?: string;      // Populated in Increment 3
     lastPaidTxHash?: string;
     paidAt?: Timestamp;
     createdAt: Timestamp;
     updatedAt: Timestamp;
   }
   ```
2. Create `types/sponsor.ts`:
   ```ts
   import { Timestamp } from "firebase/firestore";

   export interface Sponsor {
     id?: string;
     sponsorName: string;
     pledgedAmount: number;
     createdAt: Timestamp;
   }
   ```
3. Export both from `types/index.ts`:
   ```ts
   export type { Scholar, ScholarStatus } from "./scholar";
   export type { Sponsor } from "./sponsor";
   ```
4. Distribute to all team members — Austine, Sherielyn, and Christian must import from `@/types` for all Firestore-related work.

**Deliverable:** `types/scholar.ts`, `types/sponsor.ts`, `types/index.ts` committed. All team members using consistent types.

---

#### Task S2-05 — Add Firebase to the `README.md` Setup Instructions

**Estimated Time:** 30 minutes

**Objective:** Update the project README so new team members and evaluators can replicate the Firebase setup independently.

**Detailed Steps:**
1. Add a **Firebase Setup** section to `README.md` with:
   - Link to Firebase Console
   - Steps to create a project and enable Firestore
   - Screenshot of the Firestore collections structure (take one from the Console)
   - List of required `.env.local` keys
   - Note: "For the demo, manually set one Scholar's `status` to `Approved` in the Firebase Console to populate the Admin Dashboard"
2. Add a **Firestore Collections Reference** table showing collection names, document fields, and types.

**Deliverable:** Updated `README.md` committed.

---

### 🏗️ AUSTINE — Admin Dashboard Architecture Lead {#austine}

**Domain:** Build the Firestore service layer (data access functions) and upgrade the Admin Dashboard to display a live, dynamic scholar table. Austine owns the data pipeline from Firestore → React state → Admin UI.

**Dependency:** Requires Shervin's S2-01 (Firebase project), S2-02 (SDK installed), and S2-04 (types defined).

**Working Branch:** `feature/admin-dashboard-v2`

---

#### Task A2-01 — Build the Scholars Firestore Service

**Estimated Time:** 2–3 hours

**Objective:** Create the complete data access layer for the `scholars` Firestore collection. All components must call these functions — never raw Firestore SDK calls directly in components.

**Detailed Steps:**
1. Create `lib/firebase/scholars.ts`:
   ```ts
   import {
     collection, addDoc, getDocs, updateDoc, doc,
     query, where, serverTimestamp, Timestamp
   } from "firebase/firestore";
   import { db } from "./config";
   import type { Scholar, ScholarStatus } from "@/types";

   const SCHOLARS_COLLECTION = "scholars";

   /** Submit a new scholar application with status: Pending */
   export async function addScholar(data: Omit<Scholar, "id" | "status" | "createdAt" | "updatedAt">): Promise<string> {
     const docRef = await addDoc(collection(db, SCHOLARS_COLLECTION), {
       ...data,
       status: "Pending" as ScholarStatus,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp(),
     });
     return docRef.id;
   }

   /** Fetch all scholars matching a given status */
   export async function getScholarsByStatus(status: ScholarStatus): Promise<Scholar[]> {
     const q = query(
       collection(db, SCHOLARS_COLLECTION),
       where("status", "==", status)
     );
     const snapshot = await getDocs(q);
     return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Scholar));
   }

   /** Update a scholar's LastPaidTxHash and paidAt after a successful transaction */
   export async function markScholarAsPaid(scholarId: string, txHash: string): Promise<void> {
     const ref = doc(db, SCHOLARS_COLLECTION, scholarId);
     await updateDoc(ref, {
       lastPaidTxHash: txHash,
       paidAt: serverTimestamp(),
       updatedAt: serverTimestamp(),
     });
   }

   /** Update a scholar's status (used in Increment 3 after NFT mint) */
   export async function updateScholarStatus(scholarId: string, status: ScholarStatus): Promise<void> {
     const ref = doc(db, SCHOLARS_COLLECTION, scholarId);
     await updateDoc(ref, { status, updatedAt: serverTimestamp() });
   }
   ```
2. Export all functions from `lib/firebase/index.ts` barrel file.
3. Test each function manually by calling them from a temporary test component. Confirm Firestore Console shows correct data updates.

**Deliverable:** `lib/firebase/scholars.ts` — fully typed, tested Firestore service for scholars.

---

#### Task A2-02 — Build the Sponsors Firestore Service

**Estimated Time:** 1 hour

**Objective:** Create the Firestore service for the `sponsors` collection, including a function to sum all pledged amounts (used in Increment 5).

**Detailed Steps:**
1. Create `lib/firebase/sponsors.ts`:
   ```ts
   import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
   import { db } from "./config";
   import type { Sponsor } from "@/types";

   const SPONSORS_COLLECTION = "sponsors";

   export async function addSponsor(data: Omit<Sponsor, "id" | "createdAt">): Promise<string> {
     const docRef = await addDoc(collection(db, SPONSORS_COLLECTION), {
       ...data,
       createdAt: serverTimestamp(),
     });
     return docRef.id;
   }

   export async function getAllSponsors(): Promise<Sponsor[]> {
     const snapshot = await getDocs(collection(db, SPONSORS_COLLECTION));
     return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Sponsor));
   }

   /** Returns the sum of all sponsor pledgedAmount values (used in Inc 5) */
   export async function getTotalPledgedADA(): Promise<number> {
     const sponsors = await getAllSponsors();
     return sponsors.reduce((sum, s) => sum + s.pledgedAmount, 0);
   }
   ```

**Deliverable:** `lib/firebase/sponsors.ts` committed.

---

#### Task A2-03 — Build the `useScholarData` Custom Hook

**Estimated Time:** 1–2 hours

**Objective:** Create a React hook that fetches Approved Scholars from Firestore and manages loading/error states, so the Admin Dashboard component itself stays clean.

**Detailed Steps:**
1. Create `hooks/useScholarData.ts`:
   ```ts
   "use client";
   import { useState, useEffect } from "react";
   import { getScholarsByStatus } from "@/lib/firebase/scholars";
   import type { Scholar } from "@/types";

   export function useScholarData(status: import("@/types").ScholarStatus = "Approved") {
     const [scholars, setScholars] = useState<Scholar[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);

     const refresh = async () => {
       setLoading(true);
       try {
         const data = await getScholarsByStatus(status);
         setScholars(data);
       } catch (err: any) {
         setError(err.message ?? "Failed to load scholars");
       } finally {
         setLoading(false);
       }
     };

     useEffect(() => { refresh(); }, [status]);

     return { scholars, loading, error, refresh };
   }
   ```
2. Export from `hooks/index.ts`. Notify Christian that he can call `refresh()` after a successful transaction to update the table.

**Deliverable:** `hooks/useScholarData.ts` — clean data-fetching hook.

---

#### Task A2-04 — Build the `ScholarTable` Component

**Estimated Time:** 3–4 hours

**Objective:** Create the dynamic Admin Dashboard table that renders one row per Approved Scholar, with a "Send ADA" button and a "Paid ✓" state per row.

**Detailed Steps:**
1. Create `components/dashboard/ScholarTable.tsx`. Define props:
   ```tsx
   interface ScholarTableProps {
     scholars: Scholar[];
     onSend: (scholar: Scholar) => void;
     processingId: string | null; // Scholar ID currently processing a transaction
   }
   ```
2. Build the table with Tailwind — columns: `#`, `Name`, `Course`, `Wallet Address`, `Status`, `Payment`, `Action`.
3. For each scholar row:
   - Show `StatusBadge` for `status` field (green "Approved", yellow "Pending")
   - If `lastPaidTxHash` exists: show `<TxHashLink txHash={scholar.lastPaidTxHash} label="Paid ✓" />` in the Action column
   - If no `lastPaidTxHash`: show a "Send ADA" button that calls `onSend(scholar)`
   - If `processingId === scholar.id`: show a mini spinner in that row's Action column and disable the button
4. Show a loading skeleton while data is being fetched (3-column gray pulsing rows).
5. Show an empty state message if `scholars.length === 0`: *"No approved scholars found. Approve a scholar in Firebase Console to populate this table."*
6. Truncate the `walletAddress` display using `shortenAddress()` from `lib/utils/addressUtils.ts` (Christian's utility from Increment 1).

**Deliverable:** `components/dashboard/ScholarTable.tsx` — fully functional with send, loading, and paid states per row.

---

#### Task A2-05 — Upgrade `app/admin/page.tsx` to Use the Scholar Table

**Estimated Time:** 2 hours

**Objective:** Refactor the Admin Dashboard page to use the new Scholar Table, replacing the single blank payment form from Increment 1. The page now manages per-row transaction state.

**Detailed Steps:**
1. In `app/admin/page.tsx`, import `useScholarData`, `ScholarTable`, and `sendADA`.
2. Replace the single `txState` with per-row transaction tracking:
   ```tsx
   const [processingId, setProcessingId] = useState<string | null>(null);
   const [rowResults, setRowResults] = useState<Record<string, { txHash?: string; error?: string }>>({});
   const { scholars, loading, error, refresh } = useScholarData("Approved");
   ```
3. Implement `handleSendToScholar`:
   ```tsx
   const handleSendToScholar = async (scholar: Scholar) => {
     if (!wallet || !scholar.id) return;
     setProcessingId(scholar.id);
     try {
       // Amount is fixed at a demo value (e.g., 5 ADA) for Increment 2
       // In Increment 4, this will be dynamic
       const txHash = await sendADA(wallet, scholar.walletAddress, "5");
       await markScholarAsPaid(scholar.id, txHash);
       setRowResults(prev => ({ ...prev, [scholar.id!]: { txHash } }));
       refresh(); // Re-fetch scholars to show updated LastPaidTxHash
     } catch (err: any) {
       setRowResults(prev => ({ ...prev, [scholar.id!]: { error: parseTxError(err) } }));
     } finally {
       setProcessingId(null);
     }
   };
   ```
4. Keep the original single-form UI accessible via a toggle ("Manual Send" tab) for backward compatibility with Increment 1 demos.
5. Add a page-level error banner if `error` from `useScholarData` is non-null.

**Deliverable:** Upgraded `app/admin/page.tsx` with Scholar Table and per-row transaction management.

---

### 🎨 SHERIELYN — Public-Facing Forms & UI Lead {#sherielyn}

**Domain:** Build the two public routes — the Scholar Application Form and the Sponsor Entry Form — with full React state management, Firestore integration, and user-friendly success/error feedback. These are the data entry points of the entire system.

**Dependency:** Requires Shervin's S2-01 (Firebase project), S2-02 (SDK), and S2-04 (types).

**Working Branch:** `feature/public-forms`

---

#### Task SH2-01 — Build the Scholar Application Form (`/apply`)

**Estimated Time:** 3–4 hours

**Objective:** Create the student-facing application form that collects Name, Course, and Cardano Wallet Address, writes the data to Firestore, and confirms submission with a success message.

**Detailed Steps:**
1. Create `app/apply/page.tsx` and `components/forms/ScholarApplicationForm.tsx`.
2. Form fields (all required):
   - **Full Name** — text input, min 3 characters
   - **Course / Degree Program** — text input (e.g., "BS Computer Science")
   - **Cardano Preprod Wallet Address** — text input, validated with `isValidPreprodAddress()` from Christian's utility
3. State management:
   ```tsx
   type FormState = "idle" | "submitting" | "success" | "error";
   const [formState, setFormState] = useState<FormState>("idle");
   ```
4. On submit: call `addScholar({ name, course, walletAddress })` from `lib/firebase/scholars.ts`. The service sets `status: "Pending"` automatically.
5. Success state: show a green confirmation card:
   - "Application Submitted! 🎉"
   - "Your application is under review. Status: **Pending**"
   - "Your wallet address on file: `{truncated address}`"
   - A "Submit Another Application" button that resets the form
6. Add a helper text under the wallet address field: *"Don't have a Cardano wallet? Install the Eternl browser extension and switch to Preprod Testnet."* with a link to Eternl.
7. The page must be accessible **without** wallet connection — no `MeshProvider` dependency on this route.

**Deliverable:** `app/apply/page.tsx` — publicly accessible scholar application form that writes to Firestore.

---

#### Task SH2-02 — Build the Sponsor Entry Form (`/sponsor-entry`)

**Estimated Time:** 2 hours

**Objective:** Create the sponsor pledge form that collects Sponsor Name and Pledge Amount (in ADA), writes to Firestore, and displays confirmation.

**Detailed Steps:**
1. Create `app/sponsor-entry/page.tsx` and `components/forms/SponsorEntryForm.tsx`.
2. Form fields:
   - **Sponsor Name** — text input (individual or organization name)
   - **Pledge Amount (ADA)** — number input, must be a positive integer > 0
3. Validation: Pledge amount must be stored as `Number(input)` — **never as a string**. This is critical for Increment 5's summation logic (Constraint C-07).
4. On submit: call `addSponsor({ sponsorName, pledgedAmount: Number(amount) })`.
5. Success state: green confirmation card showing sponsor name and pledged amount.
6. Add a note: *"This pledge amount will appear in the ScholarChain Public Transparency Dashboard."*

**Deliverable:** `app/sponsor-entry/page.tsx` — sponsor pledge form writing to Firestore.

---

#### Task SH2-03 — Build the `StatusBadge` Component

**Estimated Time:** 1 hour

**Objective:** Create a reusable status indicator chip used in the Scholar Table and throughout the application.

**Detailed Steps:**
1. Create `components/ui/StatusBadge.tsx`:
   ```tsx
   type Status = "Pending" | "Approved" | "Rejected" | "Paid";

   const statusStyles: Record<Status, string> = {
     Pending:  "bg-yellow-900 text-yellow-300 border border-yellow-700",
     Approved: "bg-green-900 text-green-300 border border-green-700",
     Rejected: "bg-red-900 text-red-300 border border-red-700",
     Paid:     "bg-blue-900 text-blue-300 border border-blue-700",
   };

   export default function StatusBadge({ status }: { status: Status }) {
     return (
       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
         {status}
       </span>
     );
   }
   ```
2. Use `StatusBadge` in Austine's `ScholarTable` component.

**Deliverable:** `components/ui/StatusBadge.tsx` committed.

---

#### Task SH2-04 — Build the Application Landing Page

**Estimated Time:** 1–2 hours

**Objective:** Create a clean landing page (`app/page.tsx`) that links to all public routes, giving the system a professional entry point for demos.

**Detailed Steps:**
1. Replace the Next.js default `app/page.tsx` with a ScholarChain landing page featuring:
   - ScholarChain logo/title and tagline: *"Transparent, blockchain-verified scholarship management"*
   - Three navigation cards linking to:
     - **Admin Portal** (`/admin`) — "Connect your wallet to manage scholarship payments"
     - **Apply for Scholarship** (`/apply`) — "Students: submit your application here"
     - **Sponsor Registration** (`/sponsor-entry`) — "Sponsors: register your pledge"
   - A brief "How It Works" section with 3 steps: Apply → Approve → Get Paid on Cardano
2. Keep the design consistent with the existing Tailwind brand colors from Shervin's `tailwind.config.ts`.

**Deliverable:** Polished `app/page.tsx` landing page.

---

#### Task SH2-05 — Add Navigation Links to Header

**Estimated Time:** 30 minutes

**Objective:** Update Austine's Header component to include navigation links to the new public routes.

**Detailed Steps:**
1. Coordinate with Austine to add `<nav>` links to the Header:
   - "Apply" → `/apply`
   - "Sponsor" → `/sponsor-entry`
   - "Admin" → `/admin`
2. Highlight the active route using Next.js `usePathname()` hook.
3. On mobile, collapse nav links into a hamburger menu or keep them as icon-only links.

**Deliverable:** Updated `Header.tsx` with navigation. Coordinate with Austine to avoid merge conflicts on shared file.

---

### ⛓️ CHRISTIAN — Blockchain-to-Database Bridge Lead {#christian}

**Domain:** Wire the Firestore scholar data to the MeshJS transaction engine, implement `markScholarAsPaid()` post-transaction, and create the Amount Input utility for the Admin Dashboard. Christian is the integration point between the database layer and the blockchain layer.

**Dependency:** Requires Austine's A2-01 (`markScholarAsPaid` service function) and the Increment 1 `sendADA()` function.

**Working Branch:** `feature/tx-db-bridge`

---

#### Task C2-01 — Verify `sendADA()` Accepts Wallet Address from Firestore

**Estimated Time:** 1 hour

**Objective:** Confirm that the `sendADA()` function from Increment 1 works correctly when called with a `walletAddress` string pulled from a Firestore document (rather than a manually typed string).

**Detailed Steps:**
1. Fetch one Scholar document from Firestore using `getScholarsByStatus("Approved")`.
2. Pass the `scholar.walletAddress` directly to `sendADA(wallet, scholar.walletAddress, "5")`.
3. Confirm the transaction builds, the wallet signing popup appears, and the TxHash is returned correctly.
4. Verify in Cardanoscan that the recipient address matches the Firestore `walletAddress` field exactly.
5. Document any address format differences between what the student typed and what Cardano expects (e.g., trailing whitespace bugs — add a `.trim()` to `walletAddress` in `addScholar()` service function if needed).

**Deliverable:** Confirmed `sendADA()` works with Firestore-sourced addresses. `.trim()` applied to wallet address fields if needed.

---

#### Task C2-02 — Implement the Post-Transaction Firestore Update Flow

**Estimated Time:** 2 hours

**Objective:** After a successful `sendADA()` call, immediately write the `TxHash` and `paidAt` timestamp back to the Scholar's Firestore document. This creates the on-chain + off-chain receipt linkage.

**Detailed Steps:**
1. In `app/admin/page.tsx` (coordinating with Austine's Task A2-05), implement the full transaction + database update sequence:
   ```ts
   // Step 1: Execute the blockchain transaction
   const txHash = await sendADA(wallet, scholar.walletAddress, "5");

   // Step 2: Write TxHash back to Firestore immediately
   await markScholarAsPaid(scholar.id!, txHash);

   // Step 3: Trigger table refresh so "Paid ✓" state appears
   refresh();
   ```
2. Handle the edge case where `sendADA()` succeeds but `markScholarAsPaid()` fails (network issue):
   ```ts
   // Transaction happened on-chain — still show TxHash to Admin even if DB write fails
   try {
     await markScholarAsPaid(scholar.id!, txHash);
   } catch (dbErr) {
     console.error("DB update failed after successful tx:", dbErr);
     // Show a warning: "Payment sent but record update failed. TxHash: {txHash}"
   }
   ```
3. This resilience pattern is important: the blockchain transaction cannot be reversed, so the TxHash must always be shown even if the database is temporarily unavailable.

**Deliverable:** Post-transaction Firestore update working. Scholar records show `lastPaidTxHash` after payment.

---

#### Task C2-03 — Add the ADA Amount Display to the Scholar Table Row

**Estimated Time:** 1 hour

**Objective:** For Increment 2, the Admin sends a fixed amount per scholar (e.g., 5 ADA for demo purposes). Add a clear display of the amount being sent next to each row's Send button so the Admin knows what they're approving.

**Detailed Steps:**
1. Add a hardcoded constant at the top of the Admin Dashboard file:
   ```ts
   // TODO [Increment 4]: Replace with dynamic per-scholar amount input
   const SCHOLARSHIP_AMOUNT_ADA = "5";
   ```
2. Pass this constant to the `ScholarTable` component as a prop and display it in the button label:
   - Button text: `"Send 5 tADA →"`
3. Ensure this constant is the **only** place the amount is defined — not scattered across multiple files.

**Deliverable:** Admin can see exactly how much ADA they're sending before clicking each row's button.

---

#### Task C2-04 — Write Integration Test for the Full DB-to-Chain Flow

**Estimated Time:** 1 hour

**Objective:** Manually document and execute the full "database record → blockchain transaction → database update" integration test that Jamiel will use for QA validation.

**Detailed Steps:**
Create `docs/increment-2-integration-test.md` documenting:

1. **Pre-condition:** Scholar document in Firestore with `status: "Approved"`, `walletAddress: "addr_test1..."`, no `lastPaidTxHash`.
2. **Step:** Admin opens dashboard, sees scholar in table, clicks "Send 5 tADA →", signs in Eternl.
3. **Expected result A (on-chain):** TxHash visible on Cardanoscan, 5 ADA transferred to correct address.
4. **Expected result B (off-chain):** Scholar's Firestore document now has `lastPaidTxHash: "<confirmed hash>"` and `paidAt` timestamp set.
5. **Expected result C (UI):** Scholar row now shows "Paid ✓" with clickable TxHash link instead of "Send ADA" button.
6. **Cleanup:** Note that this can be re-tested by manually clearing `lastPaidTxHash` from the Scholar document in Firebase Console.

**Deliverable:** `docs/increment-2-integration-test.md` — integration test document for Jamiel.

---

### 🧪 JAMIEL — QA, Data Integrity & Demo Lead {#jamiel}

**Domain:** Data integrity verification across Firestore and Cardano, comprehensive test plan execution, and an upgraded demo script covering the full student-to-payment flow.

**Working Branch:** `feature/qa-increment-2`

---

#### Task J2-01 — Set Up Test Data in Firestore

**Estimated Time:** 1 hour

**Objective:** Populate Firestore with realistic test Scholar and Sponsor data so the dashboard renders properly during development and testing — without waiting for team members to manually submit forms.

**Detailed Steps:**
1. In the Firebase Console, manually create 4 Scholar documents with realistic data:
   - 2 with `status: "Approved"` (for Admin Dashboard testing)
   - 1 with `status: "Pending"` (to verify it does NOT appear in the dashboard)
   - 1 with `status: "Rejected"` (to verify filtering works)
2. Create 2 Sponsor documents with `pledgedAmount` values of `5000` and `3000`.
3. Share the exact document IDs and field values with the team (for use in test case references).
4. Document the test data set in `docs/increment-2-test-data.md`.

**Deliverable:** Firestore populated with 4 scholar + 2 sponsor test records. Test data documented.

---

#### Task J2-02 — Write and Execute the Increment 2 Test Plan

**Estimated Time:** 3 hours

**Objective:** Comprehensive test coverage for all new Increment 2 functionality.

**Detailed Steps:**
Create `docs/increment-2-test-plan.md` with the following test cases:

**Section 1: Scholar Application Form (`/apply`)**

| ID | Test Case | Expected Result |
|---|---|---|
| APP-01 | Submit valid form data | Scholar appears in Firestore with status "Pending" |
| APP-02 | Submit with invalid wallet address | Validation error: "Must start with addr_test1" |
| APP-03 | Submit with empty name field | Validation error shown, no Firestore write |
| APP-04 | Submit form twice | Two separate Firestore documents created |
| APP-05 | Success state after submission | Green confirmation card with wallet address shown |

**Section 2: Sponsor Entry Form (`/sponsor-entry`)**

| ID | Test Case | Expected Result |
|---|---|---|
| SPO-01 | Submit valid sponsor pledge | Document in Firestore with Number pledgedAmount |
| SPO-02 | Submit pledge of 0 | Validation error |
| SPO-03 | Submit pledge as decimal (e.g., 100.5) | Stored as Number in Firestore |
| SPO-04 | pledgedAmount stored as Number type | Confirm in Firebase Console: type is number, not string |

**Section 3: Admin Dashboard Scholar Table**

| ID | Test Case | Expected Result |
|---|---|---|
| DASH-01 | Dashboard loads approved scholars | Table shows only "Approved" scholars |
| DASH-02 | Pending scholar not shown | Scholar with status "Pending" not in table |
| DASH-03 | Table loads within 3 seconds | Loading skeleton visible then replaced by data |
| DASH-04 | Empty state shown when no approved scholars | "No approved scholars found" message displayed |

**Section 4: DB-to-Chain Transaction Flow**

| ID | Test Case | Expected Result |
|---|---|---|
| TXF-01 | Full happy path (DB → Chain → DB update) | TxHash in Cardanoscan + `lastPaidTxHash` in Firestore |
| TXF-02 | Scholar wallet address matches Cardanoscan | Recipient in explorer = Firestore walletAddress |
| TXF-03 | Paid scholar shows "Paid ✓" link | Button replaced with TxHashLink after payment |
| TXF-04 | `lastPaidTxHash` in Firestore matches explorer | Manually compare values |
| TXF-05 | `paidAt` timestamp set correctly | Timestamp within 30s of when Send was clicked |
| TXF-06 | Processing row shows spinner | Other rows remain interactive during processing |
| TXF-07 | Cannot double-pay a scholar | After payment, Send button replaced — no second click possible |

Execute all test cases. File GitHub Issues for any failures. Re-test after fixes.

**Deliverable:** Fully executed `docs/increment-2-test-plan.md`. All tests passing before demo sign-off.

---

#### Task J2-03 — Verify Data Integrity Across Firestore and Cardano

**Estimated Time:** 1 hour

**Objective:** Manually cross-verify that the data in Firestore (the off-chain record) is accurate and consistent with what's on the Cardano blockchain (the on-chain record). This is a preview of the Transparency Dashboard logic from Increment 5.

**Detailed Steps:**
1. After running Test TXF-01, open both:
   - The Scholar's Firestore document in Firebase Console
   - The TxHash on `preprod.cardanoscan.io`
2. Verify these values match exactly:
   - Firestore `walletAddress` = Cardanoscan recipient address
   - Firestore `lastPaidTxHash` = Cardanoscan transaction hash
   - Firestore `paidAt` timestamp ≈ Cardanoscan block time (within ~1 minute)
3. Document the cross-verification results in `docs/increment-2-test-plan.md` with screenshots.

**Deliverable:** Data integrity verification documented with screenshots.

---

#### Task J2-04 — Update and Rehearse the Demo Script

**Estimated Time:** 2 hours

**Objective:** Extend the Increment 1 demo script to cover the new student application and dynamic dashboard flows.

**Detailed Steps:**
Create `docs/increment-2-demo-script.md` expanding on the Increment 1 script:

**Pre-Demo Setup additions:**
- [ ] Firebase Console open in a separate browser tab (to show live data updates)
- [ ] Firestore `scholars` collection visible with 2 approved, 1 pending record
- [ ] `/apply` route accessible in a second browser window (to simulate student experience)

**New Demo Scenes to add:**
1. **(Scene 1 — Student Journey):** Open `/apply` in a second window. Fill out the form as a student. Submit. Switch to Firebase Console tab. Show the new document appearing in real-time with `status: "Pending"`.
2. **(Scene 2 — Admin Approval):** In Firebase Console, manually change `status` to `"Approved"`. Switch back to Admin Dashboard. Refresh. Show the scholar appearing in the table.
3. **(Scene 3 — Dynamic Payment):** Click "Send 5 tADA →" next to the scholar. Sign. Show TxHash. Switch back to Firebase Console and show `lastPaidTxHash` populated. Show the "Paid ✓" link in the dashboard.
4. **(Scene 4 — Sponsor):** Visit `/sponsor-entry`. Submit a pledge. Show Firestore record created. *"This pledge amount will power the accountability dashboard in our next increment."*

**Deliverable:** `docs/increment-2-demo-script.md` rehearsed and ready.

---

## 6. Parallel Development Strategy & Dependency Map {#parallel}

```
DAY 1                          DAY 2                        DAY 3-4
─────────────────────────────────────────────────────────────────────────
SHERVIN
  S2-01: Firebase Setup ────────►│
  S2-02: SDK + Config ───────────►│ All members unblocked
  S2-03: Security Rules ─────────►│
  S2-04: TypeScript Types ────────►│ (types distributed)
  S2-05: README Update ───────────────────────────────────────────────►│

AUSTINE                          │
  (waits for S2-01, S2-02, S2-04)├── A2-01: Scholars Service ──► A2-02: Sponsors Service ──► A2-03: Hook ──► A2-04: ScholarTable ──► A2-05: Dashboard Upgrade

SHERIELYN                        │
  (waits for S2-01, S2-02)       ├── SH2-01: Apply Form ────────► SH2-02: Sponsor Form ──► SH2-03: StatusBadge ──► SH2-04: Landing Page ──► SH2-05: Header Nav

CHRISTIAN                        │
  (waits for A2-01 complete)     │                                C2-01: Verify sendADA ──► C2-02: Post-TX Update ──► C2-03: Amount Display ──► C2-04: Integration Test

JAMIEL                           │
  J2-01: Test Data Setup ────────►│                          J2-02: Test Plan ──────────────────────────────► J2-03: Data Integrity ──► J2-04: Demo Script
─────────────────────────────────────────────────────────────────────────
                                 ▲
                             UNBLOCK POINT:
                     Shervin's S2-01 through S2-04
                       must complete before others
```

### Integration Coordination Points
| Who | Shares What | With | When |
|---|---|---|---|
| Shervin | Firebase config values | All members | Day 1 via secure channel |
| Shervin | TypeScript types (`types/index.ts`) | Austine, Sherielyn, Christian | Day 1 |
| Austine | `markScholarAsPaid()` function | Christian | After A2-01 merges |
| Austine | `useScholarData()` hook | Christian | After A2-03 merges |
| Sherielyn | `StatusBadge` component | Austine (for ScholarTable) | After SH2-03 merges |
| Christian | `isValidPreprodAddress()` | Sherielyn (for Apply Form) | Already available from Inc 1 |
| Jamiel | Test data Firestore IDs | Christian | Day 1 (for integration testing) |

---

## 7. Integration Checklist {#integration}

- [ ] Firebase SDK initialized with `getApps()` guard (no hot-reload errors)
- [ ] All Firestore writes use `serverTimestamp()` for date fields
- [ ] `addScholar()` always sets `status: "Pending"` — never accepts status as input
- [ ] `getScholarsByStatus("Approved")` filter working (Pending scholars invisible on dashboard)
- [ ] `walletAddress` trimmed before Firestore write and before passing to `sendADA()`
- [ ] `markScholarAsPaid()` called after `sendADA()` — not before
- [ ] `pledgedAmount` stored as `Number` type in Firestore (verified in Firebase Console)
- [ ] Scholar Table shows "Paid ✓" with TxHashLink after payment (no Send button re-render)
- [ ] `/apply` and `/sponsor-entry` routes accessible without wallet connection
- [ ] All 28 test cases in `docs/increment-2-test-plan.md` marked ✅
- [ ] Firebase Console screenshot showing real Firestore data in demo docs
- [ ] No hardcoded wallet addresses or ADA amounts in component files (only in constants)

---

## 8. Branch & Git Strategy {#git}

### Branches for Increment 2
```
main (protected)
  ├── feature/firebase-setup         (Shervin)
  ├── feature/admin-dashboard-v2     (Austine)
  ├── feature/public-forms           (Sherielyn)
  ├── feature/tx-db-bridge           (Christian)
  └── feature/qa-increment-2         (Jamiel)
```

### Recommended Merge Order
1. Shervin: `feature/firebase-setup` (unblocks everyone)
2. Sherielyn: `feature/public-forms` (no shared file conflicts)
3. Austine: `feature/admin-dashboard-v2` (creates Scholar Table)
4. Christian: `feature/tx-db-bridge` (wires transaction to table — coordinate with Austine)
5. Jamiel: `feature/qa-increment-2` (docs only)

---

## 9. Daily Standup Template {#standup}

```
👤 [Name] — [Date] — Increment 2

✅ DONE: [Task ID + brief description]
🔨 DOING: [Current task]
🚧 BLOCKED: [Blocker + who can help]
📢 NEEDS FROM TEAM: [Coordination required]
```

---

## 10. Risk Register {#risks}

| ID | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R2-01 | Firestore security rules block app writes | Medium | High | Test rules in Firebase Playground before deployment (S2-03) | Shervin |
| R2-02 | Merge conflict on `app/admin/page.tsx` | High | Medium | Austine ships table first; Christian replaces stub in coordinated PR | Christian + Austine |
| R2-03 | `pledgedAmount` stored as string instead of Number | Medium | High | Explicit `Number()` cast in `SponsorEntryForm` + security rule type check (S2-03) | Sherielyn |
| R2-04 | Firebase hot-reload initialization error | Medium | Low | `getApps()` guard in `config.ts` (S2-02, Step 3) | Shervin |
| R2-05 | Scholar wallet address has whitespace causing tx failure | Low | Medium | `.trim()` applied in `addScholar()` service function (C2-01) | Christian |
| R2-06 | `markScholarAsPaid` DB write fails after successful tx | Low | High | Resilience pattern: always show TxHash to Admin even if DB write fails (C2-02) | Christian |

---

*Document Version: 1.0 · ScholarChain Team · Approved for Execution ✅*
