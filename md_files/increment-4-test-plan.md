# Increment 4 — Incentive Engine: Test Plan

## Roles & Wallets

| Role     | Wallet / Account                          | Notes                                      |
|----------|-------------------------------------------|--------------------------------------------|
| Admin    | Nami/Eternl connected to Preprod          | Must hold tADA + minted SCHOLAR tokens     |
| Scholar  | A second Preprod wallet address           | Must be an approved applicant in Firestore |
| Observer | Any browser (no wallet required)          | Reads Transparency Dashboard only         |

---

## Pre-Test Checklist

- [ ] Preprod faucet funded — Admin wallet holds at least 20 tADA
- [ ] Scholar record exists in Firestore with `status: "Approved"` and no `lastPaidTxHash`
- [ ] Scholar wallet address is stored in the Scholar record
- [ ] `tokenPolicyId` field in Firestore `config/scholarchain` is **empty** (start fresh)
- [ ] Dev server running: `npm run dev`
- [ ] Blockfrost Preprod API key set in `.env.local`

---

## Section 1 — Treasury: Token Minting

> Admin mints a supply of SCHOLAR fungible tokens and saves the policyId to Firestore.

### TKN-01 — Treasury tab is visible

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to `/admin` as Admin | Dashboard loads |
| 2 | Click **Treasury** tab | `TreasuryMintPanel` component renders |

### TKN-02 — Mint button disabled when supply is empty

| Step | Action | Expected |
|------|--------|----------|
| 1 | Leave supply input blank | Mint button is disabled |

### TKN-03 — Successful token mint

| Step | Action | Expected |
|------|--------|----------|
| 1 | Enter supply (e.g., `1000`) | Input accepts the value |
| 2 | Click **Mint SCHOLAR Tokens** | Wallet prompts for signature |
| 3 | Approve in wallet | Button shows spinner / "Minting…" |
| 4 | Transaction confirms | Success toast with txHash |
| 5 | Check Firestore `config/scholarchain` | `tokenPolicyId` field populated |
| 6 | Check Cardano Preprod explorer | TxHash shows `1000 SCHOLAR` minted |

### TKN-04 — policyId persists across page reloads

| Step | Action | Expected |
|------|--------|----------|
| 1 | Reload `/admin` page | Treasury tab still shows the saved policyId |

### TKN-05 — Re-mint adds to supply (same policyId)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Mint another `500` tokens | New tx mints 500 more |
| 2 | Check explorer | Same policyId, total supply increased |

### TKN-06 — Wallet rejection is handled gracefully

| Step | Action | Expected |
|------|--------|----------|
| 1 | Start minting; reject in wallet | Error toast shown; no Firestore write |
| 2 | Mint button re-enables | UI is not stuck |

---

## Section 2 — Scholar Portal: Achievement Submission

> Scholar submits an academic achievement for Admin review.

### ACH-01 — Portal loads for approved scholar

| Step | Action | Expected |
|------|--------|----------|
| 1 | Connect Scholar wallet at `/scholar-portal` | Portal loads; scholar name visible |
| 2 | No achievement yet | Achievement section shows submission form |

### ACH-02 — Validation prevents empty submission

| Step | Action | Expected |
|------|--------|----------|
| 1 | Leave all fields blank; click **Submit** | Validation errors shown; no Firestore write |

### ACH-03 — Successful achievement submission

| Step | Action | Expected |
|------|--------|----------|
| 1 | Fill Subject, Grade, Proof Link | All inputs accept values |
| 2 | Click **Submit Achievement** | Button shows spinner |
| 3 | Submission completes | Success message shown |
| 4 | Portal re-renders | Achievement card shows status **"Pending Review"** |
| 5 | Check Firestore scholar record | `achievement` sub-object written with `rewardStatus: "Pending Review"` |

### ACH-04 — Form hidden after submission

| Step | Action | Expected |
|------|--------|----------|
| 1 | Reload `/scholar-portal` | Submission form is gone; achievement card shown |

### ACH-05 — Non-approved wallets cannot access portal

| Step | Action | Expected |
|------|--------|----------|
| 1 | Connect a wallet with no scholar record | Portal shows "Access Denied" or wallet gate |

---

## Section 3 — Admin: Multi-Asset Reward Payout

> Admin reviews pending achievements and sends ADA + SCHOLAR tokens in a single transaction.

### MAR-01 — Pending Rewards tab shows submitted achievement

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to **Pending Rewards** tab | Scholar's row appears with achievement details |

### MAR-02 — Reward inputs validation

| Step | Action | Expected |
|------|--------|----------|
| 1 | Leave ADA amount at 0 | Send button is disabled |
| 2 | Leave token amount at 0 | Send button is still disabled |
| 3 | Set both > 0 | Send button enables |

### MAR-03 — Successful multi-asset reward

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set ADA = `5`, Tokens = `10` | Inputs accept values |
| 2 | Click **Send Reward** | Wallet prompts for signature |
| 3 | Approve in wallet | Button shows spinner / "Sending…" |
| 4 | Transaction confirms | Success toast with txHash |
| 5 | Scholar row disappears from Pending Rewards | Firestore `rewardStatus` → `"Paid"` |
| 6 | Check Preprod explorer with txHash | Single tx outputs 5 tADA + 10 SCHOLAR to scholar address |

