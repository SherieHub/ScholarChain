# Accountability Cross-Verification

**Author:** Jamiel  
**Purpose:** Independently verify the Transparency Dashboard discrepancy calculation by computing all three inputs from their original sources and confirming the dashboard matches.

---

## Verification Formula

```
Discrepancy = Pledged − (Live Balance + Total Paid Out)
```

- A result of **0 or negative** → "Fully Accountable" (all funds are present or more than pledged)
- A result **greater than 0** → "Discrepancy Detected" (pledged funds not fully in treasury)

---

## Step 1 — Source: Firebase (Total Pledged)

**Where:** Firebase Console → `scholarchain-dev` → Firestore → `sponsors` collection

Manually sum all `pledgedAmount` fields:

| Sponsor ID | pledgedAmount (ADA) |
|------------|---------------------|
| | |
| | |
| | |
| **TOTAL** | **X = ________ ADA** |

---

## Step 2 — Source: Eternl / Cardano Wallet (Live Balance)

**Where:** Eternl wallet extension → Preprod network → Admin wallet

Record the current ADA balance:

**Y = ________ ADA**  
**Recorded at:** ________ (time)

---

## Step 3 — Source: Cardanoscan (Total Paid Out)

**Where:** [preprod.cardanoscan.io](https://preprod.cardanoscan.io) → search Admin wallet address → Transactions tab

Sum all **outgoing** ADA transactions (exclude self-transfers and change outputs):

| TxHash (first 12 chars) | Date | ADA Sent |
|-------------------------|------|----------|
| | | |
| | | |
| | | |
| | | |
| | | |
| **TOTAL** | | **Z = ________ ADA** |

---

## Step 4 — Manual Discrepancy Calculation

```
Discrepancy = X − (Y + Z)
            = ________ − (________ + ________)
            = ________ ADA
```

**Expected dashboard state:**
- [ ] ≤ 0 ADA → "✅ Fully Accountable" (green card, no banner)
- [ ] > 0 ADA → "⚠️ Discrepancy Detected" (red banner showing exact amount)

---

## Step 5 — Dashboard Comparison

Open `/transparency` in the browser. Record what the dashboard displays:

| Value | Manual Calculation | Dashboard Display | Match? |
|-------|-------------------|-------------------|--------|
| Total Pledged | X = ________ ADA | ________ ADA | ☐ |
| Live Balance | Y = ________ ADA | ________ ADA | ☐ |
| Total Paid Out | Z = ________ ADA | ________ ADA | ☐ |
| Discrepancy | ________ ADA | ________ ADA | ☐ |
| Accountability Status | ☐ Accountable / ☐ Discrepancy | ☐ Accountable / ☐ Discrepancy | ☐ |

**Tolerance:** Values are considered matching if they are within ±0.01 ADA (rounding from Lovelace conversion).

---

## Step 6 — TxHash Independent Verification

Pick the 3 most recent transactions from the ledger table and verify each on Cardanoscan:

| Ledger Row | TxHash (first 10 chars) | Dashboard ADA | Cardanoscan ADA | Match? |
|------------|------------------------|---------------|-----------------|--------|
| 1 | | | | ☐ |
| 2 | | | | ☐ |
| 3 | | | | ☐ |

---

## Conclusion

- [ ] All dashboard values match independently sourced values (within tolerance)
- [ ] TxHash spot-checks confirmed on Cardanoscan
- [ ] Discrepancy state (if any) is correctly flagged
- [ ] No fabricated or cached values detected

**Overall Verdict:** ☐ PASS &nbsp;&nbsp; ☐ FAIL

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | Jamiel | | |
| Infrastructure Lead | Shervin | | |
