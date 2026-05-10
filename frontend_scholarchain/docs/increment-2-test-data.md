# Increment 2 — Test Data Reference

> Task J2-01 (Jamiel). Run `scripts/seed-firestore.ts` to populate Firestore, then fill in the generated IDs below.

---

## How to Seed

```bash
# Node 20+:
node --env-file=.env.local --import tsx/esm scripts/seed-firestore.ts

# Alternatively:
export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/seed-firestore.ts
```

After seeding, paste the printed Firestore document IDs into the tables below.

---

## Scholar Test Records

| # | Name | Course | Status | Wallet Address | Firestore ID |
|---|---|---|---|---|---|
| 1 | Maria Santos | BS Computer Science | `Approved` | *(replace with real Preprod addr)* | *(paste ID here)* |
| 2 | Juan dela Cruz | BS Information Technology | `Approved` | *(replace with real Preprod addr)* | *(paste ID here)* |
| 3 | Ana Reyes | BS Education | `Pending` | *(replace with real Preprod addr)* | *(paste ID here)* |
| 4 | Carlos Mendoza | BS Nursing | `Rejected` | *(replace with real Preprod addr)* | *(paste ID here)* |

**Usage in tests:**
- Scholars 1 & 2 (`Approved`) → should appear in Admin Dashboard table
- Scholar 3 (`Pending`) → must **not** appear in Admin Dashboard (DASH-02)
- Scholar 4 (`Rejected`) → must **not** appear in Admin Dashboard (filter verification)
- Scholar 1 or 2 → use for TXF-01 end-to-end transaction test

---

## Sponsor Test Records

| # | Sponsor Name | Pledged Amount | Amount Type | Firestore ID |
|---|---|---|---|---|
| 1 | Cebu Pacific Foundation | 5000 | `number` | *(paste ID here)* |
| 2 | SM Foundation | 3000 | `number` | *(paste ID here)* |

**Usage in tests:**
- SPO-04 → open these docs in Firebase Console and confirm `pledgedAmount` type is `number`, not `string`
- Total pledged: ₳8,000 (used in Increment 5 transparency dashboard verification)

---

## Resetting Test Data

To re-run TXF tests on an already-paid scholar:

1. Open Firebase Console → `scholars` collection → select the paid scholar document.
2. Delete the `lastPaidTxHash` and `paidAt` fields.
3. Reload the Admin Dashboard — the "Send tADA" button reappears.

> The on-chain transaction is not reversed. Use a fresh Preprod address for a full clean re-run.

To wipe all seed data and re-seed from scratch:
1. Delete all documents from both collections in Firebase Console.
2. Re-run the seed script to generate fresh IDs.
3. Update the ID columns in this file.

---

## Important Notes

- **Wallet addresses** in the seed script are PLACEHOLDERS. Replace them with real Preprod addresses (`addr_test1...`) from your team's Eternl/Nami wallets before running TXF-01 through TXF-07.
- Never commit real wallet private keys or `.env.local` to Git.
- All `createdAt` / `updatedAt` fields use Firestore `serverTimestamp()` — they are set at write time.