### MAR-04 — Scholar receives assets

| Step | Action | Expected |
|------|--------|----------|
| 1 | Check Scholar wallet balance | +5 tADA (minus fees) + 10 SCHOLAR visible |

### MAR-05 — Scholar portal reflects paid status

| Step | Action | Expected |
|------|--------|----------|
| 1 | Scholar reloads `/scholar-portal` | Achievement card shows status **"Paid"** |
| 2 | Card shows txHash link | Clicking opens Preprod explorer |

### MAR-06 — Paid scholars hidden from Pending Rewards

| Step | Action | Expected |
|------|--------|----------|
| 1 | Reload Admin **Pending Rewards** tab | Paid scholar row is gone |

### MAR-07 — Wallet rejection during reward

| Step | Action | Expected |
|------|--------|----------|
| 1 | Start reward send; reject in wallet | Error toast shown; Firestore not updated |
| 2 | Scholar still appears in Pending Rewards | Row visible; status still "Pending Review" |

### MAR-08 — Sending with no tokenPolicyId set

| Step | Action | Expected |
|------|--------|----------|
| 1 | Clear `tokenPolicyId` from Firestore `config/scholarchain` | — |
| 2 | Attempt to send reward | Error shown: "Token policy not configured" or similar |
| 3 | UI does not crash | Admin stays on the page |

### MAR-09 — SCHOLAR token unit in transaction (correctness check)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Complete a successful reward (MAR-03) | — |
| 2 | Open txHash in explorer | Asset name shown as `SCHOLAR` (not hex garbage) |
| 3 | Confirm policyId in explorer matches Firestore | They are identical |

### MAR-10 — Large token amount

| Step | Action | Expected |
|------|--------|----------|
| 1 | Set Tokens = `500` | Tx builds; wallet prompts |
| 2 | Approve | Tx succeeds; scholar receives 500 SCHOLAR |

---

## Section 4 — Regression

> Confirm Increment 1–3 features still work after Increment 4 changes.

### REG-01 — Scholarship application still works

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to `/apply` | Page loads without SSR error |
| 2 | Connect wallet; fill form | Submission works; Firestore record created |

### REG-02 — NFT minting (Scholar ID) still works

| Step | Action | Expected |
|------|--------|----------|
| 1 | Admin goes to Scholar table | Pending scholar shows **Mint Scholar ID** button |
| 2 | Click; approve wallet | NFT minted; `policyId` saved to Firestore |

### REG-03 — ADA send still works

| Step | Action | Expected |
|------|--------|----------|
| 1 | Approved scholar with no payment | **Send 5 tADA** button visible |
| 2 | Click; approve wallet | 5 tADA sent; `lastPaidTxHash` saved |

### REG-04 — Scholar portal NFT gate still works

| Step | Action | Expected |
|------|--------|----------|
| 1 | Connect wallet that holds the Scholar ID NFT | Portal loads successfully |
| 2 | Connect a wallet without the NFT | Access denied |

### REG-05 — Transparency Dashboard still accurate

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to `/transparency` (no wallet needed) | Dashboard loads |
| 2 | Check pledge vs. balance chart | Numbers reflect current Preprod wallet state |
| 3 | Check ledger table | Recent txHashes are listed with correct amounts |

### REG-06 — `/apply` page loads without libsodium error

| Step | Action | Expected |
|------|--------|----------|
| 1 | Run `npx next build --webpack` | Build completes with 0 errors |
| 2 | Start prod server (`npx next start`) | `/apply` loads; no console errors |

### REG-07 — No double-spend on rapid submits

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click **Send Reward** twice quickly | Second click is disabled while first is processing |
| 2 | Only one transaction submitted | One txHash; no "All inputs are spent" error |

---

## Quick 5-Minute Smoke Test

Run this abbreviated sequence to validate the full flow end-to-end.

```
1. [Admin]   Open /admin → Treasury tab → Mint 100 SCHOLAR tokens
             ✓ Confirm: txHash in toast + tokenPolicyId in Firestore

2. [Scholar] Open /scholar-portal → Submit achievement
             (Subject: "Math 101", Grade: "A", Proof: any URL)
             ✓ Confirm: card shows "Pending Review"

3. [Admin]   Open /admin → Pending Rewards tab → Set ADA=5, Tokens=10
             Click Send Reward → Approve wallet
             ✓ Confirm: success toast + row disappears

4. [Scholar] Reload /scholar-portal
             ✓ Confirm: achievement card shows "Paid" + txHash link

5. [Observer] Open txHash in https://preprod.cardanoscan.io
             ✓ Confirm: 5 ADA + 10 SCHOLAR sent in single transaction
```

---

## Known Limitations / Out of Scope

- Multiple achievements per scholar are not supported (one active achievement at a time)
- Token minting policy is tied to the Admin's change address; switching wallets creates a new policyId
- ADA minimum UTxO rule (~1.5 tADA) applies; sending less than 2 tADA may fail
- All tests target **Cardano Preprod**; Mainnet is not in scope for this increment
