# Increment 2 — Test Plan

> Task J2-02 + J2-03 (Jamiel). Execute all cases before demo sign-off.
> Reference test data: `docs/increment-2-test-data.md`
> Integration test steps: `docs/increment-2-integration-test.md`

**Status legend:** ⬜ Not run · ✅ Pass · ❌ Fail · ⚠️ Partial

---

## Section 1 — Scholar Application Form (`/apply`)

Pre-condition: Navigate to `/apply` without a wallet connected.

| ID | Test Case | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| APP-01 | Submit valid form data | Fill all fields with valid data (name ≥ 3 chars, valid `addr_test1...` address). Click Apply Now. | Scholar document appears in Firestore `scholars` collection with `status: "Pending"`, `createdAt` set, `walletAddress` trimmed. | ⬜ | |
| APP-02 | Submit with invalid wallet address | Enter name, course, and an address that does **not** start with `addr_test1`. Submit. | Validation error shown inline. No Firestore write occurs. | ⬜ | Expected message: "Please enter a valid Cardano Preprod wallet address." |
| APP-03 | Submit with empty name field | Leave name blank, fill other fields. Submit. | Browser or form validation prevents submit. No Firestore write. | ⬜ | HTML `required` + `minLength={3}` should block submission |
| APP-04 | Submit form twice | Complete and submit the form. Click "Submit Another Application". Submit again with different data. | Two separate Firestore documents are created — each with a unique auto-generated ID. | ⬜ | |
| APP-05 | Success state after submission | Submit a valid form. | Green confirmation card displays: "Application Submitted! 🎉", "Status: **Pending**", truncated wallet address, and "Submit Another Application" button. | ⬜ | |

---

## Section 2 — Sponsor Entry Form (`/sponsor-entry`)

Pre-condition: Navigate to `/sponsor-entry` without a wallet connected.

| ID | Test Case | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| SPO-01 | Submit valid sponsor pledge | Enter a valid sponsor name and a positive integer amount (e.g., 1000). Submit. | Document in Firestore `sponsors` collection with `pledgedAmount` as a number, `createdAt` set. | ⬜ | |
| SPO-02 | Submit pledge of 0 | Enter sponsor name. Enter `0` in the amount field. Submit. | Validation error: "Pledge amount must be a positive number greater than 0." No Firestore write. | ⬜ | |
| SPO-03 | Submit a decimal pledge amount | Enter a decimal value (e.g., `100.5`). Submit. | Validation error: "Pledge amount must be a whole number (integer)." No Firestore write. | ⬜ | The form enforces integer-only amounts per spec |
| SPO-04 | `pledgedAmount` stored as Number type | After SPO-01, open Firebase Console → `sponsors` collection → document. | The `pledgedAmount` field type is `number`, not `string`. Constraint C-07 satisfied. | ⬜ | Verify visually in Firebase Console — string values appear without quotes in the type column |

---

## Section 3 — Admin Dashboard Scholar Table

Pre-condition: Firestore seeded per `docs/increment-2-test-data.md` (2 Approved, 1 Pending, 1 Rejected scholars).

| ID | Test Case | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| DASH-01 | Dashboard loads only Approved scholars | Connect wallet. Navigate to `/admin`. Switch to Scholar Table tab. | Table shows exactly 2 rows (Maria Santos, Juan dela Cruz). Ana Reyes (Pending) and Carlos Mendoza (Rejected) are absent. | ⬜ | |
| DASH-02 | Pending scholar is not shown | Inspect the table while Ana Reyes has `status: "Pending"` in Firestore. | Ana Reyes does not appear in any row. Filter is working. | ⬜ | |
| DASH-03 | Loading skeleton is visible then replaced | Throttle network to Slow 3G in DevTools. Navigate to `/admin`. | Pulsing skeleton rows visible during fetch, then replaced with real data within 3 seconds (on normal connection). | ⬜ | |
| DASH-04 | Empty state message when no Approved scholars | Temporarily change both Approved scholars to `status: "Pending"` in Firebase Console. Reload dashboard. | "No approved scholars found. Approve a scholar in Firebase Console to populate this table." message is shown. | ⬜ | Reset statuses to Approved after this test |

---

## Section 4 — DB-to-Chain Transaction Flow

Pre-condition: Scholar 1 or 2 from test data is Approved with no `lastPaidTxHash`. Admin wallet connected with ≥ 10 tADA.

