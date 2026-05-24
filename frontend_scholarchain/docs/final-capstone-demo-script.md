# ScholarChain — Final Capstone Demo Script

**Target Duration:** 10–12 minutes  
**Story Arc:** *"From a student's application to a public-auditable, blockchain-verified scholarship payment — with nothing to hide and everything to prove."*  
**Demo Lead:** Jamiel

---

## Pre-Demo Setup (10 minutes before presenting)

- [ ] Chrome open with 4 tabs:
  1. `localhost:3000` — Landing page
  2. `localhost:3000/admin` — Admin Dashboard
  3. `localhost:3000/scholar-portal` — Scholar Portal
  4. `localhost:3000/transparency` — Transparency Dashboard
- [ ] Eternl open with **Admin Wallet** (connected, Preprod network, 20+ tADA)
- [ ] Second Eternl profile: **Scholar Wallet A** (holds Scholar Badge NFT + 2+ tADA)
- [ ] Firebase Console open in a 5th tab (to show live Firestore updates)
- [ ] Dev server running: `npm run dev` — zero console errors
- [ ] At least one Scholar in Firestore with `status: "Approved"` and `achievement.rewardStatus: "Pending Review"`
- [ ] At least one Scholar in Firestore with `status: "Pending"` (for Mint Scholar ID demo)
- [ ] Test Cardanoscan tab pre-opened with a known TxHash (fallback)
- [ ] `SCHOLAR` token supply minted and `tokenPolicyId` saved to Firestore

---

## SCENE 1 — The Problem (0:00 – 0:45)

**Narration:**
> *"Every year, scholarship funds go missing. Administrators claim they've dispersed money that never reaches students. There's no receipt, no audit trail, no accountability. ScholarChain solves this with three words: the blockchain never lies."*

**Action:** Open Tab 1 (`localhost:3000`). Show the landing page briefly. Point out the navigation: Admin Portal, Scholar Portal, Transparency Dashboard.

---

## SCENE 2 — Increment 1: The Plumbing (0:45 – 2:00)

**Narration:**
> *"We start with the most fundamental proof: can a browser talk to a blockchain?"*

**Actions:**
1. Click **Admin Portal** → Tab 2. Click **Connect Wallet** → Approve in Eternl.
2. Show wallet address and balance displayed. *"The Admin is authenticated — not by a username and password, but by cryptographic ownership of this wallet."*
3. (Optional) Show the manual Send panel. *"Increment 1 established the on-chain data pipeline — wallet connection, transaction signing, and Blockfrost submission."*

---

## SCENE 3 — Increment 2: The Dual Registry (2:00 – 4:00)

**Narration:**
> *"In a real system, the Admin shouldn't be typing addresses manually. Students apply, their data goes into a database, and the dashboard pulls it in automatically. Two sources of truth — Firebase and the blockchain — linked by the wallet address."*

**Actions:**
1. Open a new tab → `/apply`. Fill out as **"Maria Santos, BS Information Technology"**. Submit.
2. Switch to Firebase Console tab → Firestore → `scholars`. Show new document: `status: "Pending"`. *"Live. Instant. No backend server — Firebase, direct from the browser."*
3. Switch to Admin Dashboard → Scholar Table. Change Maria's status to "Approved" in Firestore. Refresh. *"Maria's row appears. The dashboard and the database are in sync."*
4. Click **Send 5 tADA** on Maria's row. Approve in Eternl. Show TxHash. *"No address typed. It came from Firebase. The blockchain transaction is proof of disbursement."*
5. Show `lastPaidTxHash` now set in Firebase Console.

---

## SCENE 4 — Increment 3: The Digital Badge (4:00 – 6:30)

**Narration:**
> *"ADA payments prove money moved. But how does a student prove they are a legitimate Scholar — not just someone who found the portal URL? With an NFT credential that can't be faked, duplicated, or transferred without the owner's private key."*

**Actions:**
1. Back to Admin Dashboard → Scholar Table. Find a Pending scholar. Click **Mint Scholar ID**. Sign in Eternl.
2. TxHash returned → click it. Cardanoscan opens. Show NFT metadata: name, course, Scholar badge image from IPFS. *"This badge is permanently on the Cardano blockchain. It is the student's digital diploma — immutable and globally verifiable."*
3. Switch to Scholar Portal tab. Connect a **non-scholar wallet** → Access Denied. *"Wrong wallet."*
4. Switch Eternl to Scholar Wallet A (has the badge). Connect. Show scanning animation. Scholar Dashboard appears.
5. *"The NFT IS the password. No username, no admin approval — the student either holds the NFT or they don't."*

