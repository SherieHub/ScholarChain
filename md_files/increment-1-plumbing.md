# ScholarChain — Increment 1: The Plumbing

> **Central Execution Contract · Team of 5 · Parallel Development Strategy**
> Last Updated: May 2026 · Status: 🟡 In Progress

---

## 📋 Table of Contents

1. [Increment Objective & Scope](#objective)
2. [Definition of Done](#done)
3. [Technical Constraints](#constraints)
4. [Phase Execution Plan](#phases)
5. [Team Task Distribution](#tasks)
   - [Shervin — DevOps & Environment Lead](#shervin)
   - [Austine — Web3 Authentication](#austine)
   - [Sherielyn — UI/UX & React State](#sherielyn)
   - [Christian — Blockchain Transaction Engineering](#christian)
   - [Jamiel — QA, Network & Demo Lead](#jamiel)
6. [Parallel Development Strategy & Dependency Map](#parallel)
7. [Integration Checklist](#integration)
8. [Branch & Git Strategy](#git)
9. [Daily Standup Template](#standup)
10. [Risk Register](#risks)

---

## 1. Increment Objective & Scope {#objective}

### Goal
Prove the absolute basics of a blockchain-connected web application work end-to-end. A browser-based UI must be able to connect to a Cardano wallet, accept dynamic inputs from an Admin, and successfully submit a real ADA transaction to the **Cardano Preprod Testnet** — returning a verifiable, clickable Transaction Hash (TxHash).

### Elevator Pitch
> *"By the end of this increment, an Admin can open a browser, click Connect Wallet, type a recipient address and an ADA amount, click Send, sign the transaction in their wallet extension, and see a live, third-party-verifiable TxHash on the screen."*

### Strict Scope Boundaries

| ✅ IN SCOPE | ❌ OUT OF SCOPE |
|---|---|
| Next.js / React.js application bootstrap | Firebase / any database |
| MeshJS wallet connection (`MeshProvider`, `<CardanoWallet />`) | NFT minting |
| Dynamic form: recipient address + ADA amount inputs | Scholar application forms |
| ADA → Lovelace conversion | Token minting |
| MeshJS `Transaction` builder + wallet signing | Admin authentication (email/password) |
| Transaction submission to Cardano Preprod | Mainnet deployment |
| TxHash display as clickable Cardanoscan link | Sponsor portal |
| Loading/processing/error UI states | Any backend API routes |
| Basic responsive layout with TailwindCSS | Complex UI animations |

---

## 2. Definition of Done {#done}

Increment 1 is considered **complete and demonstrable** when ALL of the following are true:

- [ ] The Next.js application runs locally with `npm run dev` without errors
- [ ] The `<CardanoWallet />` button renders in the header
- [ ] Clicking Connect Wallet opens the Eternl/Nami browser extension popup
- [ ] After approval, the Admin's wallet address and ADA balance are displayed
- [ ] The Send Scholarship form renders with two inputs: Recipient Address and ADA Amount
- [ ] Submitting the form with valid inputs triggers the Admin's wallet signing popup
- [ ] Cancelling the wallet popup displays a friendly error message (no app crash)
- [ ] A spinner/loading state is visible during the ~20-second Preprod block time
- [ ] On success, a TxHash is displayed as a clickable hyperlink
- [ ] Clicking the TxHash link opens `preprod.cardanoscan.io` and shows the confirmed transaction
- [ ] The transaction history on Cardanoscan correctly shows the transferred ADA amount
- [ ] All code is merged to `main` via reviewed Pull Requests
- [ ] A live demo can be performed in under 5 minutes

---

## 3. Technical Constraints {#constraints}

These are non-negotiable technical rules the entire team must respect during Increment 1:

| # | Constraint | Reason |
|---|---|---|
| C-01 | All amounts passed to MeshJS must be in **Lovelaces** (Integer) | Cardano protocol has no decimal support |
| C-02 | React form input values must be parsed with `Number()` before multiplication | Prevents JavaScript string concatenation bugs |
| C-03 | The browser wallet must be set to **Preprod Testnet** (Network ID: 0) | Mainnet transactions use real ADA |
| C-04 | All MeshJS transaction calls must be inside a `try/catch` block | Prevents app crashes on wallet rejection |
| C-05 | The Send button must be **disabled** during the PROCESSING state | Prevents accidental double-spend |
| C-06 | No hardcoded wallet addresses anywhere in the codebase | System must be fully dynamic |
| C-07 | TxHash links must point to `preprod.cardanoscan.io`, not the app itself | Third-party verifiability is required |
| C-08 | TypeScript strict mode must be enabled | Code quality baseline |

---

## 4. Phase Execution Plan {#phases}

The increment is structured into five sequential phases. Note that **Phases 1–3 run in parallel** across team members; Phases 4 and 5 depend on the outputs of earlier phases.

```
Phase 1: Environment & Tool Setup          [Day 1]       → Shervin leads
Phase 2: Wallet Authentication             [Day 1-2]     → Austine leads
Phase 3: Dynamic UI & React State          [Day 1-2]     → Sherielyn leads
Phase 4: Transaction Logic                 [Day 2-3]     → Christian leads
Phase 5: QA, Integration & Verification   [Day 3-4]     → Jamiel leads
```

### Phase 1 — Environment & Tool Setup
Initialize the shared development foundation. This phase must be completed first so the entire team can clone and run the project.

- Initialize a Next.js 14 project with TypeScript, TailwindCSS, and ESLint
- Install `@meshsdk/core` and `@meshsdk/react`
- Configure Git repository with branch protection on `main`
- Create the `.env.local` template file with placeholder keys
- Verify the dev server starts cleanly on all team machines

### Phase 2 — Wallet Authentication
Implement the MeshJS provider pattern and the pre-built `<CardanoWallet />` component so the Admin can securely connect their Preprod wallet.

- Wrap the root layout in `MeshProvider`
- Mount `<CardanoWallet />` in the application header
- Display the connected wallet address and balance post-connection
- Handle the disconnected state gracefully

### Phase 3 — Dynamic UI & React State
Build the scholarship payment form as a clean React component with full state management — no hardcoding.

- Create a form component with controlled inputs for Recipient Address and ADA Amount
- Implement `useState` for form values, loading state, error state, and success state
- Build the visual success card that displays the TxHash as a clickable link
- Build the error/rejection message component
- Build the loading spinner component

### Phase 4 — Transaction Logic
Implement the core MeshJS transaction builder that converts the form inputs into a signed, submitted Cardano transaction.

- Write the `sendADA()` utility function using the MeshJS `Transaction` class
- Implement ADA → Lovelace conversion with `Number()` parsing
- Wire the form's submit handler to call the `sendADA()` function
- Handle all error and rejection scenarios in `try/catch`
- Pass the returned TxHash back to the UI state

### Phase 5 — QA, Integration & Verification
End-to-end testing, bug triage, and demo preparation. This phase validates all previous phases working together.

- Conduct happy-path testing with funded Preprod wallets
- Test all error paths (cancel signing, insufficient funds, wrong network)
- Verify TxHash links resolve correctly on Cardanoscan
- Document and fix bugs via issues
- Prepare and rehearse the live demo script

---

## 5. Team Task Distribution {#tasks}

---

### 🔧 SHERVIN — DevOps & Environment Lead {#shervin}

**Domain:** Repository initialization, toolchain configuration, dependency management, and CI/CD baseline setup. Shervin's output is the shared foundation that unblocks all other team members on Day 1.

**Priority:** 🔴 CRITICAL PATH — Must complete Tasks 1–3 before any other member can begin.

---

#### Task S-01 — Initialize the Next.js Project Repository

**Estimated Time:** 1–2 hours

**Objective:** Create the canonical project repository that all team members will clone. The project must start clean, typed, and styled out of the box.

**Detailed Steps:**
1. Run the official Next.js scaffold command with all required flags:
   ```bash
   npx create-next-app@latest scholar-chain \
     --typescript \
     --tailwind \
     --eslint \
     --app \
     --src-dir \
     --import-alias "@/*"
   ```
2. Verify the generated project structure matches the agreed `project-structure.md` layout. Create any missing top-level folders: `components/`, `lib/`, `types/`, `hooks/`.
3. Clean up the default Next.js boilerplate: remove placeholder content from `app/page.tsx`, clear `globals.css` of default Next.js styles (keeping Tailwind directives), delete the default `public/` SVG assets.
4. Run `npm run dev` and confirm the dev server starts on `localhost:3000` with zero console errors.
5. Run `npm run lint` and confirm zero lint errors on the clean scaffold.

**Deliverable:** A runnable, clean Next.js 14 project pushed to the `main` branch of the shared GitHub repository.

---

#### Task S-02 — Install and Verify MeshJS Dependencies

**Estimated Time:** 1 hour

**Objective:** Install the exact MeshJS packages required for Increment 1 and verify they resolve without peer dependency conflicts.

**Detailed Steps:**
1. Install the core MeshJS packages:
   ```bash
   npm install @meshsdk/core @meshsdk/react
   ```
2. After installation, open `package.json` and confirm both `@meshsdk/core` and `@meshsdk/react` appear under `dependencies` with version numbers pinned (e.g., `^1.7.x`).
3. Check for peer dependency warnings in the install output. If any appear related to React version mismatches, resolve them by checking MeshJS documentation for the compatible React/Next.js version combination.
4. Create a throwaway test file `lib/mesh/meshTest.ts` and attempt to import `Transaction` from `@meshsdk/core` — confirm TypeScript resolves the import without errors, then delete the test file.
5. Run `npm run build` once to confirm MeshJS does not break the production build pipeline. Address any build-time errors before pushing.

**Deliverable:** `package.json` and `package-lock.json` committed with MeshJS installed. A note in the PR description confirming zero peer dependency conflicts.

---

#### Task S-03 — Configure Git Branch Protection and Team Access

**Estimated Time:** 1–2 hours

**Objective:** Establish a professional Git workflow that prevents broken code from reaching `main` and ensures all work is peer-reviewed.

**Detailed Steps:**
1. Create the GitHub repository under the team's organization and push the initialized project as the first commit with message: `chore: initialize Next.js project scaffold`.
2. Navigate to **Settings → Branches → Add Rule** for the `main` branch. Enable the following protections:
   - ✅ Require pull request reviews before merging (minimum 1 reviewer)
   - ✅ Require status checks to pass before merging (set to lint check once CI is added)
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings
3. Create the following branches for each team member's work domain and push them:
   - `feature/web3-auth` (Austine)
   - `feature/payment-form-ui` (Sherielyn)
   - `feature/transaction-logic` (Christian)
   - `feature/qa-and-testing` (Jamiel)
4. Add all 5 team members as repository collaborators with **Write** access.
5. Create a GitHub Project board (Kanban view) with columns: **Backlog → In Progress → In Review → Done**. Add one card per task in this document to the Backlog column.

**Deliverable:** Protected `main` branch, 4 feature branches created, all 5 members added as collaborators, GitHub Project board initialized.

---

#### Task S-04 — Create Project Configuration Files

**Estimated Time:** 1–2 hours

**Objective:** Create all shared configuration files that standardize the development environment across all team members' machines.

**Detailed Steps:**
1. Create `.env.local` with the following placeholder structure (this file must be in `.gitignore`):
   ```bash
   # ================================================
   # ScholarChain - Environment Variables
   # Increment 1: No external services required yet.
   # Future increments will add Firebase + Blockfrost keys here.
   # ================================================

   # [INCREMENT 2+] Firebase Configuration
   # NEXT_PUBLIC_FIREBASE_API_KEY=
   # NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   # NEXT_PUBLIC_FIREBASE_PROJECT_ID=

   # [INCREMENT 5] Blockfrost (Server-side ONLY — no NEXT_PUBLIC prefix)
   # BLOCKFROST_PROJECT_ID=
   # ADMIN_WALLET_ADDRESS=
   ```
2. Create `.env.example` (identical content, safe to commit) so teammates know what variables they'll eventually need.
3. Create `tailwind.config.ts` with a custom color palette for ScholarChain (primary brand color, success green, error red, neutral grays). Define at minimum:
   ```ts
   theme: {
     extend: {
       colors: {
         brand: { DEFAULT: '#2563EB', dark: '#1d4ed8' },
         success: '#16a34a',
         danger: '#dc2626',
       }
     }
   }
   ```
4. Create a `README.md` with: project overview, local setup instructions (`git clone` → `npm install` → `npm run dev`), wallet setup prerequisites (Eternl, Preprod network, Faucet link), and the team roster.

**Deliverable:** `.env.local`, `.env.example`, updated `tailwind.config.ts`, and a complete `README.md` committed to `main`.

---

#### Task S-05 — Verify Cross-Machine Setup

**Estimated Time:** 30 minutes per machine

**Objective:** Confirm that all 5 team members can clone the repository and run the project successfully on their individual machines before development begins.

**Detailed Steps:**
1. Share the repository link with all team members and instruct them to:
   ```bash
   git clone <repo-url>
   cd scholar-chain
   npm install
   npm run dev
   ```
2. Create a shared checklist (in the GitHub Project board description or a pinned issue) where each member checks off:
   - [ ] `npm install` completed with no errors
   - [ ] `npm run dev` serves the app at `localhost:3000`
   - [ ] Tailwind styles are rendering (check background color of a test element)
   - [ ] MeshJS import resolves without TypeScript error
3. Triage any machine-specific issues (Node version mismatches, Windows path issues, M-series Mac compatibility with native modules).
4. Document any environment-specific fixes in the `README.md` under a "Troubleshooting" section.

**Deliverable:** All 5 members confirmed running locally. Troubleshooting notes added to README if needed.

---

### 🔗 AUSTINE — Web3 Authentication Lead {#austine}

**Domain:** Implement the MeshJS provider architecture and wallet connection UI that forms the authentication layer of the Admin interface. This is the Web3 "login system" — replacing traditional username/password with cryptographic wallet ownership.

**Dependency:** Requires Task S-01 (project scaffold) and S-02 (MeshJS installed) from Shervin before starting.

**Working Branch:** `feature/web3-auth`

---

#### Task A-01 — Implement MeshProvider at the Application Root

**Estimated Time:** 1–2 hours

**Objective:** Wrap the entire Next.js application in MeshJS's context provider so that wallet state is globally accessible to all components, including the transaction form Sherielyn and Christian are building.

**Detailed Steps:**
1. Open `app/layout.tsx` (the root layout). Add the `"use client"` directive at the top since MeshProvider requires client-side rendering.
2. Import `MeshProvider` from `@meshsdk/react`:
   ```tsx
   import { MeshProvider } from "@meshsdk/react";
   ```
3. Wrap the `{children}` prop inside `<MeshProvider>`:
   ```tsx
   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="en">
         <body className="bg-gray-950 text-white min-h-screen">
           <MeshProvider>
             {children}
           </MeshProvider>
         </body>
       </html>
     );
   }
   ```
4. Run `npm run dev` and confirm the application still loads without errors. Check the browser console for any MeshProvider initialization warnings.
5. Verify that `useWallet()` hook (from `@meshsdk/react`) can be called in a child component without throwing a context error. Create a throwaway test component, call `useWallet()`, log the result, confirm it returns an object (even if `connected: false`), then remove the test component.

**Deliverable:** `app/layout.tsx` updated with `MeshProvider`. All child components can now access wallet context.

---

#### Task A-02 — Build the Application Header with Wallet Connect Button

**Estimated Time:** 2–3 hours

**Objective:** Create the main application header component featuring the ScholarChain branding and the pre-built `<CardanoWallet />` MeshJS component. This is the Admin's entry point — the equivalent of a "Login" button.

**Detailed Steps:**
1. Create the file `components/layout/Header.tsx`.
2. Import and render the `<CardanoWallet />` component from `@meshsdk/react`:
   ```tsx
   "use client";
   import { CardanoWallet } from "@meshsdk/react";

   export default function Header() {
     return (
       <header className="w-full bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <span className="text-2xl font-bold text-brand">ScholarChain</span>
           <span className="text-xs text-gray-500 uppercase tracking-widest">
             Admin Portal · Preprod Testnet
           </span>
         </div>
         <CardanoWallet />
       </header>
     );
   }
   ```
3. Import `Header` into `app/layout.tsx` and place it above `{children}` inside the `MeshProvider` block.
4. Test in browser: confirm the `<CardanoWallet />` renders as a styled "Connect Wallet" button. Click it and verify the wallet selection popup appears (listing Eternl/Nami if installed). Connect and confirm the button updates to show a truncated wallet address.
5. Style the header so the `<CardanoWallet />` button visually stands out. Ensure the layout is responsive — on mobile, the brand name can be hidden, keeping only the button visible.

**Deliverable:** `components/layout/Header.tsx` created and mounted in root layout. Wallet connect button is visible and functional.

---

#### Task A-03 — Build the WalletStatus Display Component

**Estimated Time:** 2 hours

**Objective:** Once the wallet is connected, display the Admin's Preprod wallet address and live ADA balance in a prominent status panel below the header. This gives the Admin confidence they are connected to the correct wallet and network before sending funds.

**Detailed Steps:**
1. Create `components/wallet/WalletStatus.tsx`.
2. Use the `useWallet()` hook to access wallet state and `useState`/`useEffect` to fetch the balance:
   ```tsx
   "use client";
   import { useWallet } from "@meshsdk/react";
   import { useEffect, useState } from "react";

   export default function WalletStatus() {
     const { wallet, connected } = useWallet();
     const [balance, setBalance] = useState<string>("—");
     const [address, setAddress] = useState<string>("—");

     useEffect(() => {
       if (!connected || !wallet) return;
       const fetchDetails = async () => {
         try {
           const addr = await wallet.getChangeAddress();
           const lovelace = await wallet.getLovelace();
           const ada = (Number(lovelace) / 1_000_000).toFixed(2);
           setAddress(addr);
           setBalance(ada);
         } catch (err) {
           console.error("Failed to fetch wallet details:", err);
         }
       };
       fetchDetails();
     }, [connected, wallet]);

     if (!connected) return null;

     return (
       <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex justify-between items-center text-sm">
         <span className="text-gray-400">Connected: <span className="text-white font-mono">{address.slice(0, 20)}...{address.slice(-6)}</span></span>
         <span className="text-green-400 font-semibold">{balance} tADA</span>
       </div>
     );
   }
   ```
3. Add a visual indicator for the Preprod network — a small yellow "TESTNET" badge next to the balance to prevent confusion with Mainnet values.
4. Place `<WalletStatus />` on the Admin dashboard page (`app/admin/page.tsx`) directly below the header.
5. Coordinate with Sherielyn: this component should visually integrate with the payment form she is building. Agree on the shared layout structure of `app/admin/page.tsx` before both of you write content into it (see Parallel Strategy section).

**Deliverable:** `components/wallet/WalletStatus.tsx` created. Connected Admin sees their address (truncated) and live tADA balance on the dashboard.

---

#### Task A-04 — Create the TypeScript Hook `useWalletConnection`

**Estimated Time:** 1–2 hours

**Objective:** Abstract the wallet connection state management into a clean, reusable custom hook that Christian can use inside his transaction logic without re-implementing wallet access boilerplate.

**Detailed Steps:**
1. Create `hooks/useWalletConnection.ts`:
   ```ts
   "use client";
   import { useWallet } from "@meshsdk/react";

   export interface WalletConnectionState {
     isConnected: boolean;
     wallet: ReturnType<typeof useWallet>["wallet"];
     address: string | null;
   }

   export function useWalletConnection(): WalletConnectionState {
     const { wallet, connected } = useWallet();
     return {
       isConnected: connected,
       wallet: connected ? wallet : null,
       address: null, // Populated by WalletStatus component to avoid duplicate fetches
     };
   }
   ```
2. Export this hook from an `index.ts` barrel file at `hooks/index.ts` so imports are clean: `import { useWalletConnection } from "@/hooks"`.
3. Write a brief JSDoc comment above the hook explaining what it returns and when `wallet` will be `null`.
4. Communicate to Christian: he should use `useWalletConnection()` inside his `sendADA()` function to access the wallet instance rather than calling `useWallet()` directly. This enforces a single point of wallet access.

**Deliverable:** `hooks/useWalletConnection.ts` created and exported. Christian and Sherielyn can both import and use it.

---

#### Task A-05 — Write the Web3 Auth Integration Test Document

**Estimated Time:** 30 minutes

**Objective:** Produce a brief QA handoff note for Jamiel that documents exactly what wallet connection behavior should be tested and what the expected outcomes are.

**Detailed Steps:**
Write a comment block at the top of `components/wallet/WalletStatus.tsx` (or a separate `docs/auth-test-cases.md`) covering:

| Test Case | Steps | Expected Result |
|---|---|---|
| Connect Wallet — Happy Path | Click button, approve in Eternl | Address + balance displayed |
| Connect with no wallet installed | Click button | Browser wallet selector shows "No wallet found" or similar |
| Connect on wrong network (Mainnet) | Switch wallet to Mainnet, connect | Warning should appear (Jamiel to verify) |
| Disconnect mid-session | Disconnect via wallet extension | WalletStatus component disappears, form disables |
| Reconnect after disconnect | Click Connect again | Wallet reconnects, address + balance refresh |

Share this document with Jamiel to incorporate into his test plan (Task J-02).

**Deliverable:** Test case table committed to the repository in `docs/auth-test-cases.md`.

---

### 🎨 SHERIELYN — UI/UX & React State Development Lead {#sherielyn}

**Domain:** Design and build all client-facing React components: the dynamic payment form, loading states, success TxHash card, and error messages. This layer is entirely decoupled from blockchain logic — Sherielyn works with mock data and stub functions until Christian's transaction logic is ready.

**Dependency:** Requires Task S-01 (project scaffold) and S-03 (branches) from Shervin. Can work fully independently from Austine and Christian using mock props.

**Working Branch:** `feature/payment-form-ui`

---

#### Task SH-01 — Build the `SendScholarshipForm` Component with Controlled Inputs

**Estimated Time:** 3–4 hours

**Objective:** Create the core payment form as a self-contained React component with full controlled-input state management. The form must accept two inputs (recipient address and ADA amount) and expose an `onSubmit` callback — it does NOT implement any blockchain logic itself. This separation allows Christian to wire in the real transaction function independently.

**Detailed Steps:**
1. Create `components/forms/SendScholarshipForm.tsx`.
2. Define the component's prop interface to receive an external submit handler:
   ```tsx
   interface SendScholarshipFormProps {
     onSubmit: (recipientAddress: string, adaAmount: number) => Promise<void>;
     isLoading: boolean;
     isConnected: boolean;
   }
   ```
3. Implement two controlled inputs using `useState`:
   ```tsx
   const [recipientAddress, setRecipientAddress] = useState<string>("");
   const [adaAmount, setAdaAmount] = useState<string>("");
   ```
4. Build the form UI with Tailwind:
   - A titled card container: `"Send Scholarship Payment"`
   - Label + text input for "Recipient Wallet Address" (`placeholder="addr_test1..."`)
   - Label + number input for "ADA Amount" (`placeholder="e.g. 50"`, `min="1"`, `step="1"`)
   - A prominent submit button labeled "Send Scholarship →"
   - The button must be **disabled** when: `isLoading === true`, `isConnected === false`, or either input field is empty
5. Add basic client-side validation:
   - Recipient address must start with `addr_test` (Preprod format)
   - ADA amount must be a positive integer greater than 0
   - Show inline validation messages in red if the user submits with invalid data
6. When `isConnected === false`, render a gentle prompt above the form: *"Please connect your wallet to send scholarships."* The form inputs should be visible but the submit button disabled and grayed out.

**Deliverable:** `components/forms/SendScholarshipForm.tsx` — a fully interactive form component that renders and validates independently of any blockchain code.

---

#### Task SH-02 — Build UI State Components: Loading, Success, and Error

**Estimated Time:** 2–3 hours

**Objective:** Create the three feedback state components that communicate transaction progress to the Admin. These replace the blank screen between "send clicked" and "result received."

**Detailed Steps:**

**Component 1 — `components/ui/LoadingSpinner.tsx`**
```tsx
export default function LoadingSpinner({ message = "Processing transaction..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm animate-pulse">{message}</p>
      <p className="text-xs text-gray-600">This may take ~20 seconds on Preprod</p>
    </div>
  );
}
```

**Component 2 — `components/ui/SuccessMessage.tsx`**
- Accept a `txHash: string` prop
- Display: "✅ Scholarship Sent Successfully!" in green
- Display a truncated TxHash string
- Render the TxHash as a full `<a>` tag linking to `https://preprod.cardanoscan.io/transaction/{txHash}` with `target="_blank"` and `rel="noopener noreferrer"`
- Include a copy-to-clipboard button for the full TxHash
- Include a "Send Another" button that calls a passed `onReset: () => void` prop to clear the form

**Component 3 — `components/ui/ErrorMessage.tsx`**
- Accept an `error: string` prop and an `onDismiss: () => void` prop
- Display: "❌ Transaction Failed" in red
- Show the `error` message in a gray code-style box
- Include a "Try Again" button (calls `onDismiss`)
- Cover common error strings with human-readable explanations:
  - "User declined" → *"You closed the signing window. Click Try Again when ready."*
  - "Insufficient funds" → *"Your wallet doesn't have enough tADA. Visit the Cardano Faucet."*

**Deliverable:** Three feedback UI components in `components/ui/`. All renderable independently with mock props.

---

#### Task SH-03 — Build the `TxHashLink` Utility Component

**Estimated Time:** 1 hour

**Objective:** Create a reusable TxHash display component that will be used in both the success message (Increment 1) and the Transparency Dashboard (Increment 5). Building it as a standalone component now prevents duplication later.

**Detailed Steps:**
1. Create `components/transparency/TxHashLink.tsx`:
   ```tsx
   interface TxHashLinkProps {
     txHash: string;
     label?: string;
     short?: boolean;
   }

   export default function TxHashLink({ txHash, label, short = true }: TxHashLinkProps) {
     const display = short ? `${txHash.slice(0, 10)}...${txHash.slice(-6)}` : txHash;
     const url = `https://preprod.cardanoscan.io/transaction/${txHash}`;
     return (
       <a href={url} target="_blank" rel="noopener noreferrer"
         className="text-blue-400 hover:text-blue-300 underline font-mono text-sm break-all">
         {label ?? display}
       </a>
     );
   }
   ```
2. Use this component inside `SuccessMessage.tsx` (Task SH-02) rather than repeating the anchor tag logic.
3. Add a `data-testid="txhash-link"` attribute for Jamiel's testing use.

**Deliverable:** `components/transparency/TxHashLink.tsx` — a reusable, testable hyperlink component.

---

#### Task SH-04 — Assemble the Admin Dashboard Page

**Estimated Time:** 2 hours

**Objective:** Compose all components (Austine's `WalletStatus`, `SendScholarshipForm`, and the feedback state components) into the final Admin dashboard page layout. Use a stub `onSubmit` function as a placeholder until Christian's transaction logic is ready to drop in.

**Detailed Steps:**
1. Open (or create) `app/admin/page.tsx`. Add the `"use client"` directive.
2. Define the page-level state machine with `useState`:
   ```tsx
   type TxState = "idle" | "processing" | "success" | "error";
   const [txState, setTxState] = useState<TxState>("idle");
   const [txHash, setTxHash] = useState<string>("");
   const [errorMsg, setErrorMsg] = useState<string>("");
   ```
3. Write a **stub** `handleSend` function for now:
   ```tsx
   // STUB — to be replaced by Christian's sendADA() function in Task C-03
   const handleSend = async (address: string, amount: number) => {
     setTxState("processing");
     await new Promise(r => setTimeout(r, 3000)); // Simulate delay
     setTxHash("mock_txhash_abc123def456"); // Mock TxHash
     setTxState("success");
   };
   ```
4. Render conditionally based on `txState`:
   - `"idle"` → Show `<SendScholarshipForm />`
   - `"processing"` → Show `<LoadingSpinner />`
   - `"success"` → Show `<SuccessMessage txHash={txHash} onReset={() => setTxState("idle")} />`
   - `"error"` → Show `<ErrorMessage error={errorMsg} onDismiss={() => setTxState("idle")} />`
5. Include `<WalletStatus />` at the top of the page (from Austine's work). Pass `isConnected` from `useWalletConnection()` down to `<SendScholarshipForm />`.

**Deliverable:** `app/admin/page.tsx` — a fully navigable page with mock transaction flow working end-to-end in the browser.

---

#### Task SH-05 — UI Polish, Responsiveness, and Accessibility Pass

**Estimated Time:** 1–2 hours

**Objective:** Ensure the UI is professional, responsive, and accessible before the final demo.

**Detailed Steps:**
1. Test the layout at mobile (375px), tablet (768px), and desktop (1280px) widths. Fix any overflow or cramped layout issues with Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).
2. Ensure all interactive elements have `:focus-visible` ring styles for keyboard navigation.
3. Add `aria-label` attributes to icon-only buttons (e.g., copy-to-clipboard).
4. Verify all text has sufficient color contrast against backgrounds (aim for WCAG AA minimum).
5. Add a subtle page title in the browser tab: update `app/admin/page.tsx` to export metadata: `export const metadata = { title: "Admin Dashboard | ScholarChain" }`.

**Deliverable:** Polished, responsive, accessible UI ready for demo recording.

---

### ⛓️ CHRISTIAN — Blockchain Transaction Engineering Lead {#christian}

**Domain:** Implement all MeshJS transaction construction, ADA-to-Lovelace conversion, wallet signing orchestration, and transaction submission logic. This is the core blockchain engineering of Increment 1 — the code that actually moves real (test) ADA on the Cardano network.

**Dependency:** Requires Task S-02 (MeshJS installed) and Task A-01 (MeshProvider mounted) before his code can run. Can develop and unit-test the pure utility functions (`lovelaceConversion.ts`) independently from Day 1.

**Working Branch:** `feature/transaction-logic`

---

#### Task C-01 — Build the Lovelace Conversion Utility

**Estimated Time:** 1 hour

**Objective:** Create the foundational math utility that handles ADA ↔ Lovelace conversion. This is the smallest, most testable piece of logic and should be the first thing Christian writes.

**Detailed Steps:**
1. Create `lib/utils/lovelaceConversion.ts`:
   ```ts
   /**
    * Converts a human-readable ADA amount (float) to an integer Lovelace string.
    * Cardano protocol requires integer Lovelaces — no decimals are accepted.
    *
    * @param ada - Human-readable ADA value entered by the Admin (e.g., 50)
    * @returns Lovelace string suitable for MeshJS Transaction (e.g., "50000000")
    * @throws Error if input is not a valid positive number
    */
   export function adaToLovelace(ada: string | number): string {
     const parsed = Number(ada);
     if (isNaN(parsed) || parsed <= 0) {
       throw new Error(`Invalid ADA amount: "${ada}". Must be a positive number.`);
     }
     return String(Math.round(parsed * 1_000_000));
   }

   /**
    * Converts a raw Lovelace integer (from Blockfrost/MeshJS) to a readable ADA string.
    * @param lovelace - Raw Lovelace value (e.g., 50000000)
    * @returns Formatted ADA string (e.g., "50.00")
    */
   export function lovelaceToAda(lovelace: number | string): string {
     return (Number(lovelace) / 1_000_000).toFixed(2);
   }
   ```
2. Verify edge cases mentally (and via console testing):
   - `adaToLovelace("50")` → `"50000000"` ✅
   - `adaToLovelace(5.5)` → `"5500000"` ✅
   - `adaToLovelace("abc")` → throws Error ✅
   - `adaToLovelace(-10)` → throws Error ✅
   - `adaToLovelace("0")` → throws Error ✅
3. Export from `lib/utils/index.ts` barrel: `export { adaToLovelace, lovelaceToAda } from "./lovelaceConversion"`.

**Deliverable:** `lib/utils/lovelaceConversion.ts` with exported and documented conversion functions. Share with Jamiel for unit testing.

---

#### Task C-02 — Implement the Recipient Address Validation Utility

**Estimated Time:** 1 hour

**Objective:** Create a validation function that checks whether a pasted recipient address is a valid Cardano Preprod address format before the transaction is built. Catching invalid addresses early prevents wasted gas and confusing MeshJS errors.

**Detailed Steps:**
1. Create `lib/utils/addressUtils.ts`:
   ```ts
   /**
    * Validates that an address string is a well-formed Cardano Preprod testnet address.
    * Preprod addresses begin with "addr_test1".
    * This is a format check only — not a full cryptographic validation.
    *
    * @param address - Wallet address string to validate
    * @returns true if the address appears to be a valid Preprod address
    */
   export function isValidPreprodAddress(address: string): boolean {
     if (!address || typeof address !== "string") return false;
     return address.startsWith("addr_test1") && address.length >= 50;
   }

   /**
    * Returns a shortened display version of a wallet address.
    * e.g., "addr_test1qpz...a7b8"
    */
   export function shortenAddress(address: string, start = 14, end = 6): string {
     if (!address || address.length < start + end) return address;
     return `${address.slice(0, start)}...${address.slice(-end)}`;
   }
   ```
2. Integrate `isValidPreprodAddress` into Sherielyn's form validation (communicate via PR comment or direct message — she can import it into `SendScholarshipForm.tsx`).

**Deliverable:** `lib/utils/addressUtils.ts`. Notify Sherielyn that she can use `isValidPreprodAddress()` in her form validation.

---

#### Task C-03 — Write the Core `sendADA()` Transaction Function

**Estimated Time:** 3–4 hours

**Objective:** Implement the primary MeshJS transaction function that takes a recipient address and ADA amount from the UI, converts to Lovelaces, constructs the transaction, triggers wallet signing, and submits to Cardano Preprod. This is the most technically critical task in the entire increment.

**Detailed Steps:**
1. Create `lib/mesh/sendAda.ts`:
   ```ts
   import { Transaction } from "@meshsdk/core";
   import { adaToLovelace } from "@/lib/utils/lovelaceConversion";
   import { isValidPreprodAddress } from "@/lib/utils/addressUtils";

   /**
    * Sends ADA from the connected Admin wallet to a specified recipient address.
    * Converts human-readable ADA to Lovelaces, builds the MeshJS transaction,
    * triggers the wallet signing popup, and submits to Cardano Preprod.
    *
    * @param wallet - The connected BrowserWallet instance from useWallet()
    * @param recipientAddress - The destination Preprod wallet address
    * @param adaAmount - ADA amount as typed by the Admin (string from form input)
    * @returns The TxHash string if submission succeeds
    * @throws Error with a user-friendly message on any failure
    */
   export async function sendADA(
     wallet: any, // BrowserWallet type from @meshsdk/core
     recipientAddress: string,
     adaAmount: string
   ): Promise<string> {
     // Step 1: Validate inputs before touching MeshJS
     if (!wallet) throw new Error("Wallet not connected. Please connect your wallet first.");
     if (!isValidPreprodAddress(recipientAddress)) {
       throw new Error("Invalid recipient address. Preprod addresses must start with 'addr_test1'.");
     }

     // Step 2: Convert ADA input to Lovelace string (may throw on invalid input)
     const lovelaceAmount = adaToLovelace(adaAmount);

     // Step 3: Build the transaction using MeshJS Transaction class
     const tx = new Transaction({ initiator: wallet });
     tx.sendLovelace(
       { address: recipientAddress },
       lovelaceAmount
     );

     // Step 4: Build and sign the transaction
     // This call triggers the browser wallet extension popup asking for spending password
     const unsignedTx = await tx.build();
     const signedTx = await wallet.signTx(unsignedTx);

     // Step 5: Submit the signed transaction to Cardano Preprod Testnet
     const txHash = await wallet.submitTx(signedTx);

     return txHash;
   }
   ```
2. Handle the three most common failure modes in a wrapper, or document that callers must use `try/catch`:
   - `User declined` — User closed the wallet popup without signing
   - `Not enough ADA` — Wallet balance insufficient for amount + network fees
   - `Invalid address` — Already caught by Step 1 above
3. Test the function manually by calling it from the browser console with a real Preprod wallet and a test recipient address (coordinate with Jamiel who will have funded test wallets ready — Task J-01).

**Deliverable:** `lib/mesh/sendAda.ts` — the core transaction function, documented and ready to be imported.

---

#### Task C-04 — Wire Transaction Logic into the Admin Dashboard

**Estimated Time:** 2 hours

**Objective:** Replace Sherielyn's stub `handleSend` function in `app/admin/page.tsx` with the real `sendADA()` call, completing the integration between the UI layer and the blockchain layer.

**Detailed Steps:**
1. Open `app/admin/page.tsx` (coordinate with Sherielyn — do this on her branch or agree on a merge sequence to avoid conflicts).
2. Import `sendADA` and `useWalletConnection`:
   ```tsx
   import { sendADA } from "@/lib/mesh/sendAda";
   import { useWalletConnection } from "@/hooks";
   ```
3. Replace the stub `handleSend` with the real implementation:
   ```tsx
   const { wallet, isConnected } = useWalletConnection();

   const handleSend = async (address: string, amount: string) => {
     if (!wallet) return;
     setTxState("processing");
     setErrorMsg("");
     try {
       const hash = await sendADA(wallet, address, amount);
       setTxHash(hash);
       setTxState("success");
     } catch (err: any) {
       const msg = err?.message ?? "An unexpected error occurred.";
       setErrorMsg(msg);
       setTxState("error");
     }
   };
   ```
4. Pass `isLoading={txState === "processing"}` and `isConnected={isConnected}` to `<SendScholarshipForm />` so the button disabling logic works correctly.
5. Test the full flow end-to-end: connect wallet → fill form → click send → sign in Eternl → confirm TxHash appears.

**Deliverable:** `app/admin/page.tsx` updated with real transaction logic. The Admin can execute a real on-chain ADA transfer.

---

#### Task C-05 — Error Handling Hardening & Edge Case Documentation

**Estimated Time:** 1–2 hours

**Objective:** Ensure the transaction flow handles every realistic failure gracefully and that error messages are human-friendly, not raw MeshJS internal errors.

**Detailed Steps:**
1. Create `lib/mesh/errorHandler.ts` — a function that maps raw MeshJS/Cardano error strings to friendly UI messages:
   ```ts
   export function parseTxError(error: unknown): string {
     const msg = error instanceof Error ? error.message : String(error);
     if (msg.toLowerCase().includes("user declined")) return "You cancelled the transaction. Click Try Again when ready.";
     if (msg.toLowerCase().includes("insufficient")) return "Insufficient tADA balance. Please top up from the Cardano Faucet.";
     if (msg.toLowerCase().includes("network")) return "Network error. Check your internet connection and retry.";
     if (msg.toLowerCase().includes("addr_test")) return "Invalid recipient address format. Must start with addr_test1.";
     return `Transaction failed: ${msg}`;
   }
   ```
2. Import and use `parseTxError` inside `handleSend` in `app/admin/page.tsx`.
3. Document the error codes in a comment block at the top of `sendAda.ts` for Jamiel's reference during QA testing.

**Deliverable:** `lib/mesh/errorHandler.ts` integrated into the dashboard. All error scenarios produce friendly messages.

---

### 🧪 JAMIEL — QA, Network & Demo Lead {#jamiel}

**Domain:** Cardano test network setup, end-to-end testing, bug documentation, and live demo preparation. Jamiel is the team's quality gate — nothing ships to the demo without his sign-off.

**Dependency:** Task J-01 can begin Day 1 (independent of code). Full E2E testing (Task J-03) depends on Christian's Task C-04 being merged.

**Working Branch:** `feature/qa-and-testing`

---

#### Task J-01 — Set Up and Fund Preprod Test Wallets

**Estimated Time:** 1–2 hours

**Objective:** Provision all Cardano Preprod testnet wallets the team will need for development and testing, and ensure they are funded with sufficient test ADA from the official faucet.

**Detailed Steps:**
1. Install the **Eternl** browser wallet extension in Chrome.
2. Create **three distinct Preprod testnet wallets** and label them clearly:
   - `Admin Wallet` — The Admin account that will send scholarships. Needs ~50+ tADA for testing.
   - `Student Wallet A` — First test recipient wallet. Used for happy-path testing.
   - `Student Wallet B` — Second test recipient wallet. Used for concurrent/repeat testing.
3. For each wallet, confirm it is set to **Preprod** network (Settings → Network → Preprod in Eternl).
4. Obtain each wallet's receiving address (starts with `addr_test1...`). Record these in a **private** team document (not committed to Git).
5. Fund the Admin Wallet using the Cardano Preprod Faucet:
   - Navigate to: `https://docs.cardano.org/cardano-testnets/tools/faucet`
   - Select **Preprod** testnet
   - Paste the Admin Wallet address
   - Request tADA (the faucet gives ~10,000 tADA per request)
   - Wait for confirmation (~20 seconds) and verify balance in Eternl
6. Optionally fund Student Wallets A and B with small amounts (1–5 tADA) for testing outgoing transaction scenarios in reverse.
7. Share the Admin Wallet address (not seed phrase) with Christian so he can test `sendADA()` transactions before the full UI is complete (Task C-03, Step 3).

**Deliverable:** Three funded Preprod wallets. Admin Wallet has 50+ tADA. Wallet addresses shared with the team via a secure channel.

---

#### Task J-02 — Write the Comprehensive Test Plan

**Estimated Time:** 2 hours

**Objective:** Document every test case that must pass before Increment 1 is signed off as complete. This becomes the team's Definition of Done at the functional level.

**Detailed Steps:**
1. Create `docs/increment-1-test-plan.md` with the following test case structure:

**Section 1: Environment Tests**

| ID | Test Case | Steps | Expected Result | Status |
|---|---|---|---|---|
| ENV-01 | Dev server starts | `npm run dev` | App renders at `localhost:3000` | ⬜ |
| ENV-02 | No TypeScript errors | `npm run build` | Zero errors, build succeeds | ⬜ |
| ENV-03 | No lint errors | `npm run lint` | Zero warnings or errors | ⬜ |

**Section 2: Wallet Connection Tests (from Austine's auth cases)**

| ID | Test Case | Steps | Expected Result | Status |
|---|---|---|---|---|
| WALLET-01 | Connect wallet — happy path | Install Eternl, set Preprod, click Connect | Address + balance displayed | ⬜ |
| WALLET-02 | Wallet not installed | Click Connect with no extension | Graceful message, no crash | ⬜ |
| WALLET-03 | Wallet on wrong network | Set Eternl to Mainnet, click Connect | Warning displayed | ⬜ |
| WALLET-04 | Disconnect mid-session | Disconnect via Eternl | WalletStatus hides, form disables | ⬜ |
| WALLET-05 | Reconnect after disconnect | Click Connect after disconnecting | Wallet reconnects cleanly | ⬜ |

**Section 3: Form Validation Tests**

| ID | Test Case | Steps | Expected Result | Status |
|---|---|---|---|---|
| FORM-01 | Submit empty form | Click Send with empty fields | Inline validation errors shown | ⬜ |
| FORM-02 | Invalid address format | Type `xyz123`, click Send | "Must start with addr_test1" error | ⬜ |
| FORM-03 | Zero ADA amount | Type `0`, click Send | Validation error shown | ⬜ |
| FORM-04 | Negative ADA amount | Type `-5`, click Send | Validation error shown | ⬜ |
| FORM-05 | Send button disabled when disconnected | Disconnect wallet | Send button is grayed out + disabled | ⬜ |

**Section 4: Transaction Flow Tests**

| ID | Test Case | Steps | Expected Result | Status |
|---|---|---|---|---|
| TX-01 | Happy path — complete transaction | Fill form with valid data, sign | TxHash displayed as clickable link | ⬜ |
| TX-02 | Spinner visible during processing | Observe after signing | Spinner + "Processing..." shown for ~20s | ⬜ |
| TX-03 | User cancels wallet popup | Open signing popup, close it | Friendly "cancelled" error message | ⬜ |
| TX-04 | Insufficient balance | Send more tADA than available | Friendly "insufficient funds" error | ⬜ |
| TX-05 | No double-submit | Click Send while processing | Send button disabled during PROCESSING state | ⬜ |
| TX-06 | TxHash link opens explorer | Click TxHash link | `preprod.cardanoscan.io` opens in new tab | ⬜ |
| TX-07 | Explorer confirms transaction | View TxHash on Cardanoscan | Correct amount + recipient address shown | ⬜ |
| TX-08 | Send Again after success | Click "Send Another" | Form resets to idle state | ⬜ |
| TX-09 | Send Again after error | Click "Try Again" | Form resets to idle state | ⬜ |
| TX-10 | Multiple sequential transactions | Send 3 transactions in a row | Each succeeds with a unique TxHash | ⬜ |

**Deliverable:** `docs/increment-1-test-plan.md` committed to `feature/qa-and-testing` branch.

---

#### Task J-03 — Execute End-to-End Testing and File Bug Reports

**Estimated Time:** 3–4 hours (after Christian's Task C-04 is merged)

**Objective:** Execute every test case in the test plan against the integrated application. Document all failures as GitHub Issues with severity labels.

**Detailed Steps:**
1. Pull the latest `main` branch (after Christian and Sherielyn's PRs are merged). Run `npm install && npm run dev`.
2. Execute each test case in `increment-1-test-plan.md` sequentially. For each:
   - Mark ✅ Pass or ❌ Fail with a brief note
   - For failures: file a GitHub Issue immediately with:
     - **Title:** `[BUG] TX-04: Insufficient balance error crashes app instead of showing friendly message`
     - **Labels:** `bug`, `increment-1`, `severity: high/medium/low`
     - **Assigned to:** The responsible developer (Christian for transaction bugs, Sherielyn for UI bugs, Austine for wallet bugs)
     - **Description:** Steps to reproduce, expected behavior, actual behavior, screenshot if applicable
3. Perform exploratory testing beyond the documented cases — try unusual inputs, rapid clicking, switching wallets mid-flow.
4. Re-test all ❌ failed cases after the assigned developer pushes a fix.
5. Final sign-off: all 23 test cases must show ✅ before Increment 1 is declared complete.

**Deliverable:** Fully executed test plan with all statuses populated. All bugs filed as GitHub Issues. Final sign-off comment on the GitHub Project board.

---

#### Task J-04 — Verify Transactions on Cardanoscan

**Estimated Time:** 1 hour

**Objective:** Independently verify that the TxHashes generated by the application represent real, accurate transactions on the Cardano Preprod public ledger — not spoofed data.

**Detailed Steps:**
1. After executing Test TX-01 (happy path), copy the displayed TxHash.
2. Navigate to `https://preprod.cardanoscan.io` and paste the TxHash into the search bar.
3. Verify ALL of the following match expectations:
   - [ ] Transaction exists and is confirmed (not pending)
   - [ ] `Outputs` section shows the correct ADA amount (e.g., 5 ADA)
   - [ ] Recipient address in Outputs matches the address typed in the form
   - [ ] A change output exists returning remaining ADA to the Admin wallet
   - [ ] Block time shown is approximately when the transaction was submitted
   - [ ] Transaction fee deducted from Admin wallet is a reasonable Cardano network fee (~0.17–0.20 ADA)
4. Screenshot the Cardanoscan confirmation page. Add it to `docs/cardanoscan-verification-screenshot.png`.
5. Document one confirmed TxHash in `docs/increment-1-test-plan.md` as the "Verified Reference Transaction" for the demo.

**Deliverable:** Screenshot evidence of at least one confirmed on-chain transaction. Documented reference TxHash.

---

#### Task J-05 — Prepare and Rehearse the Live Demo Script

**Estimated Time:** 2–3 hours

**Objective:** Write a step-by-step demo script that any team member can execute in under 5 minutes. The demo must be bulletproof — accounting for every possible point of failure with fallback plans.

**Detailed Steps:**
1. Create `docs/increment-1-demo-script.md` with the following structure:

---

**SCHOLARCHAIN — INCREMENT 1 DEMO SCRIPT**
**Target Duration:** 3–5 minutes
**Presenter:** [Assigned team member]
**Pre-Demo Setup (5 minutes before presenting):**

- [ ] Laptop connected to projector/screen share — test display works
- [ ] Chrome open with `localhost:3000` loaded
- [ ] Eternl extension installed, unlocked, and set to **Preprod**
- [ ] Admin Wallet has at least **20 tADA** available (check balance before starting)
- [ ] Have `Student Wallet A` address (`addr_test1...`) copied to clipboard
- [ ] Close all other browser tabs and notifications
- [ ] Run `npm run dev` and confirm no console errors

**Demo Flow:**

1. **(0:00)** "This is ScholarChain, a blockchain-based scholarship tracking system. What you're seeing is Increment 1 — we call it The Plumbing."
2. **(0:15)** "Notice the Connect Wallet button in the top right. Instead of a username and password, our Admin authenticates using a Cardano cryptographic wallet."
3. **(0:30)** Click **Connect Wallet**. Select **Eternl**. Approve in the extension popup.
4. **(0:45)** "The Admin's wallet address and their available test ADA balance are now displayed. The system knows who is authorized."
5. **(1:00)** "Now, to send a scholarship payment, the Admin enters the student's wallet address and the amount."
6. **(1:15)** Paste `Student Wallet A` address into the Recipient field. Type `5` into the Amount field.
7. **(1:30)** Click **Send Scholarship**. The Eternl popup appears. "The wallet is asking the Admin to cryptographically sign this transaction — this is the key security moment. No one else can authorize the movement of these funds."
8. **(1:45)** Enter spending password and click **Sign**.
9. **(2:00)** "You can see the loading state — the transaction is in the Cardano mempool, waiting to be included in the next block. On Preprod this takes about 20 seconds."
10. **(2:30)** TxHash appears. "The transaction is confirmed. This hash is the transaction's permanent fingerprint on the Cardano blockchain."
11. **(2:45)** Click the TxHash link. Cardanoscan opens. "Notice — we are now on Cardanoscan, a completely independent block explorer. This is not our website. This is the global Cardano ledger."
12. **(3:00)** Point out the amount (5 ADA), recipient address, and block confirmation time.
13. **(3:15)** "This 5 ADA transfer is now immutable. It cannot be altered, deleted, or disputed. That's the foundation our scholarship system is built on."

**Fallback Plans:**

| Problem | Response |
|---|---|
| Wallet extension not detecting | Refresh page, click Connect again |
| Transaction takes >45 seconds | "Preprod occasionally has slower blocks — this is expected on a testnet" |
| TxHash link is slow to load | Pre-open a previously verified TxHash from Task J-04 as a backup |
| Insufficient balance | Have `Student Wallet B` address ready to test with — or have a pre-verified TxHash screenshot |
| App crashes | Have the app running locally as a backup presentation using pre-recorded screen capture |

---

2. Rehearse the demo script at least twice before the actual presentation.
3. Share the script with the full team so any member can present if needed.

**Deliverable:** `docs/increment-1-demo-script.md` committed. At least one full rehearsal completed.

---

## 6. Parallel Development Strategy & Dependency Map {#parallel}

The following diagram shows the task execution order and which tasks can run in parallel to eliminate bottlenecks.

```
DAY 1                          DAY 2                        DAY 3-4
─────────────────────────────────────────────────────────────────────────
SHERVIN
  S-01: Scaffold ──────────────►│
  S-02: Install MeshJS ─────────►│ All members unblocked
  S-03: Git Setup ──────────────►│
  S-04: Config Files ────────────►│
  S-05: Cross-Machine Check                                ► S-05 (rolling)

AUSTINE                          │
  (waits for S-01, S-02)         ├── A-01: MeshProvider ──► A-02: Header ──► A-03: WalletStatus ──► A-04: Hook ──► A-05: Test Doc
                                 │
SHERIELYN                        │
  (waits for S-01)               ├── SH-01: Form ──────────► SH-02: States ──► SH-03: TxHashLink ──► SH-04: Dashboard ──► SH-05: Polish
                                 │
CHRISTIAN                        │
  C-01: Lovelace Utils ──────────►│ (waits for A-01 to run)  C-02: Address Utils ──► C-03: sendADA() ──► C-04: Wire to UI ──► C-05: Error Handling
                                 │
JAMIEL                           │
  J-01: Wallets + Faucet ────────►│                          J-02: Test Plan ──────────────────────────────► J-03: E2E Testing ──► J-04: Verify ──► J-05: Demo Script
─────────────────────────────────────────────────────────────────────────
                                 ▲
                             UNBLOCK POINT:
                          Shervin's S-01 + S-02
                       completed and pushed to main
```

### Critical Path
`S-01 → S-02 → A-01 → C-04 → J-03 → J-05`

The absolute longest serial chain — any delay on this path delays the entire increment.

### Parallel Tracks (can run simultaneously after Day 1)
- **Track A:** Austine (A-01 through A-05)
- **Track B:** Sherielyn (SH-01 through SH-05) — can mock wallet state locally
- **Track C:** Christian (C-01 through C-02 immediately, C-03+ after A-01 merges)
- **Track D:** Jamiel (J-01 immediately, J-02 while others code)

### Integration Points (require coordination)
| Integration | Who | When | How |
|---|---|---|---|
| `useWalletConnection` hook available | Austine → Christian & Sherielyn | End of Day 1 | A-04 merged to main |
| `isValidPreprodAddress()` available | Christian → Sherielyn | Day 2 | C-02 merged; Sherielyn imports it |
| `handleSend` stub → real function | Christian → Sherielyn | Day 3 | Coordinate on `app/admin/page.tsx` to avoid merge conflicts |
| Test wallet addresses | Jamiel → Christian | Day 1 | Shared via team chat (never in Git) |

---

## 7. Integration Checklist {#integration}

Before creating the final "Ready for Demo" Pull Request, every item below must be checked:

### Code Integration
- [ ] `MeshProvider` wraps root layout (`app/layout.tsx`)
- [ ] `<CardanoWallet />` renders in `Header.tsx` and is mounted in root layout
- [ ] `useWalletConnection()` hook used consistently — no direct `useWallet()` calls in page files
- [ ] `sendADA()` imported and called in `app/admin/page.tsx` (not the stub)
- [ ] `adaToLovelace()` called inside `sendADA()` (not inline in the component)
- [ ] All MeshJS calls wrapped in `try/catch` with `parseTxError()` for friendly messages
- [ ] `txState` state machine drives all conditional rendering (`idle | processing | success | error`)
- [ ] Send button disabled during `processing` and when wallet is disconnected
- [ ] TxHash rendered via `<TxHashLink />` component pointing to `preprod.cardanoscan.io`

### Quality Gates
- [ ] `npm run build` completes with zero TypeScript errors
- [ ] `npm run lint` returns zero warnings or errors
- [ ] All 23 test cases in `docs/increment-1-test-plan.md` show ✅
- [ ] At least one confirmed TxHash screenshot in `docs/`
- [ ] Demo script rehearsed at least once

### No-Fly Items (must NOT be present)
- [ ] No hardcoded wallet addresses in any `.tsx` or `.ts` file
- [ ] No `NEXT_PUBLIC_` prefixed secrets (there are none needed in Increment 1)
- [ ] No disabled `eslint` comments without justification
- [ ] No `any` TypeScript types in `lib/mesh/sendAda.ts` without a comment explaining why
- [ ] No direct DOM manipulation (`document.getElementById`) — use React state only

---

## 8. Branch & Git Strategy {#git}

### Branching Model

```
main (protected)
  ├── feature/web3-auth              (Austine)
  ├── feature/payment-form-ui        (Sherielyn)
  ├── feature/transaction-logic      (Christian)
  └── feature/qa-and-testing         (Jamiel)
```

### Commit Message Convention
All commits must follow this format:
```
type(scope): short description

Types: feat | fix | chore | style | docs | test | refactor
Scope: auth | form | tx | config | qa | ui

Examples:
  feat(auth): add MeshProvider to root layout
  feat(form): implement controlled inputs with validation
  feat(tx): add sendADA utility with Lovelace conversion
  fix(form): disable submit button during processing state
  chore(config): initialize Next.js project scaffold
  docs(qa): add increment-1 test plan
```

### Pull Request Rules
1. **Every PR must reference its task ID** in the title: `[A-02] Build Header with CardanoWallet component`
2. **All PRs target `main`** (no feature-to-feature merges)
3. **Minimum 1 reviewer** required — rotate reviewers to spread knowledge
4. **PR description must include:**
   - What was built
   - How to test it locally
   - Screenshots or console output evidence that it works
   - Checklist of Definition of Done items covered

### Merge Order Recommendation
To minimize merge conflicts on shared files (`app/admin/page.tsx`, `app/layout.tsx`):
1. Shervin's setup PRs first
2. Austine's `app/layout.tsx` changes
3. Sherielyn's `app/admin/page.tsx` (with stub)
4. Christian's `lib/mesh/` utilities (no shared file conflicts)
5. Christian's `app/admin/page.tsx` update (replaces stub — coordinate with Sherielyn first)
6. Jamiel's `docs/` additions

---

## 9. Daily Standup Template {#standup}

Use this format for all daily standups (keep to 10 minutes maximum):

```
👤 [Name] — [Date]

✅ DONE (since last standup):
   - [Specific task or sub-task completed with task ID, e.g., "S-01: Scaffold complete, pushed to main"]

🔨 DOING (today):
   - [What you're working on now, e.g., "A-02: Building Header with CardanoWallet — 60% done"]

🚧 BLOCKED (if any):
   - [Specific blocker and who can unblock you, e.g., "Waiting on S-02 merge from Shervin to test MeshJS import"]

📢 NEEDS FROM TEAM:
   - [Any coordination needed, e.g., "Sherielyn — need to align on app/admin/page.tsx structure before I write handleSend"]
```

---

## 10. Risk Register {#risks}

| ID | Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R-01 | MeshJS peer dependency conflict with Next.js 14 | Medium | High | Shervin checks MeshJS release notes for Next.js 14 compatibility before installation. Fall back to Next.js 13 if needed. | Shervin |
| R-02 | Cardano Faucet rate-limited or down | Low | High | Jamiel requests tADA early (Day 1). Keep 2–3 backup funded wallets. | Jamiel |
| R-03 | Merge conflict on `app/admin/page.tsx` | High | Medium | Sherielyn ships stub first; Christian replaces stub in a coordinated PR on Day 3. | Christian + Sherielyn |
| R-04 | Wallet extension not compatible with dev machine OS | Low | High | Test on Chrome first. Document Brave/Firefox fallback. | Jamiel |
| R-05 | Preprod testnet slowness (>60s block time) | Low | Low | Add note in demo script: "Preprod occasionally slower." Pre-verify a TxHash as fallback. | Jamiel |
| R-06 | `signTx` or `submitTx` API changed in latest MeshJS version | Low | High | Pin exact MeshJS version in `package.json`. Read MeshJS CHANGELOG before updating. | Christian |
| R-07 | Team member unable to complete tasks | Low | High | All tasks are documented in sufficient detail that another member can pick up any task from this document. | All |

---

*This document is the single source of truth for Increment 1 execution. All scope decisions, task assignments, and integration rules defined here supersede verbal agreements. Any changes to scope must be agreed upon by all 5 members and reflected in an update to this file via PR.*

---

**Document Version:** 1.0  
**Authors:** ScholarChain Team  
**Review Status:** Approved for Execution ✅
