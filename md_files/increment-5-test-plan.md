# Increment 5 — Glass House: Test Plan

**Author:** Jamiel  
**Total Test Cases:** 24  
**Target:** `/transparency` page, `/api/treasury`, `/api/transactions`

---

## Roles

| Role | Access | Notes |
|------|--------|-------|
| Observer | No wallet needed | Anyone can access `/transparency` |
| Admin | Eternl on Preprod | Needed for regression tests only |
| Scholar | Scholar wallet with NFT | Needed for regression tests only |

---

## Pre-Test Checklist

- [ ] Dev server running: `npm run dev`
- [ ] `BLOCKFROST_PROJECT_ID` set in `.env.local`
- [ ] `ADMIN_WALLET_ADDRESS` set in `.env.local`
- [ ] Admin wallet has at least one outgoing transaction on Preprod
- [ ] Firebase `sponsors` collection has at least one document with `pledgedAmount > 0`
- [ ] Production bundle built: `npx next build --webpack` (for SEC tests)

---

## Section 1 — API Security

| ID | Test Case | Steps | Expected Result | Pass? |
|----|-----------|-------|-----------------|-------|
| SEC-01 | `BLOCKFROST_PROJECT_ID` not in browser bundle | Run `grep -r "BLOCKFROST" .next/static/` and `grep -r "preprodlWl7" .next/static/` | Both return **0 matches** | |
| SEC-02 | `/api/treasury` returns balance, not API key | Open `http://localhost:3000/api/treasury` in browser; inspect response body | JSON with `adaBalance`, `lovelaceBalance`, `address` — no `BLOCKFROST_PROJECT_ID` field | |
| SEC-03 | `/api/transactions` returns data, not credentials | Open `http://localhost:3000/api/transactions` in browser | JSON with `transactions`, `count`, `totalPaidOutADA` — no API key in response | |
| SEC-04 | `/transparency` loads with no wallet prompt | Open `/transparency` in a private browser tab with no wallet extension | Page loads fully; no wallet connect dialog appears | |

---

## Section 2 — Scoreboard Cards

| ID | Test Case | Steps | Expected Result | Pass? |
|----|-----------|-------|-----------------|-------|
| SCO-01 | "Total Pledged" matches Firebase sum | Sum all `pledgedAmount` in Firestore `sponsors`; compare to dashboard card | Values match within ±0.01 ADA | |
| SCO-02 | "Live Balance" matches Admin wallet in Eternl | Open Eternl; compare ADA balance to dashboard card | Values match within ±0.5 ADA (testnet indexer lag acceptable) | |
| SCO-03 | "Total Paid Out" matches Cardanoscan | Sum outgoing transactions on Cardanoscan; compare to dashboard | Values match within ±0.01 ADA | |
| SCO-04 | Loading skeletons shown while fetching | Open `/transparency`; observe immediately | Pulsing gray rectangles visible in card areas for 1–3 s | |
| SCO-05 | "Fully Accountable" state renders | Ensure `pledged ≤ liveBalance + paidOut` | Green "✅ Fully Accountable" card shown; no red banner | |
| SCO-06 | "Discrepancy Detected" state renders | Add large sponsor pledge in Firestore temporarily (e.g., `pledgedAmount: 999999`) | Red "⚠️ Discrepancy Detected" banner shown with correct ADA amount | |
| SCO-07 | Discrepancy banner disappears after pledge removed | Delete the test sponsor record; reload page | Green "✅ Fully Accountable" card shown again | |

---

## Section 3 — Transaction Ledger

| ID | Test Case | Steps | Expected Result | Pass? |
|----|-----------|-------|-----------------|-------|
| LED-01 | Ledger row count matches Cardanoscan | Count outgoing txs on Cardanoscan; compare to total ledger rows | Counts match | |
| LED-02 | ADA amounts match Cardanoscan (spot-check 3 rows) | Click 3 TxHash links; compare amounts | Dashboard amount = Cardanoscan amount for each row | |
| LED-03 | Dates match Cardanoscan block times | Compare ledger date for a known tx to Cardanoscan block time | Within 1 minute | |
| LED-04 | Known scholar address shows masked name | Find a row where recipient is a known scholar wallet | Shows "First L." format (e.g., "Maria S.") | |
| LED-05 | Unknown address shows truncated address | Find a row with no matching scholar | Shows `addr_test1...abc` truncated format | |
| LED-06 | TxHash links open Cardanoscan in new tab | Click any TxHash link | Opens `https://preprod.cardanoscan.io/transaction/{hash}` in new tab | |
| LED-07 | Cardanoscan tx amount matches ledger row | Cross-check clicked TxHash against ledger amount | Amounts are equal | |
| LED-08 | Pagination renders correctly | If > 10 transactions exist, verify page controls | Shows "← Prev | Page 1 of N | Next →"; Next button works; Previous disabled on page 1 | |
| LED-09 | Empty ledger state (no transactions) | Temporarily use a wallet address with no outgoing txs | "No transactions found." message shown | |

---

## Section 4 — Error Handling

| ID | Test Case | Steps | Expected Result | Pass? |
|----|-----------|-------|-----------------|-------|
| ERR-01 | Treasury error shows alert with Retry | Set `ADMIN_WALLET_ADDRESS=""` in `.env.local`; restart dev server; open `/transparency` | Red error alert with message + "Retry" button shown in place of scoreboard cards | |
| ERR-02 | Retry button reloads treasury data | After ERR-01, restore `ADMIN_WALLET_ADDRESS`; click "Retry" | Cards load correctly | |
| ERR-03 | Transactions error shows alert with Retry | Same as ERR-01 for ledger section | Red error alert with "Retry" button shown in place of ledger table | |

---

## Section 5 — Regression (All Prior Increments)

| ID | Test Case | Expected Result | Pass? |
|----|-----------|-----------------|-------|
| REG-01 | Inc 1: Admin can send ADA manually | TxHash returned; Firestore updated | |
| REG-02 | Inc 2: Scholar application form works | Firestore document created with `status: "Pending"` | |
| REG-03 | Inc 3: Mint Scholar ID + portal access | NFT minted; Scholar Portal accessible with that wallet | |
| REG-04 | Inc 4: SCHOLAR token mint succeeds | Token supply minted; `tokenPolicyId` saved to Firestore | |
| REG-05 | Inc 4: Multi-asset reward sent | Single tx delivers ADA + SCHOLAR tokens to scholar | |
| REG-06 | Inc 5: New payment appears in ledger | After sending ADA, reload `/transparency` | Latest tx appears at top of ledger | |

---

## Quick 5-Minute Smoke Test

```
1. [Observer] Open /transparency in a private tab (no wallet)
   ✓ Page loads — no wallet prompt

2. [Observer] Check scoreboard cards loaded
   ✓ "Total Pledged", "Live Treasury Balance", "Total Paid Out" all show numbers

3. [Observer] Check accountability status
   ✓ Green "Fully Accountable" OR red discrepancy banner visible

4. [Observer] Click any TxHash in the ledger
   ✓ Cardanoscan opens in new tab with matching transaction

5. [Observer] Reload page
   ✓ Data refreshes; no console errors
```

---

## Sign-Off

All 24 test cases must be marked ✅ before Increment 5 is declared complete.

| Role | Name | Signed Off | Date |
|------|------|------------|------|
| QA Lead | Jamiel | ☐ | |
| Infrastructure Lead | Shervin | ☐ | |
| Demo Lead | Jamiel | ☐ | |