---

## SCENE 5 — Increment 4: The Incentive Engine (6:30 – 9:00)

**Narration:**
> *"Scholarships cover living costs. But exceptional academic performance deserves recognition — and that recognition can be tokenized on the blockchain."*

**Actions:**
1. Admin Dashboard → **Treasury** tab. *"The institution has already minted a supply of SCHOLAR reward tokens — Cardano native tokens, same layer as ADA."* Show `tokenPolicyId` already saved.
2. Switch to Scholar Portal (Scholar Wallet A connected). In the Achievement section, show an existing submitted achievement with status **"Pending Review"**.
3. Admin Dashboard → **Pending Rewards** tab. Scholar's row appears with grade and proof link. Enter `50` ADA and `200` SCHOLAR tokens. Click **Send Reward**. Sign.
4. *"One transaction. Two assets. No smart contract needed — Cardano's native token standard handles this natively."*
5. Click TxHash → Cardanoscan. Show **both** ADA and SCHOLAR tokens in the single transaction output.
6. Switch to Scholar Portal → Achievement card now shows **"Paid"** with TxHash link. *"The student sees confirmation instantly."*

---

## SCENE 6 — Increment 5: The Glass House (9:00 – 11:30)

**Narration:**
> *"Everything we've built so far is powerful — but how does a donor, a parent, or a government auditor know the Admin isn't pocketing money? They can't audit the Admin's wallet themselves. Or can they? Welcome to the Glass House."*

**Actions:**
1. Open Transparency Dashboard tab. *"No wallet. No login. Public. Anyone — a donor, a student, a regulator — can see this."*
2. Point to the two stat cards loading. *"Left: total pledged by sponsors. Source: Firebase, our database. Right: live treasury balance. Source: the Cardano blockchain via Blockfrost. Two separate, independent sources that cannot be manipulated together."*
3. Show **"✅ Fully Accountable"** green card. *"The numbers add up. The Admin has not misappropriated funds."*
4. Scroll to the ledger table. *"Every single payment ever made — in order — with the recipient name cross-referenced from our database, and a clickable receipt on the global blockchain."*
5. Click a TxHash. Cardanoscan opens. *"This is not our website. This is the Cardano blockchain — a public ledger maintained by thousands of nodes worldwide. The transaction is there, immutable, exactly as we said."*
6. Switch to Firebase Console. **Add a test sponsor record** with `pledgedAmount: 999999`. Switch back to `/transparency` — reload.
7. The **red Discrepancy banner** appears. *"If anyone pledges funds that don't show up in the treasury, this alert fires automatically. The Admin is mathematically trapped. Accountability is not a policy — it is a mathematical guarantee enforced by the blockchain."*
8. Delete the test record. Reload. Green card returns. *"The system self-corrects the moment the discrepancy is resolved."*

---

## Closing (11:30 – 12:00)

**Narration:**
> *"Five increments. One unified system. Scholarship applications, NFT identity credentials, blockchain payments, fungible token rewards, and public real-time accountability — all built on the Cardano blockchain. ScholarChain: where scholarship funds have nowhere to hide."*

**Action:** Show the landing page one final time, pointing to all five features.

---

## Fallback Plans

| Problem | Recovery |
|---------|----------|
| Blockfrost returns 429 rate limit | Show pre-cached screenshot of the transparency dashboard with the explanation: "Preprod free tier — 50K req/day, this is normal under heavy demo load." |
| Cardanoscan loads slowly | Pre-open a Cardanoscan tab with a known TxHash before presenting |
| SCHOLAR token unit format error in multi-asset tx | Show a pre-recorded screen capture of a successful multi-asset tx |
| Eternl popup doesn't appear | Refresh page, disconnect wallet, reconnect; have all wallet interactions pre-approved |
| Transparency balance appears stale | Explain: "Preprod indexer can lag 30–60 seconds — this is expected behavior on the test network" |
| Demo runs over 12 minutes | Cut Scene 2 manual form walkthrough; jump directly to showing the Admin table with Maria already approved |

---

## Demo Dry-Run Checklist

Run through the full script at least twice before the actual presentation:

- [ ] Dry-run 1 — full run with timer (target: under 12 min)
- [ ] Dry-run 2 — full run with all team members watching
- [ ] All wallet approvals pre-practiced
- [ ] Fallback screenshots saved to desktop
- [ ] Firebase test sponsor record created and deleted successfully in practice
- [ ] Cardanoscan TxHash tab pre-opened and verified

---

*ScholarChain Team — Final Capstone Demo · Increment 5*
