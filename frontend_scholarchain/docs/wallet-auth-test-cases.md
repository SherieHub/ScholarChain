# Task A-05: Wallet Authentication Test Plan & Implementation Guide

This document provides the formal test cases and the step-by-step implementation process for the Web3 Authentication module in Increment 1.

---

## 1. Implementation Process Guide

Follow these steps to complete the coding phase of the Web3 Auth module:

### Step 1: Provider Setup (`app/layout.tsx`)
1. Wrap the `{children}` of the root layout with `<MeshProvider>`.
2. Ensure the layout handles the "use client" directive if needed for MeshJS integration.

### Step 2: Hook Logic (`hooks/useWalletConnection.ts`)
1. Initialize `useWallet()`.
2. Set up `useState` for `address` and `balance`.
3. Implement a `useEffect` with `[connected, wallet]` dependencies.
4. Inside the effect, use an `async` function to:
   - Call `wallet.getUsedAddresses()` -> set first address.
   - Call `wallet.getBalance()` -> set balance.
5. Return the unified state object.

### Step 3: UI Components (`components/wallet/`)
1. **WalletConnectButton**: Drop in the `<CardanoWallet />` component from MeshJS.
2. **WalletStatus**: Use `useWalletConnection` to conditionally display the address and balance if `connected` is true.

---

## 2. Detailed Test Cases (QA-A05)

These cases must be executed by the QA Lead (Jamiel) using a funded **Cardano Preprod** wallet.

### WALLET-01: Happy Path Connection
**Objective:** Verify that a user can connect a valid wallet and see their data.
- **Setup:** Chrome browser with Eternl extension installed; wallet set to **Preprod**.
- **Steps:**
    1. Navigate to the landing page.
    2. Click the "Connect Wallet" button in the header.
    3. Select "Eternl" from the MeshJS modal.
    4. Provide the spending password/approval in the extension popup.
- **Expected Result:**
    - Button text changes to show a shortened version of the wallet name/address.
    - `WalletStatus` component displays the correct Bech32 address (`addr_test1...`).
    - ADA Balance is displayed and matches the balance shown in the Eternl extension.

### WALLET-02: User Cancellation
**Objective:** Verify the app remains stable if the user aborts the connection.
- **Setup:** Wallet disconnected.
- **Steps:**
    1. Click "Connect Wallet".
    2. Select "Eternl".
    3. When the Eternl popup appears, click "Cancel" or close the popup window.
- **Expected Result:**
    - The connection modal closes.
    - No console errors are thrown.
    - The button returns to the "Connect Wallet" state.

### WALLET-03: Network Mismatch Warning
**Objective:** Ensure the user is notified if they are on the wrong network.
- **Setup:** Set Eternl wallet to **Mainnet**.
- **Steps:**
    1. Attempt to connect the wallet.
- **Expected Result:**
    - MeshJS internal validation should trigger.
    - The UI should display a warning or remain in a "Disconnected" state with a clear message: "Please switch to Cardano Preprod Testnet."

### WALLET-04: Session Persistence & Disconnect
**Objective:** Verify that disconnection clears sensitive data and refreshing persists the session.
- **Setup:** Wallet connected.
- **Steps:**
    1. Refresh the browser page. (Persistence check)
    2. Manually disconnect via the Eternl extension or an in-app "Disconnect" button.
- **Expected Result:**
    - **Refresh:** The wallet should remain connected (MeshJS handles local storage session).
    - **Disconnect:** The `address` and `balance` states in `useWalletConnection` must immediately become `null`. The UI must hide the wallet details.

### WALLET-05: Missing Extension
**Objective:** Verify behavior when no Cardano wallet is installed.
- **Setup:** Use a browser profile without any wallet extensions.
- **Steps:**
    1. Click "Connect Wallet".
- **Expected Result:**
    - MeshJS modal should show "No wallets detected" or provide links to install supported wallets (Eternl, Nami).