| ID | Test Case | Steps | Expected Result | Status | Notes |
|---|---|---|---|---|---|
| TXF-01 | Full happy path: DB → Chain → DB update | Click "Send 5 tADA →" for an Approved scholar. Sign in Eternl. | TxHash appears on `preprod.cardanoscan.io`. Scholar's Firestore doc now has `lastPaidTxHash` set. UI shows "Paid ✓" link. | ⬜ | See `docs/increment-2-integration-test.md` for full steps |
| TXF-02 | Scholar wallet address matches Cardanoscan | After TXF-01, compare Firestore `walletAddress` with Cardanoscan recipient. | Values match exactly (character-for-character). Confirms Firestore address is used directly — not a typed value. | ⬜ | |
| TXF-03 | Paid scholar shows "Paid ✓" link | After TXF-01 completes. | The scholar's Action cell shows "Paid ✓" (a clickable link). The "Send 5 tADA →" button is gone. | ⬜ | |
| TXF-04 | `lastPaidTxHash` in Firestore matches explorer | Open Firebase Console → scholar doc. Copy `lastPaidTxHash`. Search on Cardanoscan. | Same transaction is found. Values are identical. | ⬜ | |
| TXF-05 | `paidAt` timestamp is accurate | After TXF-01, check `paidAt` in Firebase Console. | Timestamp is within 30 seconds of when the Send button was clicked. | ⬜ | |
| TXF-06 | Processing row shows spinner; others stay interactive | Click "Send 5 tADA →" on Scholar 1. While the wallet popup is open. | Scholar 1's Action cell shows a blue spinner ("Sending..."). Scholar 2's "Send 5 tADA →" button is disabled. After signing, buttons return to normal. | ⬜ | |
| TXF-07 | Cannot double-pay a scholar | After TXF-01, attempt to click the Send button for the paid scholar again. | The "Send 5 tADA →" button is completely replaced by "Paid ✓" — no second click is possible. | ⬜ | |

---

## Section 5 — Data Integrity Cross-Verification (J2-03)

After running TXF-01, verify these values match across Firestore and Cardanoscan.

| Field | Firestore Location | Cardanoscan Location | Match? |
|---|---|---|---|
| Wallet address | `scholars/<id>.walletAddress` | Transaction → Recipient address | ⬜ |
| TxHash | `scholars/<id>.lastPaidTxHash` | Transaction hash in URL / header | ⬜ |
| Timestamp | `scholars/<id>.paidAt` | Block time (allow ±1 min for propagation) | ⬜ |
| Amount | 5 ADA (5,000,000 Lovelace) | Transaction output amount | ⬜ |

**Screenshot checklist** (attach to this document or a shared folder):
- [ ] Firebase Console showing `lastPaidTxHash` and `paidAt` fields populated
- [ ] Cardanoscan transaction page showing recipient address and amount

---

## Section 6 — Integration Checklist Verification

Run each item after Sections 1–4 are complete.

| # | Checklist Item | Verified? |
|---|---|---|
| IC-01 | Firebase SDK initialized with `getApps()` guard — no hot-reload errors in dev console | ⬜ |
| IC-02 | All Firestore writes use `serverTimestamp()` — confirmed in Firebase Console field type | ⬜ |
| IC-03 | `addScholar()` always sets `status: "Pending"` — no form can submit with Approved status | ⬜ |
| IC-04 | `getScholarsByStatus("Approved")` filter works — Pending/Rejected scholars invisible on dashboard | ⬜ |
| IC-05 | `walletAddress` is trimmed before Firestore write — paste an address with leading/trailing spaces and confirm it's stored clean | ⬜ |
| IC-06 | `markScholarAsPaid()` is called **after** `sendADA()` — verified by code review of `AdminDashboard.tsx` | ⬜ |
| IC-07 | `pledgedAmount` stored as Number type — confirmed via SPO-04 | ⬜ |
| IC-08 | Scholar Table shows "Paid ✓" with TxHashLink after payment — no Send button visible | ⬜ |
| IC-09 | `/apply` accessible without wallet connection — verified by opening in a fresh incognito window | ⬜ |
| IC-10 | `/sponsor-entry` accessible without wallet connection — same as IC-09 | ⬜ |
| IC-11 | No hardcoded wallet addresses in component files — only `SCHOLARSHIP_AMOUNT_ADA` constant in `AdminDashboard.tsx` | ⬜ |
| IC-12 | All Increment 1 functionality still works — Manual Send tab sends ADA without Firestore errors | ⬜ |

---

## Sign-off

All cases in Sections 1–6 must be ✅ before demo sign-off.

| Section | Cases | Pass | Fail |
|---|---|---|---|
| Scholar Application Form | 5 | | |
| Sponsor Entry Form | 4 | | |
| Admin Dashboard Table | 4 | | |
| DB-to-Chain Flow | 7 | | |
| Data Integrity | 4 | | |
| Integration Checklist | 12 | | |
| **Total** | **36** | | |

**QA Sign-off (Jamiel):** _________________ · Date: _________

**Demo approved by:** _________________ · Date: _________
