# Increment 5 — Integration Test Document

**Author:** Christian  
**Purpose:** Pre-condition setup and expected dashboard output for verifying the full data pipeline — Firebase → Blockfrost → Transparency Dashboard.

---

## Pre-Conditions

Before running the integration test, record the following ground-truth values from their source systems:

### 1. Firebase — Total Pledged

Open [Firebase Console](https://console.firebase.google.com) → Project `scholarchain-dev` → Firestore → `sponsors` collection.

Manually sum all `pledgedAmount` fields across every sponsor document:

| Sponsor Document ID | pledgedAmount (ADA) |
|---------------------|---------------------|
| _(list each)_       |                     |
| **TOTAL (X)**       | **________ ADA**    |

### 2. Admin Wallet — Live Balance

Open Eternl wallet connected to Preprod. Record the current ADA balance:

**Live Balance (Y) = ________ ADA**

Also record the wallet address for reference:
`addr_test1qz3dkjjfaykf82kcfzut3za58muaa07q7f60mz2dp0ru20arf8dpxym30hqgsvyjdz4qaya8qr2mltqv642d8cr6mems0utre8`

### 3. Cardano Preprod — Outgoing Transactions

Open [preprod.cardanoscan.io](https://preprod.cardanoscan.io), search the Admin wallet address. Go to **Transactions** tab and count all outgoing (sent) transactions:

| TxHash (first 12 chars) | ADA Sent | Recipient |
|-------------------------|----------|-----------|
| _(list each)_           |          |           |
| **Total Paid Out (Z)**  | **________ ADA** | |

---

## Discrepancy Formula Verification

```
Discrepancy = X − (Y + Z)

Where:
  X = Total Pledged (Firebase)
  Y = Live Balance (Blockfrost / Eternl)
  Z = Total Paid Out (Blockfrost transaction history)
```

**Manual calculation:**
```
Discrepancy = ________ − (________ + ________)
            = ________ ADA
```

- If result ≤ 0 → **"Fully Accountable"** state expected (green card)
- If result > 0 → **"Discrepancy Detected"** state expected (red banner, showing exact ADA amount)

---

## Expected Dashboard Output

Open `/transparency` in the browser (no wallet required). Verify each item:

| Dashboard Element | Expected Value | Actual Value | Pass? |
|-------------------|---------------|--------------|-------|
| "Total Pledged" card | X ADA (from Firebase) | | |
| "Live Treasury Balance" card | Y ADA (from Blockfrost) | | |
| "Total Paid Out" card | Z ADA (from Blockfrost) | | |
| Accountability Status card | Green ✅ (if X ≤ Y+Z) or Amber ⚠️ (if X > Y+Z) | | |
| Discrepancy Banner | Shown only if X > Y+Z | | |
| Ledger row count | Matches Z transaction count | | |
| Scholar name masking | "First L." format (e.g., "Maria S.") | | |
| Unknown address | Truncated `addr_test1…abc` format | | |

---

## TxHash Spot-Check (3 rows minimum)

For each checked row, click the TxHash link and verify the Cardanoscan page shows matching data:

| Row # | Dashboard ADA | Cardanoscan ADA | Dashboard Recipient | Pass? |
|-------|--------------|-----------------|---------------------|-------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## API Route Direct Verification

Test the API routes directly in the browser to confirm they return expected values:

| URL | Expected | Actual | Pass? |
|-----|----------|--------|-------|
| `http://localhost:3000/api/treasury` | `{ adaBalance: Y, lovelaceBalance: Y*1000000, address: "addr_test1..." }` | | |
| `http://localhost:3000/api/transactions` | `{ transactions: [...], count: Z, totalPaidOutADA: Z_sum }` | | |

---

## Error State Verification

| Scenario | How to Trigger | Expected UI | Pass? |
|----------|---------------|-------------|-------|
| Treasury API failure | Temporarily set `ADMIN_WALLET_ADDRESS=""` in `.env.local`, restart dev server | Red error alert with "Retry" button replaces scoreboard cards | |
| Transactions API failure | Temporarily set `ADMIN_WALLET_ADDRESS=""` | Red error alert with "Retry" button replaces ledger table | |
| Retry button works | Click "Retry" after restoring env var | Data loads successfully | |

Restore `.env.local` after error state testing.

---

## Sign-Off

| Role | Name | Verified | Date |
|------|------|----------|------|
| Data Enrichment Lead | Christian | ☐ | |
| QA Lead | Jamiel | ☐ | |
