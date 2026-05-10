# Increment 2 — Demo Script

> Task J2-04 (Jamiel). Target runtime: **under 7 minutes**.
> Practice this script at least twice before the live demo.

---

## Pre-Demo Setup Checklist

Complete these **before** the audience arrives:

**Browser setup:**
- [ ] Browser Window 1: App running at `http://localhost:3000` (or deployed URL)
- [ ] Browser Window 2: `/apply` route open (student simulation)
- [ ] Browser Tab 3: Firebase Console → Firestore → `scholars` collection visible
- [ ] Browser Tab 4: `preprod.cardanoscan.io` open (for on-chain verification)

**Firestore state:**
- [ ] 2 scholars with `status: "Approved"` visible in Firebase Console
- [ ] 1 scholar with `status: "Pending"` also visible (to demo the approval flow)
- [ ] Neither Approved scholar has a `lastPaidTxHash` (clean state)

**Wallet:**
- [ ] Admin Eternl wallet connected in Window 1 with ≥ 10 tADA balance
- [ ] Wallet is set to **Preprod Testnet** (not Mainnet)

**Test:**
- [ ] Run through the full script once as a dry run and time it

---

## Scene 0 — Opening (30 seconds)

> *"ScholarChain makes scholarship management transparent and verifiable. In Increment 1, we proved that ADA can be sent on-chain with a wallet signature. Today we show the full system: a student applies, an admin approves, and payment flows automatically — all linked to a real database and the Cardano blockchain."*

Show Window 1 landing page (`/`). Point out the three entry points: Admin Portal, Apply for Scholarship, Sponsor Registration.

---

## Scene 1 — Student Journey: Apply for Scholarship (~90 seconds)

**Switch to Window 2 (`/apply`).**

> *"A student visits the public application form — no wallet connection needed."*

1. Fill in the form live:
   - Full Name: `"Maria Santos"`
   - Course: `"BS Computer Science"`
   - Wallet Address: paste a real `addr_test1...` Preprod address
2. Click **Apply Now**.
3. Show the green success card: *"Application Submitted! Status: Pending"*.

**Switch to Firebase Console Tab (Tab 3).**

> *"The data landed in Firestore in real-time. Notice the status is Pending — the student is in the queue, not yet approved."*

4. Refresh the `scholars` collection. Show the new document with `status: "Pending"`.

---

## Scene 2 — Admin Approval (~30 seconds)

**Stay in Firebase Console (Tab 3).**

> *"For Increment 2, the admin manually sets status to Approved directly in the database. In a future increment, this will be an in-app workflow."*

1. Click into the new Maria Santos document.
2. Edit the `status` field: change `"Pending"` → `"Approved"`. Save.

**Switch to Window 1 (`/admin` → Scholar Table tab).**

3. Click browser refresh (or use the table's natural polling).

> *"Maria Santos now appears in the Admin Dashboard — pulled live from Firestore."*

4. Show her row in the table: Name, Course, truncated wallet address, Approved status badge.

---

## Scene 3 — Dynamic Scholarship Payment (~2 minutes)

**Stay in Window 1 (Admin Dashboard, Scholar Table tab).**

> *"The Admin sees a live table of Approved scholars. Each row has its own Send button. The wallet address comes directly from the database — no copy-pasting, no transcription errors."*

1. Point to Maria Santos's row. Show the **"Send 5 tADA →"** button.
2. Click it.
3. Eternl wallet popup appears. Show the recipient address matches Firestore.

> *"Cardano requires the Admin to sign every transaction. This is the blockchain guarantee — no payment happens without a cryptographic signature."*

4. Click **Sign** in Eternl.
5. Wait for confirmation (usually 5–15 seconds).
6. The row updates to **"Paid ✓"** with a clickable TxHash link.

**Switch to Firebase Console (Tab 3).**

7. Show the scholar document now has `lastPaidTxHash` and `paidAt` populated.

> *"The payment receipt is now stored both on the Cardano blockchain and in our database — permanently linked."*

**Switch to Cardanoscan (Tab 4).**

8. Click the TxHash link in the dashboard (or paste it). Show the transaction.

> *"Anyone can verify this payment. The recipient address, the amount, the timestamp — all public and immutable on Cardano Preprod."*

---

## Scene 4 — Sponsor Registration (~60 seconds)

**Switch to Window 1. Navigate to `/sponsor-entry`.**

> *"Sponsors can register their pledges through a dedicated form — also public, no wallet required."*

1. Fill in:
   - Sponsor Name: `"Cebu Pacific Foundation"`
   - Pledge Amount: `5000`
2. Submit. Show the success card with the pledge amount.

**Switch to Firebase Console (Tab 3). Navigate to `sponsors` collection.**

3. Show the new sponsor document with `pledgedAmount: 5000` (as a number, not a string).

> *"Sponsor pledges are stored as numbers — ready for the Public Transparency Dashboard we're building in Increment 3, where donors and the public can see the total funds committed versus disbursed."*

---

## Closing (~30 seconds)

> *"To summarize what Increment 2 delivers:*
> - *A student submits an application → it lands in Firestore.*
> - *An admin approves it → it appears in the dashboard automatically.*
> - *The admin sends ADA with one click → the scholar's wallet address is pulled from the database, the transaction is signed on-chain, and the TxHash is written back as proof of payment.*
> - *All of this is transparent and verifiable by anyone with the TxHash.*
>
> *In Increment 3, we mint an NFT as a tamper-proof scholarship credential. Thank you."*

---

## Timing Guide

| Scene | Target | Max |
|---|---|---|
| Setup + Opening | 0:30 | 0:45 |
| Scene 1 — Apply | 1:30 | 2:00 |
| Scene 2 — Approve | 0:30 | 0:45 |
| Scene 3 — Payment | 2:00 | 2:30 |
| Scene 4 — Sponsor | 1:00 | 1:15 |
| Closing | 0:30 | 0:45 |
| **Total** | **6:00** | **7:00** |

---

## Contingency Notes

| Issue | Recovery |
|---|---|
| Eternl popup doesn't appear | Check browser popup blocker. Reload and try again. |
| Firestore doesn't update in real-time | Manually refresh the Firebase Console tab (F5). |
| Scholar not appearing after approval | Refresh the Admin Dashboard page. Firestore polling takes up to 2s. |
| Wallet balance too low | Switch to the backup wallet (pre-funded with 20 tADA). |
| App is down | Switch to the recorded screen capture as fallback. |
| TXF-01 tx takes > 30s to confirm | Note that Preprod block time is ~20s — wait and narrate while it confirms. |
