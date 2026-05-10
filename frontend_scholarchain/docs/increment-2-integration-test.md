# Increment 2 — DB-to-Chain Integration Test

> Authored by Christian (C2-04). Run by Jamiel during QA (Task J2-02, TXF-01 through TXF-07).

---

## Pre-conditions

Before running this test, confirm all of the following are true:

- [ ] Firebase project is live and Firestore is accessible
- [ ] A Scholar document exists in the `scholars` collection with:
  - `status`: `"Approved"`
  - `walletAddress`: a valid Preprod address (`addr_test1...`)
  - No `lastPaidTxHash` field (or it is `null` / absent)
- [ ] The Admin has a Cardano Preprod wallet (Eternl or Nami) connected in the browser with at least **10 tADA** balance
- [ ] The app is running locally (`npm run dev`) or deployed to the Preprod environment
- [ ] `preprod.cardanoscan.io` is open in a separate tab for on-chain verification
- [ ] Firebase Console → `scholars` collection is open in a separate tab for off-chain verification

---

## Test Steps

### Step 1 — Admin opens the dashboard

1. Navigate to `/admin`.
2. Connect the Preprod wallet when prompted.
3. Confirm the Scholar Table loads and shows the pre-seeded Approved scholar.
4. Verify the scholar's row shows a **"Send 5 tADA →"** button (not "Paid ✓").

### Step 2 — Admin initiates the transaction

1. Click **"Send 5 tADA →"** in the scholar's row.
2. The row's action cell switches to a spinner (`Sending...`). All other rows remain interactive.
3. The Eternl/Nami wallet popup appears. Review the recipient address and amount.
4. Click **Sign** in the wallet popup.

### Step 3 — Transaction confirmation

1. The wallet popup closes. The app submits the signed transaction to Cardano Preprod.
2. A `TxHash` string is returned from `sendADA()`.

### Step 4 — Off-chain record update

1. Immediately after the TxHash is returned, `markScholarAsPaid(scholarId, txHash)` writes to Firestore.
2. The Scholar Table refreshes (`refresh()` is called).
3. The scholar's Action cell now shows **"Paid ✓"** with a clickable TxHash link (no Send button).

---

## Expected Results

### A — On-chain (Cardanoscan)

- [ ] The TxHash is findable on `preprod.cardanoscan.io/transaction/<txHash>`
- [ ] The transaction recipient address matches `scholar.walletAddress` from Firestore **exactly**
- [ ] The transferred amount is **5 ADA** (5,000,000 Lovelace)

### B — Off-chain (Firestore)

- [ ] `scholars/<scholarId>.lastPaidTxHash` equals the TxHash shown on Cardanoscan
- [ ] `scholars/<scholarId>.paidAt` is a Firestore Timestamp within **30 seconds** of when Send was clicked
- [ ] `scholars/<scholarId>.updatedAt` is also updated

### C — UI state

- [ ] Scholar row Action cell shows **"Paid ✓"** link pointing to `preprod.cardanoscan.io/transaction/<txHash>`
- [ ] The **"Send 5 tADA →"** button is no longer visible for this scholar
- [ ] No second payment is possible (button is gone, not just disabled)
- [ ] Other scholar rows are unaffected

---

## Edge Case — DB Write Fails After Successful Transaction

If Firestore is temporarily unavailable after `sendADA()` succeeds:

1. The app shows a **yellow warning banner**: *"Payment sent on-chain but record update failed. Save this TxHash manually: `<TxHash>`"*
2. The TxHash link is clickable and points to Cardanoscan.
3. The scholar's row refreshes but still shows the **"Send 5 tADA →"** button (because Firestore was not updated).
4. **Resolution:** Admin manually sets `lastPaidTxHash` in Firebase Console to the displayed TxHash. On the next page refresh, the row shows "Paid ✓".

> The blockchain transaction cannot be reversed. The TxHash is the proof of payment — it must always be surfaced to the Admin even when the database is unavailable.

---

## Re-running the Test

To reset a scholar for re-testing:

1. Open Firebase Console → `scholars` collection → select the scholar document.
2. Delete the `lastPaidTxHash` and `paidAt` fields.
3. Reload the Admin Dashboard — the "Send 5 tADA →" button reappears.

> Note: Deleting these fields does not reverse the on-chain transaction. Use a fresh Preprod address for each full end-to-end re-test.

---

## Cross-Verification Checklist (for Jamiel — Task J2-03)

After running the happy-path test, confirm these values match across both systems:

| Field | Firestore value | Cardanoscan value |
|---|---|---|
| Wallet address | `scholars/<id>.walletAddress` | Recipient address in the transaction |
| TxHash | `scholars/<id>.lastPaidTxHash` | Transaction hash in the URL |
| Timestamp | `scholars/<id>.paidAt` | Block time (allow ±1 minute for block propagation) |

Attach screenshots of both the Firestore document and the Cardanoscan transaction page to `docs/increment-2-test-plan.md`.
