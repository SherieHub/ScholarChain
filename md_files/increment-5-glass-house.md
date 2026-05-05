# ScholarChain — Increment 5: The Glass House

> **Central Execution Contract · Team of 5 · Parallel Development Strategy**
> The final increment. Builds directly on Increments 1–4. All prior code must be merged to `main` before this increment begins.
> Last Updated: May 2026 · Status: 🟡 In Progress

---

## 📋 Table of Contents

1. [Increment Objective & Scope](#objective)
2. [Definition of Done](#done)
3. [Technical Constraints](#constraints)
4. [Phase Execution Plan](#phases)
5. [Team Task Distribution](#tasks)
   - [Shervin — Blockfrost Infrastructure & API Security Lead](#shervin)
   - [Austine — Transparency Dashboard Architecture](#austine)
   - [Sherielyn — Public Dashboard UI & Data Visualization](#sherielyn)
   - [Christian — Data Cross-Reference & Enrichment Engine](#christian)
   - [Jamiel — QA, Accountability Verification & Final Demo Lead](#jamiel)
6. [Parallel Development Strategy & Dependency Map](#parallel)
7. [Integration Checklist](#integration)
8. [Branch & Git Strategy](#git)
9. [Daily Standup Template](#standup)
10. [Risk Register](#risks)
11. [Final Project Retrospective Template](#retro)

---

## 1. Increment Objective & Scope {#objective}

### Goal
Build the "Glass House" — a fully public, read-only Transparency Dashboard that proves the Admin cannot misappropriate scholarship funds. The dashboard compares the **total funds pledged by sponsors** (from Firebase) against the **live ADA balance in the Admin's treasury wallet** (from the Cardano blockchain via Blockfrost), exposing any discrepancy in real time. Every past payment is listed as a clickable TxHash that opens an independent third-party block explorer, making the on-chain audit trail undeniable.

### Elevator Pitch
> *"By the end of this increment, anyone — a donor, a student, a government auditor — can visit our public Transparency page with no wallet, no login, and no trust in our website. They see live: how much was pledged by sponsors, how much ADA is actually sitting in the treasury right now, and a complete line-by-line receipt for every scholarship payment ever made — each one a clickable link to the global Cardano blockchain. If the numbers don't add up, the discrepancy is flagged automatically. The institution is mathematically locked into accountability."*

### What Changes from Increment 4

| Increments 1–4 | Increment 5 |
|---|---|
| All features require wallet connection or form input | Transparency Dashboard is fully public — no wallet needed |
| No public-facing accountability mechanism | Live "Pledge vs Treasury Balance" scoreboard |
| No complete payment history accessible to public | Paginated ledger of every scholarship transaction |
| TxHashes shown post-action only | All historical TxHashes surfaced from Blockfrost |
| Firebase = only data source | Firebase + Cardano blockchain via Blockfrost = dual-source truth |
| Recipient addresses shown as raw strings | Cross-referenced with Firebase scholars for human-readable names |

### Strict Scope Boundaries

| ✅ IN SCOPE | ❌ OUT OF SCOPE |
|---|---|
| Blockfrost account + Preprod project setup | Running a full Cardano node |
| Next.js API routes (BFF) to proxy Blockfrost calls | Exposing Blockfrost API key to client |
| Live treasury ADA balance from Blockfrost | Real-time WebSocket streaming (polling on load is fine) |
| Sponsor pledge total from Firebase | Auto-refreshing on a timer |
| Discrepancy calculation and visual alert | Automated alerts or email notifications |
| Paginated transaction ledger table | Downloading the ledger as a CSV |
| TxHash links to Cardanoscan | Building a custom block explorer |
| Cross-referencing recipient addresses with Firebase scholars | Showing full PII (only masked names/Scholar IDs) |
| Public `/transparency` route (no auth required) | Role-based public vs private views |
| `BLOCKFROST_PROJECT_ID` in server-side env only | Any other Blockfrost endpoints beyond addresses + tx history |

---

## 2. Definition of Done {#done}

Increment 5 is **complete and demonstrable** when ALL of the following are true:

- [ ] Blockfrost Preprod project created; `BLOCKFROST_PROJECT_ID` in `.env.local` (server-side only)
- [ ] Next.js API route `/api/treasury` returns live ADA balance of Admin wallet from Blockfrost
- [ ] Next.js API route `/api/transactions` returns paginated transaction history of Admin wallet from Blockfrost
- [ ] `/transparency` page is publicly accessible — no wallet connection, no login required
- [ ] "Total Pledged by Sponsors" card shows the sum from Firebase `sponsors` collection
- [ ] "Live Treasury Balance" card shows the current ADA balance from Blockfrost (live, not cached)
- [ ] Discrepancy is calculated and displayed: green if zero, red/amber if gap exists
- [ ] Transaction ledger table renders with columns: Date, Amount (ADA), Recipient, TxHash
- [ ] Each TxHash is a clickable link opening `preprod.cardanoscan.io/transaction/{hash}` in a new tab
- [ ] Recipient addresses are cross-referenced with Firebase: Scholar name (masked) shown where possible
- [ ] Raw address shown where no matching scholar found
- [ ] The page loads and renders in under 5 seconds on a standard connection
- [ ] `BLOCKFROST_PROJECT_ID` does NOT appear in any client-side bundle (verified via browser DevTools Network tab)
- [ ] All Increments 1–4 functionality still works (no regressions)
- [ ] Final integrated demo runnable in under 12 minutes covering all 5 increments
- [ ] All code merged to `main` via reviewed PRs

---

## 3. Technical Constraints {#constraints}

| # | Constraint | Reason |
|---|---|---|
| C5-01 | `BLOCKFROST_PROJECT_ID` must **never** use the `NEXT_PUBLIC_` prefix | Exposing it in the browser bundle allows anyone to steal the API key and exhaust the quota |
| C5-02 | All Blockfrost API calls must be made from Next.js API route handlers (`app/api/`) — never from client components | Enforces the Backend-for-Frontend (BFF) security pattern |
| C5-03 | The `/transparency` page must render with **zero** wallet connection prompts | Donors and auditors do not have Cardano wallets |
| C5-04 | Lovelace values from Blockfrost must be converted to ADA before display (`÷ 1,000,000`) | All Blockfrost balances are returned in raw Lovelaces |
| C5-05 | The discrepancy calculation must use **live** data fetched on each page load — never a cached or hardcoded value | Cached discrepancy could hide fraud |
| C5-06 | TxHash links must point to an **independent third-party** explorer (`cardanoscan.io`) — never back to ScholarChain itself | The independence of the verification source is the accountability mechanism |
| C5-07 | Cross-referencing recipient addresses with scholar names must show **masked** names or "Scholar #ID" — not full PII | Basic privacy protection for student data on a public page |
| C5-08 | The API routes must handle Blockfrost rate limits gracefully (free tier: 50,000 req/day) | Prevent 429 errors from crashing the transparency page |
| C5-09 | Discrepancy must be calculated as: `Pledged − (Live Balance + Total Paid Out)` | Accounts for funds that have already been legitimately spent |

---

## 4. Phase Execution Plan {#phases}

```
Phase 1: Blockfrost Setup & API Route Infrastructure    [Day 1]      → Shervin leads
Phase 2: Data Fetching Layer (API Routes)               [Day 1-2]    → Austine leads
Phase 3: Transparency Dashboard UI Shell               [Day 1-2]    → Sherielyn leads
Phase 4: Data Cross-Reference & Enrichment             [Day 2-3]    → Christian leads
Phase 5: QA, Accountability Verification & Final Demo  [Day 3-4]    → Jamiel leads
```

### Phase 1 — Blockfrost Setup & API Route Infrastructure
Provision the Blockfrost account, configure the Preprod project, and create the skeleton Next.js API routes that will serve as the secure server-side proxy for all blockchain data queries.

### Phase 2 — Data Fetching Layer
Implement the full API route logic: fetching live balance via `BlockFrostAPI.addresses()` and transaction history via `BlockFrostAPI.addressesTransactions()`. Return clean, typed JSON to the client.

### Phase 3 — Transparency Dashboard UI Shell
Build the `/transparency` page components: the scoreboard stat cards, the discrepancy banner, and the ledger table shell — all initially rendering with mock data before the API routes are live.

### Phase 4 — Data Cross-Reference & Enrichment
Implement the enrichment layer that joins Blockfrost transaction records (raw addresses) with Firebase scholar data (names) to produce human-readable transaction descriptions on the ledger.

### Phase 5 — QA, Accountability Verification & Final Demo
Verify all accountability calculations, test with real discrepancy scenarios, and prepare the capstone demo covering all 5 increments end-to-end.

---

## 5. Team Task Distribution {#tasks}

---

### 🔧 SHERVIN — Blockfrost Infrastructure & API Security Lead {#shervin}

**Domain:** Provision the Blockfrost service, install the SDK, configure the Next.js API routes as secure server-side proxies, and establish the environment variable security that keeps the API key out of the browser bundle. Shervin's output is the secure data pipeline from Cardano → server → client.

**Priority:** 🔴 CRITICAL PATH — API routes must be live before Austine and Christian can fetch real data.

**Working Branch:** `feature/blockfrost-infrastructure`

---

#### Task S5-01 — Provision Blockfrost Account and Obtain Project ID

**Estimated Time:** 30 minutes

**Objective:** Create the Blockfrost service account and obtain the Preprod `PROJECT_ID` that will be used by the server-side SDK to query the Cardano Preprod ledger.

**Detailed Steps:**
1. Navigate to [blockfrost.io](https://blockfrost.io). Click **Get Started Free**.
2. Register with a Google or GitHub account.
3. In the Blockfrost dashboard, click **+ Add Project**.
4. Name the project `scholarchain-preprod`.
5. Select **Cardano Preprod** as the network. ⚠️ **Critical:** Do NOT select Mainnet. The project must match the Preprod testnet wallet addresses being queried.
6. Copy the generated `PROJECT_ID` — it will look like `preprod1abc2def3ghi4jkl5mno6pqr7stu8vwx`.
7. Add to `.env.local` (never `.env.example`):
   ```bash
   # Blockfrost — SERVER-SIDE ONLY — NO NEXT_PUBLIC_ PREFIX
   BLOCKFROST_PROJECT_ID=preprod1abc2def3ghi4jkl5mno6pqr7stu8vwx

   # Admin treasury wallet address (read from Firestore config in production)
   # Using env variable here for API route simplicity
   ADMIN_WALLET_ADDRESS=addr_test1...
   ```
8. Confirm the plan quota: free tier provides 50,000 requests/day and 50 requests/second — sufficient for development and demo.
9. Distribute `.env.local` additions to all team members via secure channel. Update `.env.example` with key names but empty values.

**Deliverable:** Blockfrost Preprod project created. `BLOCKFROST_PROJECT_ID` distributed to team. `.env.example` updated.

---

#### Task S5-02 — Install Blockfrost SDK and Create the Server-Side Client

**Estimated Time:** 1 hour

**Objective:** Install the Blockfrost Node.js SDK and create a singleton client module that is imported exclusively by server-side API route handlers.

**Detailed Steps:**
1. Install the SDK:
   ```bash
   npm install @blockfrost/blockfrost-js
   ```
2. Create `lib/blockfrost/client.ts`. This file must only ever be imported in server-side code (`app/api/**`):
   ```ts
   import { BlockFrostAPI } from "@blockfrost/blockfrost-js";

   /**
    * Server-side only Blockfrost client.
    * NEVER import this file in client components or hooks.
    * It reads BLOCKFROST_PROJECT_ID from the server environment.
    */
   let blockfrostClient: BlockFrostAPI | null = null;

   export function getBlockfrostClient(): BlockFrostAPI {
     if (!blockfrostClient) {
       const projectId = process.env.BLOCKFROST_PROJECT_ID;
       if (!projectId) {
         throw new Error(
           "BLOCKFROST_PROJECT_ID is not set. Add it to .env.local (server-side only, no NEXT_PUBLIC_ prefix)."
         );
       }
       blockfrostClient = new BlockFrostAPI({ projectId });
     }
     return blockfrostClient;
   }
   ```
3. The singleton pattern prevents creating a new API client on every request (performance optimization).
4. Add a JSDoc comment at the top of the file: `@server-only — this module must never be imported in browser-executed code`. This is the primary security documentation.
5. Run a quick sanity test: create a temporary API route, call `getBlockfrostClient().health()`, and confirm it returns `{ is_healthy: true }`. Delete the test route after confirming.

**Deliverable:** `lib/blockfrost/client.ts` committed. Blockfrost SDK installed. Sanity test confirmed.

---

#### Task S5-03 — Create the `/api/treasury` Server-Side Route

**Estimated Time:** 1–2 hours

**Objective:** Build the Next.js API route that fetches the Admin's live ADA balance from Blockfrost and returns it as clean JSON to the client. The client never talks directly to Blockfrost — only to this internal route.

**Detailed Steps:**
1. Create `app/api/treasury/route.ts`:
   ```ts
   import { NextResponse } from "next/server";
   import { getBlockfrostClient } from "@/lib/blockfrost/client";

   export interface TreasuryResponse {
     lovelaceBalance: number;
     adaBalance: number;
     address: string;
   }

   export async function GET(): Promise<NextResponse> {
     const adminAddress = process.env.ADMIN_WALLET_ADDRESS;
     if (!adminAddress) {
       return NextResponse.json(
         { error: "Admin wallet address not configured." },
         { status: 500 }
       );
     }

     try {
       const bf = getBlockfrostClient();
       const addressData = await bf.addresses(adminAddress);

       // Blockfrost returns balance as an array of amounts (lovelace + any tokens)
       const lovelaceEntry = addressData.amount.find(a => a.unit === "lovelace");
       const lovelaceBalance = lovelaceEntry ? Number(lovelaceEntry.quantity) : 0;
       const adaBalance = lovelaceBalance / 1_000_000;

       return NextResponse.json({
         lovelaceBalance,
         adaBalance: parseFloat(adaBalance.toFixed(2)),
         address: adminAddress,
       } as TreasuryResponse);

     } catch (err: any) {
       console.error("Blockfrost treasury fetch error:", err);
       return NextResponse.json(
         { error: "Failed to fetch treasury balance. Please try again." },
         { status: 502 }
       );
     }
   }
   ```
2. Test the route: run `npm run dev` and navigate to `http://localhost:3000/api/treasury` in the browser.
3. Confirm the response is JSON with `lovelaceBalance`, `adaBalance`, and `address` fields.
4. Open browser DevTools → Network tab → inspect the request headers. Confirm `BLOCKFROST_PROJECT_ID` is **not visible** anywhere in the response, request headers, or response body.

**Deliverable:** `app/api/treasury/route.ts` — live ADA balance endpoint. API key confirmed absent from client-visible data.

---

#### Task S5-04 — Create the `/api/transactions` Server-Side Route

**Estimated Time:** 2 hours

**Objective:** Build the API route that fetches the Admin wallet's full transaction history from Blockfrost, processes each transaction to extract amount and recipient address, and returns a structured array of transaction records.

**Detailed Steps:**
1. Create `app/api/transactions/route.ts`:
   ```ts
   import { NextRequest, NextResponse } from "next/server";
   import { getBlockfrostClient } from "@/lib/blockfrost/client";

   export interface TransactionSummary {
     txHash: string;
     blockTime: number;          // Unix timestamp
     blockTimeISO: string;       // ISO 8601 date string
     adaAmount: number;          // ADA amount sent OUT of admin wallet
     lovelaceAmount: number;
     recipientAddress: string;   // Primary recipient address
   }

   export async function GET(req: NextRequest): Promise<NextResponse> {
     const adminAddress = process.env.ADMIN_WALLET_ADDRESS;
     if (!adminAddress) {
       return NextResponse.json({ error: "Admin wallet address not configured." }, { status: 500 });
     }

     try {
       const bf = getBlockfrostClient();

       // Step 1: Fetch list of transaction hashes for the Admin's address
       const txList = await bf.addressesTransactions(adminAddress, {
         count: 50,      // Paginate — fetch latest 50 transactions
         order: "desc",  // Most recent first
       });

       // Step 2: For each tx hash, fetch the full transaction UTxO data
       const summaries: TransactionSummary[] = [];
       for (const tx of txList) {
         try {
           const txData = await bf.txsUtxos(tx.tx_hash);
           const blockData = await bf.blocks(tx.block_height.toString());

           // Find the output that is NOT back to the Admin (i.e., the recipient)
           const recipientOutput = txData.outputs.find(
             (out) => out.address !== adminAddress
           );
           if (!recipientOutput) continue; // Skip self-transfers

           const lovelaceOutput = recipientOutput.amount.find(a => a.unit === "lovelace");
           const lovelace = lovelaceOutput ? Number(lovelaceOutput.quantity) : 0;
           const blockTime = blockData.time ?? 0;

           summaries.push({
             txHash: tx.tx_hash,
             blockTime,
             blockTimeISO: new Date(blockTime * 1000).toISOString(),
             lovelaceAmount: lovelace,
             adaAmount: parseFloat((lovelace / 1_000_000).toFixed(2)),
             recipientAddress: recipientOutput.address,
           });
         } catch {
           // Skip individual tx errors — don't fail the whole request
           continue;
         }
       }

       return NextResponse.json({ transactions: summaries, count: summaries.length });

     } catch (err: any) {
       console.error("Blockfrost transactions fetch error:", err);
       return NextResponse.json(
         { error: "Failed to fetch transaction history." },
         { status: 502 }
       );
     }
   }
   ```
2. Test at `http://localhost:3000/api/transactions`. Confirm the response is an array of `TransactionSummary` objects.
3. Add a TypeScript interface file `types/transaction.ts`:
   ```ts
   export interface TransactionSummary {
     txHash: string;
     blockTime: number;
     blockTimeISO: string;
     adaAmount: number;
     lovelaceAmount: number;
     recipientAddress: string;
     scholarName?: string;      // Populated by Christian's enrichment (Task C5-01)
     scholarId?: string;
   }
   ```
4. Export `TransactionSummary` from `types/index.ts`.

**Deliverable:** `app/api/transactions/route.ts` — transaction history endpoint with typed response.

---

#### Task S5-05 — Security Audit: Confirm API Key Isolation

**Estimated Time:** 30 minutes

**Objective:** Definitively verify that `BLOCKFROST_PROJECT_ID` cannot be extracted from the client-side JavaScript bundle — the most critical security requirement of this increment.

**Detailed Steps:**
1. Run `npm run build` to create the production bundle.
2. In the `.next/static/chunks/` directory, run:
   ```bash
   grep -r "BLOCKFROST" .next/static/
   grep -r "preprod1" .next/static/
   ```
   Both greps must return **zero results**.
3. Start the production server (`npm run start`) and inspect via browser DevTools:
   - Open Network tab → filter for `api/treasury` → inspect Response (should have balance data only)
   - Open Sources tab → search for "preprod1" across all loaded JS files → must return no results
4. Document the result: "Security audit passed — BLOCKFROST_PROJECT_ID confirmed absent from client bundle on [date]."
5. Add this audit result to `docs/security-audit-increment-5.md`.

**Deliverable:** `docs/security-audit-increment-5.md` confirming API key isolation. Zero grep results from `.next/static/`.

---

### 🏗️ AUSTINE — Transparency Dashboard Architecture Lead {#austine}

**Domain:** Build the data fetching hooks that call the internal API routes, implement the discrepancy calculation logic, and assemble the complete Transparency Dashboard page architecture.

**Dependency:** Requires Shervin's API routes (S5-03, S5-04) to be live. Can develop with mock API responses initially using `msw` or hardcoded `useState` values.

**Working Branch:** `feature/transparency-dashboard`

---

#### Task A5-01 — Build the `useTreasuryData` Hook

**Estimated Time:** 1–2 hours

**Objective:** Create a React hook that fetches live treasury balance from `/api/treasury` and sponsor pledges from Firebase, and exposes the discrepancy calculation.

**Detailed Steps:**
1. Create `hooks/useTreasuryData.ts`:
   ```ts
   "use client";
   import { useState, useEffect } from "react";
   import { getTotalPledgedADA } from "@/lib/firebase/sponsors";
   import type { TreasuryResponse } from "@/app/api/treasury/route";

   export interface TreasuryData {
     totalPledgedADA: number;
     liveBalanceADA: number;
     totalPaidOutADA: number;
     discrepancyADA: number;
     isAccountable: boolean;
     loading: boolean;
     error: string | null;
   }

   export function useTreasuryData(totalPaidOut: number = 0): TreasuryData {
     const [pledged, setPledged] = useState<number>(0);
     const [liveBalance, setLiveBalance] = useState<number>(0);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
       const fetchAll = async () => {
         setLoading(true);
         try {
           // Parallel fetch: Firebase pledges + Blockfrost live balance
           const [pledgeTotal, treasuryRes] = await Promise.all([
             getTotalPledgedADA(),
             fetch("/api/treasury").then(r => r.json() as Promise<TreasuryResponse>),
           ]);
           setPledged(pledgeTotal);
           setLiveBalance(treasuryRes.adaBalance);
         } catch (err: any) {
           setError(err.message ?? "Failed to load treasury data.");
         } finally {
           setLoading(false);
         }
       };
       fetchAll();
     }, []);

     // BR-017: discrepancy = pledged - (liveBalance + totalPaidOut)
     const discrepancyADA = parseFloat((pledged - (liveBalance + totalPaidOut)).toFixed(2));

     return {
       totalPledgedADA: pledged,
       liveBalanceADA: liveBalance,
       totalPaidOutADA: totalPaidOut,
       discrepancyADA,
       isAccountable: discrepancyADA <= 0,
       loading,
       error,
     };
   }
   ```
2. `Promise.all()` ensures both fetches run simultaneously — never one-after-the-other.
3. Export from `hooks/index.ts`.

**Deliverable:** `hooks/useTreasuryData.ts` — parallel data fetching hook with discrepancy computation.

---

#### Task A5-02 — Build the `useTransactionHistory` Hook

**Estimated Time:** 1–2 hours

**Objective:** Fetch the transaction history from `/api/transactions`, manage loading and error states, and expose the raw transaction list for display and enrichment.

**Detailed Steps:**
1. Create `hooks/useTransactionHistory.ts`:
   ```ts
   "use client";
   import { useState, useEffect } from "react";
   import type { TransactionSummary } from "@/types";

   export function useTransactionHistory() {
     const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
       const fetchTransactions = async () => {
         setLoading(true);
         try {
           const res = await fetch("/api/transactions");
           if (!res.ok) throw new Error(`API error: ${res.status}`);
           const data = await res.json();
           setTransactions(data.transactions ?? []);
         } catch (err: any) {
           setError(err.message ?? "Failed to load transactions.");
         } finally {
           setLoading(false);
         }
       };
       fetchTransactions();
     }, []);

     // Calculate total paid out from the transaction list
     const totalPaidOutADA = transactions.reduce((sum, tx) => sum + tx.adaAmount, 0);

     return { transactions, totalPaidOutADA, loading, error };
   }
   ```
2. `totalPaidOutADA` computed from the ledger is passed to `useTreasuryData` so the discrepancy calculation is accurate.
3. Export from `hooks/index.ts`.

**Deliverable:** `hooks/useTransactionHistory.ts` — transaction history hook with paid-out total.

---

#### Task A5-03 — Assemble the `/transparency` Page

**Estimated Time:** 2 hours

**Objective:** Create the main `/transparency` page that orchestrates the two data hooks and renders all child components in the correct order.

**Detailed Steps:**
1. Create `app/transparency/page.tsx`:
   ```tsx
   "use client";
   import { useTransactionHistory } from "@/hooks/useTransactionHistory";
   import { useTreasuryData } from "@/hooks/useTreasuryData";
   import PledgeVsBalanceCard from "@/components/transparency/PledgeVsBalanceCard";
   import LedgerTable from "@/components/transparency/LedgerTable";
   import DiscrepancyBanner from "@/components/transparency/DiscrepancyBanner";

   export default function TransparencyPage() {
     const { transactions, totalPaidOutADA, loading: txLoading } = useTransactionHistory();
     const treasury = useTreasuryData(totalPaidOutADA);

     return (
       <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
         {/* Header */}
         <div>
           <h1 className="text-3xl font-bold">📊 Transparency Dashboard</h1>
           <p className="text-gray-400 mt-2">
             Real-time accountability. All data is sourced directly from Firebase and the
             Cardano Preprod blockchain — no figures are self-reported by this website.
           </p>
         </div>

         {/* Accountability Scoreboard */}
         <PledgeVsBalanceCard treasury={treasury} />

         {/* Discrepancy Alert (shown only when discrepancy > 0) */}
         {!treasury.loading && !treasury.isAccountable && (
           <DiscrepancyBanner discrepancy={treasury.discrepancyADA} />
         )}

         {/* Ledger Table */}
         <LedgerTable transactions={transactions} loading={txLoading} />
       </main>
     );
   }
   ```
2. Add static page metadata:
   ```ts
   export const metadata = {
     title: "Transparency Dashboard | ScholarChain",
     description: "Public accountability dashboard for the ScholarChain scholarship system.",
   };
   ```
3. Add a link to `/transparency` in the main `Header.tsx` navigation (coordinate with Sherielyn).
4. Add `/transparency` to the landing page (`app/page.tsx`) navigation cards.

**Deliverable:** `app/transparency/page.tsx` — the assembled public accountability page.

---

#### Task A5-04 — Implement Pagination for the Transaction Ledger

**Estimated Time:** 1 hour

**Objective:** Implement client-side pagination for the transaction ledger so it doesn't display 50+ rows at once.

**Detailed Steps:**
1. Add pagination state to the Transparency page:
   ```tsx
   const [currentPage, setCurrentPage] = useState<number>(1);
   const PAGE_SIZE = 10;
   const paginatedTransactions = transactions.slice(
     (currentPage - 1) * PAGE_SIZE,
     currentPage * PAGE_SIZE
   );
   const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
   ```
2. Pass `paginatedTransactions` to `<LedgerTable />`.
3. Render pagination controls below the table: `← Previous | Page X of Y | Next →`.
4. Disable "Previous" on page 1 and "Next" on the last page.

**Deliverable:** Paginated transaction ledger — 10 rows per page with navigation controls.

---

### 🎨 SHERIELYN — Public Dashboard UI & Data Visualization Lead {#sherielyn}

**Domain:** Build all visual components for the Transparency Dashboard: the Pledge vs Balance stat cards, the Discrepancy Banner, the Ledger Table, and the TxHash links. Design should communicate trustworthiness and professionalism to a skeptical public audience.

**Dependency:** Can build all UI components with mock data from Day 1. Plugs into Austine's hooks when ready.

**Working Branch:** `feature/transparency-ui`

---

#### Task SH5-01 — Build the `PledgeVsBalanceCard` Scoreboard Component

**Estimated Time:** 2–3 hours

**Objective:** Create the most prominent visual on the Transparency Dashboard — the side-by-side scoreboard showing Total Pledged vs Live Treasury Balance. This is the "corruption trap" UI.

**Detailed Steps:**
1. Create `components/transparency/PledgeVsBalanceCard.tsx`. Props:
   ```tsx
   interface PledgeVsBalanceCardProps {
     treasury: TreasuryData;
   }
   ```
2. Layout: two large stat cards side-by-side, centered on the page:
   - **Left Card — "Total Pledged by Sponsors":**
     - Large number: `{treasury.totalPledgedADA.toLocaleString()} ADA`
     - Sub-label: "Committed by institutional and private sponsors"
     - Source badge: "📄 Source: Firebase Firestore" in gray
   - **Right Card — "Live Treasury Balance":**
     - Large number: `{treasury.liveBalanceADA.toLocaleString()} ADA`
     - Sub-label: "Current balance of Admin treasury wallet"
     - Source badge: "⛓️ Source: Cardano Preprod Blockchain" in blue
3. Loading skeletons while data loads (pulsing gray rectangles matching the card shape).
4. Add a small "🔄 Data refreshed on page load" timestamp at the bottom of each card.
5. Below both cards, add a third "Accountability Status" card:
   - If `isAccountable`: green background, "✅ Fully Accountable — All pledged funds are accounted for."
   - If `!isAccountable`: amber/red border, "⚠️ Discrepancy Detected — See alert below."
6. All three cards should be visually bold enough to be readable from a projector during the demo.

**Deliverable:** `components/transparency/PledgeVsBalanceCard.tsx` — the accountability scoreboard.

---

#### Task SH5-02 — Build the `DiscrepancyBanner` Component

**Estimated Time:** 1 hour

**Objective:** Create an eye-catching alert banner that renders only when `discrepancyADA > 0`, clearly stating the missing amount.

**Detailed Steps:**
1. Create `components/transparency/DiscrepancyBanner.tsx`. Props: `discrepancy: number`.
2. Design: a full-width alert bar with red/amber background:
   ```tsx
   <div className="border border-red-700 bg-red-950 rounded-lg p-4 flex items-start gap-3">
     <span className="text-2xl">⚠️</span>
     <div>
       <p className="text-red-400 font-bold text-lg">
         Discrepancy Detected: {discrepancy.toLocaleString()} ADA unaccounted for
       </p>
       <p className="text-red-300 text-sm mt-1">
         The total pledged by sponsors ({pledged} ADA) exceeds the sum of the live
         treasury balance plus all recorded payments by {discrepancy} ADA.
         This may indicate funds that have not been deposited or accounted for.
       </p>
     </div>
   </div>
   ```
3. This component is never shown when `isAccountable === true` (handled by parent page).
4. Add a `data-testid="discrepancy-banner"` attribute for Jamiel's automated check.

**Deliverable:** `components/transparency/DiscrepancyBanner.tsx` — discrepancy alert banner.

---

#### Task SH5-03 — Build the `LedgerTable` Component

**Estimated Time:** 3–4 hours

**Objective:** The complete transaction history table — the "receipt book" of every scholarship payment. This is where the system's integrity is proven row-by-row.

**Detailed Steps:**
1. Create `components/transparency/LedgerTable.tsx`. Props:
   ```tsx
   interface LedgerTableProps {
     transactions: TransactionSummary[];
     loading: boolean;
   }
   ```
2. Table columns:
   | Column | Source | Display |
   |---|---|---|
   | **#** | Row index | `1, 2, 3...` |
   | **Date** | `tx.blockTimeISO` | `"Jun 15, 2025 · 14:22 UTC"` |
   | **Amount** | `tx.adaAmount` | `"50.00 ADA"` with teal color |
   | **Recipient** | `tx.scholarName` or `tx.recipientAddress` | Scholar name (if known) or truncated address |
   | **Transaction Hash** | `tx.txHash` | `<TxHashLink txHash={tx.txHash} />` — clickable link to Cardanoscan |

3. For the Recipient column:
   - If `tx.scholarName` exists (set by Christian's enrichment): show `"Scholar #015 (J. Dela Cruz)"` — masked surname initial
   - If no scholar match: show raw truncated address with a copy button
4. Loading state: render 5 skeleton rows with pulsing animation.
5. Empty state: `"No scholarship transactions found on the Cardano Preprod ledger."` with a blockchain icon.
6. Add a table caption: `"Sourced live from the Cardano Preprod blockchain via Blockfrost. Click any Transaction Hash to independently verify on Cardanoscan."`
7. The entire table must be responsive — on mobile, collapse less important columns (keep Date, Amount, and TxHash visible).

**Deliverable:** `components/transparency/LedgerTable.tsx` — the public ledger table.

---

#### Task SH5-04 — Add Source Attribution Footer

**Estimated Time:** 30 minutes

**Objective:** Add a "Data Sources" section at the bottom of the Transparency Dashboard that explains where each data point comes from, building user trust.

**Detailed Steps:**
1. Add a footer section to `app/transparency/page.tsx` (or create `components/transparency/DataSourcesFooter.tsx`):
   ```
   📊 Data Sources
   ┌─────────────────────────────────────────────────────────────────┐
   │ Total Pledged: Firebase Firestore (off-chain sponsor records)   │
   │ Live Balance:  Cardano Preprod Blockchain via Blockfrost API    │
   │ Transactions:  Cardano Preprod Blockchain via Blockfrost API    │
   │ Scholar Names: Firebase Firestore (cross-referenced by address) │
   └─────────────────────────────────────────────────────────────────┘
   This dashboard is read-only. Data is fetched fresh on each page load.
   To independently verify any transaction, click its Transaction Hash link.
   ```
2. Include the Admin wallet address (truncated) so auditors know which wallet is being monitored.
3. Add "Powered by Blockfrost" and a link to Blockfrost.io as attribution.

**Deliverable:** Data Sources footer committed. Full page assembly complete.

---

### 🔗 CHRISTIAN — Data Cross-Reference & Enrichment Engine Lead {#christian}

**Domain:** Implement the data join that combines Blockfrost transaction records (containing raw wallet addresses) with Firebase scholar profiles (containing names and IDs) to produce human-readable entries in the ledger table. Also responsible for computing the total paid out figure.

**Dependency:** Requires Shervin's API route (S5-04) returning `TransactionSummary` records, and the Firebase `getScholarByWalletAddress` function from Increment 3 (Task C3-03).

**Working Branch:** `feature/data-enrichment`

---

#### Task C5-01 — Build the Address-to-Scholar Cross-Reference Function

**Estimated Time:** 2–3 hours

**Objective:** Implement the server-side enrichment function that takes a list of raw Blockfrost transaction records (with recipient wallet addresses) and looks up matching scholars in Firebase by address, appending readable names.

**Detailed Steps:**
1. The enrichment must happen **server-side** in the API route — not in the React component — to avoid exposing all scholar wallet addresses to the public browser. Only masked names should reach the client.
2. Update `app/api/transactions/route.ts` to call an enrichment step:
   ```ts
   // After building the summaries array:
   const enrichedSummaries = await enrichTransactionsWithScholarData(summaries);
   return NextResponse.json({ transactions: enrichedSummaries, count: enrichedSummaries.length });
   ```
3. Create `lib/blockfrost/enrichTransactions.ts`:
   ```ts
   import { getScholarsByWalletAddresses } from "@/lib/firebase/scholars";
   import type { TransactionSummary } from "@/types";

   /**
    * Enriches Blockfrost transaction records with scholar names from Firebase.
    * Masking: returns first name + last initial only (e.g., "Jane D.")
    * If no matching scholar found, scholarName remains undefined.
    *
    * @param transactions - Raw Blockfrost transaction summaries
    * @returns Enriched transactions with optional scholarName and scholarId
    */
   export async function enrichTransactionsWithScholarData(
     transactions: TransactionSummary[]
   ): Promise<TransactionSummary[]> {
     // Collect all unique recipient addresses
     const addresses = [...new Set(transactions.map(tx => tx.recipientAddress))];

     // Batch fetch all matching scholars by wallet address
     const scholars = await getScholarsByWalletAddresses(addresses);

     // Build address → scholar lookup map
     const scholarMap = new Map(
       scholars.map(s => [s.walletAddress, s])
     );

     // Enrich each transaction
     return transactions.map(tx => {
       const scholar = scholarMap.get(tx.recipientAddress);
       if (!scholar) return tx;

       // Mask name: "Jane Dela Cruz" → "Jane D."
       const nameParts = scholar.name.split(" ");
       const maskedName = nameParts.length >= 2
         ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
         : nameParts[0];

       return {
         ...tx,
         scholarName: maskedName,
         scholarId: scholar.id,
       };
     });
   }
   ```
4. Add a new Firebase service function `getScholarsByWalletAddresses` (batch lookup) to `lib/firebase/scholars.ts`:
   ```ts
   /** Batch fetch scholars matching any of the provided wallet addresses */
   export async function getScholarsByWalletAddresses(addresses: string[]): Promise<Scholar[]> {
     if (addresses.length === 0) return [];
     // Firestore `in` query supports max 30 values — chunk if needed
     const chunks: string[][] = [];
     for (let i = 0; i < addresses.length; i += 30) {
       chunks.push(addresses.slice(i, i + 30));
     }
     const results: Scholar[] = [];
     for (const chunk of chunks) {
       const q = query(
         collection(db, "scholars"),
         where("walletAddress", "in", chunk)
       );
       const snap = await getDocs(q);
       snap.docs.forEach(d => results.push({ id: d.id, ...d.data() } as Scholar));
     }
     return results;
   }
   ```

**Deliverable:** `lib/blockfrost/enrichTransactions.ts` integrated into the `/api/transactions` route. Masked scholar names in transaction ledger.

---

#### Task C5-02 — Compute Total Paid Out from Ledger Data

**Estimated Time:** 1 hour

**Objective:** Derive the `totalPaidOutADA` figure from the Blockfrost transaction history so the discrepancy calculation in `useTreasuryData` is accurate and self-consistent.

**Detailed Steps:**
1. Add `totalPaidOutADA` to the `/api/transactions` response:
   ```ts
   const totalPaidOutADA = summaries.reduce((sum, tx) => sum + tx.adaAmount, 0);
   return NextResponse.json({
     transactions: enrichedSummaries,
     count: enrichedSummaries.length,
     totalPaidOutADA: parseFloat(totalPaidOutADA.toFixed(2)),
   });
   ```
2. Update `useTransactionHistory` hook to extract `totalPaidOutADA` from the API response (Austine already has the hook reading this — coordinate to ensure the field name matches exactly).
3. Pass `totalPaidOutADA` from `useTransactionHistory` into `useTreasuryData(totalPaidOutADA)` on the Transparency page.
4. Verify the discrepancy formula: `pledged − (liveBalance + totalPaidOut)`. Write a manual verification in `docs/discrepancy-formula.md`:
   - Example: Pledged = 15,000 ADA. Live Balance = 9,800 ADA. Total Paid Out = 200 ADA.
   - Expected discrepancy: `15,000 − (9,800 + 200) = 5,000 ADA` → This indicates 5,000 ADA was pledged but never deposited.

**Deliverable:** `totalPaidOutADA` in API response. Discrepancy formula documented and verified.

---

#### Task C5-03 — Add Error State Handling for API Route Failures

**Estimated Time:** 1 hour

**Objective:** Ensure the Transparency Dashboard degrades gracefully when either the Blockfrost API or Firebase is temporarily unavailable.

**Detailed Steps:**
1. In `useTreasuryData`, if Blockfrost call fails:
   - Show Pledge card as normal (Firebase data)
   - Replace Live Balance card with: "⚠️ Live balance temporarily unavailable. Retrying..."
   - Do not calculate or show discrepancy (insufficient data)
2. In `useTransactionHistory`, if the transactions API fails:
   - Show the scoreboard cards as normal
   - Replace the ledger table with: "⚠️ Transaction history temporarily unavailable."
3. Add a "Retry" button on each error state that re-calls the failed hook.
4. Add HTTP status codes to error handling: 429 (rate limited) → "Too many requests — please wait a moment and refresh."

**Deliverable:** Error states on both data sources. Page never shows broken/null values.

---

#### Task C5-04 — Write the Transparency Dashboard Integration Test Document

**Estimated Time:** 1 hour

**Objective:** Document the complete data flow for Jamiel's integration test execution.

**Detailed Steps:**
Create `docs/increment-5-integration-test.md`:

**Pre-condition:**
- Sponsors collection has documents with total pledged = X ADA
- Admin wallet has Y ADA balance (confirmed in Eternl)
- Admin wallet has Z completed outgoing transactions (confirmed in Cardanoscan)

**Expected Dashboard Output:**
- "Total Pledged" card shows X ADA (sourced from Firebase)
- "Live Treasury Balance" card shows Y ADA (sourced from Blockfrost)
- Ledger shows Z transactions
- Discrepancy = X − (Y + sum-of-Z-amounts)
- If discrepancy > 0: red banner shown
- If discrepancy ≤ 0: green "Fully Accountable" card shown

**TxHash Verification:**
- For each ledger row: TxHash link opens Cardanoscan → verify amount and recipient match ledger display

**Deliverable:** `docs/increment-5-integration-test.md` — integration test document for Jamiel.

---

### 🧪 JAMIEL — QA, Accountability Verification & Final Demo Lead {#jamiel}

**Domain:** Execute the complete Increment 5 test suite, perform the final regression test across all 5 increments, verify accountability calculations against live blockchain data, and prepare the capstone demo that showcases the full ScholarChain system.

**Working Branch:** `feature/qa-increment-5`

---

#### Task J5-01 — Create Controlled Test Scenarios for Discrepancy Testing

**Estimated Time:** 1–2 hours

**Objective:** Set up specific Firestore sponsor data and wallet states that allow precise testing of both the "Fully Accountable" and "Discrepancy Detected" dashboard states.

**Detailed Steps:**
1. **Scenario A — Fully Accountable State:**
   - In Firestore `sponsors`, ensure total pledgedAmount sums to exactly `X` ADA.
   - Confirm Admin wallet has `Y` ADA live balance where `Y + totalPaidOut ≥ X`.
   - Visit `/transparency` → expect green "Fully Accountable" card, no red banner.
2. **Scenario B — Discrepancy State (for demo/testing):**
   - Temporarily add a large sponsor pledge in Firestore (e.g., add a record with `pledgedAmount: 999999`).
   - This will make `totalPledged >> (liveBalance + totalPaidOut)`.
   - Visit `/transparency` → expect red "⚠️ Discrepancy Detected" banner.
   - Remove the test record after the test.
3. Document both scenarios with screenshots in `docs/increment-5-discrepancy-tests/`.

**Deliverable:** Controlled test data + screenshots for both dashboard states. Test record cleaned up after testing.

---

#### Task J5-02 — Write and Execute the Increment 5 Test Plan

**Estimated Time:** 3–4 hours

**Objective:** Comprehensive test coverage for all Increment 5 functionality.

**Detailed Steps:**
Create and execute `docs/increment-5-test-plan.md`:

**Section 1: API Security**

| ID | Test Case | Expected Result |
|---|---|---|
| SEC-01 | `BLOCKFROST_PROJECT_ID` not in browser bundle | `grep -r "preprod1" .next/static/` returns zero results |
| SEC-02 | `/api/treasury` accessible only via internal fetch | Returns JSON balance data, no API key visible in response |
| SEC-03 | `/api/transactions` returns data without exposing credentials | JSON response has no API key or env variables |
| SEC-04 | Direct browser access to `/api/treasury` returns correct data | Balance returned correctly |

**Section 2: Scoreboard Cards**

| ID | Test Case | Expected Result |
|---|---|---|
| SCO-01 | "Total Pledged" matches Firebase sponsor sum | Manually sum Firestore records; compare to UI |
| SCO-02 | "Live Balance" matches Admin wallet in Eternl | Open Eternl; compare to dashboard value |
| SCO-03 | Both cards show loading skeleton while fetching | Gray pulsing rectangles visible for ~1-3s |
| SCO-04 | Fully Accountable state renders correctly | Green "✅ Fully Accountable" card shown |
| SCO-05 | Discrepancy Detected state renders correctly | Red "⚠️ Discrepancy" banner shown with correct amount |
| SCO-06 | No wallet prompt on `/transparency` | Page loads fully with no wallet connect dialog |

**Section 3: Transaction Ledger**

| ID | Test Case | Expected Result |
|---|---|---|
| LED-01 | Ledger shows all Admin outgoing transactions | Count matches Cardanoscan tx history for Admin wallet |
| LED-02 | ADA amounts match Cardanoscan values | Manually spot-check 3 rows against Cardanoscan |
| LED-03 | Dates match Cardanoscan block times | Within 1 minute of Cardanoscan timestamp |
| LED-04 | Known scholar address shows masked name | "Jane D." instead of raw address |
| LED-05 | Unknown address shows truncated raw address | `addr_test1...abc` format |
| LED-06 | TxHash links open Cardanoscan in new tab | Opens correct transaction page |
| LED-07 | Cardanoscan shows same amount as ledger | Amount on explorer matches ledger row |
| LED-08 | Pagination renders correctly | 10 rows per page; controls work |
| LED-09 | Empty ledger state shown when no transactions | "No scholarship transactions found" message |

**Section 4: Regression Tests (All Prior Increments)**

| ID | Test Case | Expected Result |
|---|---|---|
| REG-01 | Inc 1: Admin can send ADA | TxHash returned |
| REG-02 | Inc 2: Scholar application form works | Firestore document created |
| REG-03 | Inc 3: Mint Scholar ID → Scholar Portal access | NFT minted; portal accessible |
| REG-04 | Inc 4: Multi-asset reward sent | Both ADA + tokens received by scholar |
| REG-05 | Inc 5: New payment appears in ledger after refresh | Latest tx shown at top of table |

Execute all 24 test cases. File GitHub Issues for any failures.

**Deliverable:** Fully executed `docs/increment-5-test-plan.md`. All 24 test cases ✅. Final sign-off granted.

---

#### Task J5-03 — Perform the Accountability Cross-Verification

**Estimated Time:** 1–2 hours

**Objective:** Manually verify the discrepancy calculation by independently computing all three inputs (pledged, live balance, paid out) from their original sources and confirming the dashboard shows the correct result.

**Detailed Steps:**
1. Open Firebase Console → `sponsors` collection. Manually sum all `pledgedAmount` values. Write down: **Pledged = X ADA**.
2. Open Eternl wallet (Admin). Record current balance: **Live Balance = Y ADA**.
3. Open `preprod.cardanoscan.io`. Search Admin wallet address. Go to "Transactions" tab. Sum all outgoing ADA amounts: **Total Paid Out = Z ADA**.
4. Compute manually: `Discrepancy = X − (Y + Z)`.
5. Open `/transparency` in browser. Record what the dashboard shows for each value.
6. Compare manual calculation vs dashboard display — they must match exactly (within ±0.01 ADA rounding).
7. Screenshot both the manual calculation and the dashboard. Add to `docs/accountability-cross-verification.md`.

**Deliverable:** `docs/accountability-cross-verification.md` with independent manual verification confirming dashboard accuracy.

---

#### Task J5-04 — Prepare the Final Capstone Demo Script

**Estimated Time:** 3 hours

**Objective:** Write and rehearse the ultimate ScholarChain demo that walks through all 5 increments end-to-end in a compelling, narrative-driven presentation of 10–12 minutes.

**Detailed Steps:**
Create `docs/final-capstone-demo-script.md`:

---

**SCHOLARCHAIN — FINAL CAPSTONE DEMO**
**Target Duration:** 10–12 minutes
**Story Arc:** *"From a student's application to a public-auditable, blockchain-verified scholarship payment — with nothing to hide and everything to prove."*

---

**PRE-DEMO SETUP (10 min before presenting):**
- [ ] Chrome open with 3 tabs: Admin Dashboard, Scholar Portal, Transparency Dashboard
- [ ] Eternl open with Admin Wallet (connected, on Preprod)
- [ ] Second Eternl instance / profile: Scholar Wallet A (has Scholar Badge NFT + some ADA)
- [ ] Firebase Console open in a 4th tab (to show live data updates)
- [ ] `localhost:3000` dev server running with zero console errors
- [ ] `npm run build && npm run start` done once to confirm production build works
- [ ] Test wallets funded. Admin has 20+ tADA. Scholar Wallet A has 2+ tADA.
- [ ] At least one Scholar in Firestore with `status: "Approved"` and `achievement.rewardStatus: "Pending Review"`

---

**SCENE 1 — THE PROBLEM (0:00 – 0:45)**
*"Every year, scholarship funds go missing. Administrators claim they've dispersed money that never reaches students. There's no receipt, no audit trail, no accountability. ScholarChain solves this with three words: the blockchain never lies."*

Open `localhost:3000`. Show the landing page.

---

**SCENE 2 — INCREMENT 1: THE PLUMBING (0:45 – 2:00)**
*"We start with the most fundamental proof: can a browser talk to a blockchain?"*

1. Click **Admin Portal**. Click **Connect Wallet**. Approve in Eternl.
2. Show address + balance displayed. *"The Admin is authenticated — not by a username, but by cryptographic ownership of this wallet."*
3. Show the manual Send form. Enter a test recipient address and 2 ADA. Send. Sign. Show TxHash + Cardanoscan link. *"Real ADA. Real blockchain. Increment 1 done."*

---

**SCENE 3 — INCREMENT 2: THE DUAL REGISTRY (2:00 – 4:00)**
*"In a real system, the Admin shouldn't be typing addresses manually. Students apply, data goes to a database, and the dashboard fetches it automatically."*

1. Open `/apply` in a new tab. Fill out as "Maria Santos, BS Information Technology." Submit. Switch to Firebase Console tab. Show new document: *"status: Pending — live."*
2. Switch to Admin Dashboard. Open Firebase Console and change status to "Approved." Refresh dashboard. Show Scholar Table with Maria's row.
3. Click "Send ADA" on Maria's row. *"Notice — no address typed. It came from the database."* Sign. Show TxHash. Switch back to Firebase Console — show `lastPaidTxHash` now set.

---

**SCENE 4 — INCREMENT 3: THE DIGITAL BADGE (4:00 – 6:30)**
*"ADA payments prove money moved. But how does a student prove they're a legitimate scholar? With an NFT credential that can't be faked."*

1. Back to Admin Dashboard. Find a Pending scholar. Click **Mint Scholar ID**. Sign. TxHash returned. Click it — Cardanoscan shows NFT metadata: name, course, IPFS badge image. *"This badge is permanently on the Cardano blockchain. It cannot be forged, deleted, or transferred without the owner's consent."*
2. Switch to Scholar Portal tab. Connect Non-Scholar Wallet → Access Denied. *"Wrong wallet."*
3. Switch Eternl to Scholar Wallet A (has the badge). Connect. Scanning animation. *"The system is scanning the wallet..."* Scholar Dashboard appears. *"The NFT IS the password."*

---

**SCENE 5 — INCREMENT 4: THE INCENTIVE ENGINE (6:30 – 9:00)**
*"Scholarships cover living costs. But exceptional performance deserves recognition — and that recognition can be tokenized."*

1. Admin Dashboard → Treasury tab. Enter 5,000. Click Mint. Sign. Show SCHOLAR tokens in Eternl. *"The institution has 5,000 SCHOLAR reward tokens. Real Cardano native tokens."*
2. Switch to Scholar Portal. In the Achievement section, submit: "Algorithms, A+, [proof link]." Switch to Admin Dashboard → Rewards tab. Scholar appears with submitted grade and proof link.
3. Enter 50 ADA and 200 SCHOLAR tokens. Click **Approve & Send Reward**. Sign. *"One transaction. Two assets. No smart contract."*
4. Click TxHash → Cardanoscan. Show both ADA and SCHOLAR tokens in a single transaction output. Switch to Scholar Portal — show "🎉 Reward Received: 50 ADA + 200 SCHOLAR."

---

**SCENE 6 — INCREMENT 5: THE GLASS HOUSE (9:00 – 11:30)**
*"Everything we've done so far is great — but how does a donor know the Admin isn't pocketing money? Welcome to the Glass House."*

1. Open `/transparency` tab. *"No wallet. No login. Public. Anyone can see this."*
2. Show the two stat cards loading. *"Left card: total pledged by sponsors — from our database. Right card: live treasury balance — from the Cardano blockchain via Blockfrost. These are two separate, independent sources."*
3. Show "✅ Fully Accountable" card. *"The numbers add up."*
4. Scroll to ledger table. *"Every payment ever made, in order, with the recipient name — cross-referenced from our database — and a clickable receipt."*
5. Click a TxHash. Cardanoscan opens. *"This is not our website. This is the global Cardano network. The transaction is there, immutable, exactly as we said."*
6. Back in Firebase Console, temporarily add a large sponsor pledge. Refresh Transparency page. The Discrepancy banner appears in red. *"If anyone pledges funds that don't show up in the treasury, this flag lights up automatically. The Admin is mathematically trapped."* Delete the test record. Refresh → green again.

---

**CLOSING (11:30 – 12:00)**
*"Five increments. One unified system. Student applications, NFT identity credentials, blockchain payments, token rewards, and public accountability — all running on the Cardano blockchain. ScholarChain: where scholarship funds have nowhere to hide."*

---

**FALLBACK PLANS:**

| Problem | Response |
|---|---|
| Blockfrost returns 429 rate limit | Show pre-cached screenshot of dashboard with explanation |
| Cardanoscan is slow to load | Have a pre-opened Cardanoscan tab with a known TxHash ready |
| SCHOLAR token unit format error in multi-asset tx | Show pre-recorded screen capture of successful multi-asset tx |
| Eternl popup doesn't appear | Refresh page, disconnect, reconnect wallet |
| Transparency balance shows wrong value | Explain: "Preprod indexer can lag 30-60 seconds — this is expected on testnet" |

---

**DELIVERABLE:** `docs/final-capstone-demo-script.md` fully rehearsed. Full team dry-run completed. All contingencies prepared.

---

## 6. Parallel Development Strategy & Dependency Map {#parallel}

```
DAY 1                          DAY 2                        DAY 3-4
─────────────────────────────────────────────────────────────────────────
SHERVIN
  S5-01: Blockfrost Account ────►│
  S5-02: SDK + Client ───────────►│ API routes buildable
  S5-03: /api/treasury ──────────►│
  S5-04: /api/transactions ───────────────────────────────►│
  S5-05: Security Audit ──────────────────────────────────────────────►│

AUSTINE                          │
  (can mock API while S5-03/04)  ├── A5-01: useTreasuryData() ──► A5-02: useTransactionHistory() ──► A5-03: /transparency page ──► A5-04: Pagination

SHERIELYN                        │
  (builds with mock props)       ├── SH5-01: PledgeVsBalance ────► SH5-02: DiscrepancyBanner ──► SH5-03: LedgerTable ──► SH5-04: Footer

CHRISTIAN                        │
  (waits for S5-04 for live test)│                           C5-01: enrichTransactions() ──► C5-02: totalPaidOut ──► C5-03: Error States ──► C5-04: Integration Test Doc

JAMIEL                           │
  J5-01: Test Scenarios ─────────►│                          J5-02: Test Execution ─────────────────────────────► J5-03: Accountability Verify ──► J5-04: Capstone Demo Script
─────────────────────────────────────────────────────────────────────────
```

---

## 7. Integration Checklist {#integration}

- [ ] `BLOCKFROST_PROJECT_ID` confirmed absent from `.next/static/` bundle (Shervin's security audit)
- [ ] `/api/treasury` returns `adaBalance` as a Number in ADA (not Lovelaces)
- [ ] `/api/transactions` returns `adaAmount` as ADA (not Lovelaces) — conversion done server-side
- [ ] `totalPaidOutADA` flows from `useTransactionHistory` → `useTreasuryData` correctly
- [ ] Discrepancy formula: `pledged − (liveBalance + totalPaidOut)` — not a simpler incorrect formula
- [ ] `Promise.all()` used for parallel Firebase + Blockfrost fetches (not sequential)
- [ ] `/transparency` page has zero wallet connection prompts or MeshJS hooks
- [ ] Scholar names masked to "First L." format — no full names or wallet addresses on public ledger
- [ ] TxHash links use `target="_blank"` and `rel="noopener noreferrer"`
- [ ] TxHash links point to `preprod.cardanoscan.io` — not `localhost` or ScholarChain URL
- [ ] Loading skeletons on both cards and ledger table
- [ ] Discrepancy banner only renders when `discrepancyADA > 0`
- [ ] Error states render gracefully when Blockfrost or Firebase is unavailable
- [ ] All 24 test cases in `docs/increment-5-test-plan.md` marked ✅
- [ ] Capstone demo script rehearsed end-to-end by full team

---

## 8. Branch & Git Strategy {#git}

```
main (protected)
  ├── feature/blockfrost-infrastructure   (Shervin)
  ├── feature/transparency-dashboard      (Austine)
  ├── feature/transparency-ui             (Sherielyn)
  ├── feature/data-enrichment             (Christian)
  └── feature/qa-increment-5             (Jamiel)
```

### Recommended Merge Order
1. Shervin: `feature/blockfrost-infrastructure` (API routes — unblocks all data fetching)
2. Sherielyn: `feature/transparency-ui` (components only — no data dependency)
3. Christian: `feature/data-enrichment` (updates `/api/transactions` route — coordinate with Shervin)
4. Austine: `feature/transparency-dashboard` (assembles page from components + hooks)
5. Jamiel: `feature/qa-increment-5` (docs + final verification)

---

## 9. Daily Standup Template {#standup}

```
👤 [Name] — [Date] — Increment 5 (Final)

✅ DONE: [Task ID + description]
🔨 DOING: [Current focus]
🚧 BLOCKED: [Blocker + who can resolve]
📢 NEEDS FROM TEAM: [Any final coordination or sign-offs needed]
🎯 DEMO READY: [Yes / Partially / No — and what's blocking]
```

---

## 10. Risk Register {#risks}

| ID | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R5-01 | Blockfrost Preprod indexer lags — balance appears stale | Medium | Medium | Add "last updated" timestamp from Blockfrost response; explain in demo that testnet can lag | Shervin |
| R5-02 | Blockfrost rate limit (429) hit during demo | Low | High | Pre-fetch and cache response in a `useState` on page load; show "last fetched" time if 429 occurs | Austine |
| R5-03 | `getScholarsByWalletAddresses` returns empty despite matching scholars (Firestore trim mismatch) | Medium | Medium | Ensure `.trim()` on all wallet addresses at write time (Increment 2, Task C2-01) | Christian |
| R5-04 | `BLOCKFROST_PROJECT_ID` accidentally committed to Git | Low | Critical | `.env.local` is in `.gitignore`; run `git log --all -S "preprod1"` to confirm no leaks | Shervin |
| R5-05 | Total Paid Out calculation double-counts change outputs | Medium | High | Filter only outputs where address ≠ Admin wallet (already in S5-04 implementation) | Shervin/Christian |
| R5-06 | Discrepancy formula shows negative (more in treasury than pledged) | Low | Low | Negative discrepancy means more deposited than pledged — show as "Surplus" in green, not an error | Austine |
| R5-07 | Demo timing overruns (>12 min) | Medium | Medium | Rehearse at least twice with a timer. Pre-approve which scenes to cut if running long (cut Scene 2 manual form, jump to Scene 3) | Jamiel |

---

## 11. Final Project Retrospective Template {#retro}

> To be completed by the full team after the final demo/defense. Use this as a guide for the team debrief.

```
🎓 SCHOLARCHAIN — PROJECT RETROSPECTIVE

📅 Date: _______________
👥 Attendees: Shervin, Austine, Sherielyn, Christian, Jamiel

─────────────────────────────────────────────────────────────

✅ WHAT WENT WELL (one per person, round-robin):
  1. [Shervin]:
  2. [Austine]:
  3. [Sherielyn]:
  4. [Christian]:
  5. [Jamiel]:

─────────────────────────────────────────────────────────────

🔁 WHAT WE'D DO DIFFERENTLY:
  1.
  2.
  3.

─────────────────────────────────────────────────────────────

🏆 BIGGEST TECHNICAL WIN OF THE PROJECT:
  (The moment the team is most proud of — e.g., "First multi-asset tx on Cardano")

─────────────────────────────────────────────────────────────

💡 KEY LEARNINGS:
  Blockchain:
  React/Next.js:
  Team Process:

─────────────────────────────────────────────────────────────

🚀 IF WE HAD MORE TIME (Backlog for production version):
  □ Time-locked minting policies (production-grade NFT security)
  □ Firebase Authentication for role-based admin access
  □ Mainnet deployment with real ADA
  □ Automated approval workflows (smart contracts / Plutus)
  □ CSV export of transparency ledger
  □ SCHOLAR token governance/voting mechanism
  □ Multi-institution support

─────────────────────────────────────────────────────────────

📊 FINAL METRICS:
  Total Increments Delivered: 5 / 5
  Total On-Chain Transactions Executed: ___
  Total NFTs Minted: ___
  Total SCHOLAR Tokens Distributed: ___
  Total Test Cases Passed: ___ / ___
  Final Demo Duration: ___ minutes
```

---

*Document Version: 1.0 · ScholarChain Team · Final Increment · Approved for Execution ✅*

---

> *"The blockchain never lies. Neither do we."*
> — ScholarChain Team
