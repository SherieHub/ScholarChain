/**
 * useWalletConnection Hook
 * 
 * LOCATION: hooks/useWalletConnection.ts
 * 
 * PURPOSE:
 * Wraps the 'useWallet' hook from MeshJS to provide a unified interface for the application.
 * It manages connection status, wallet metadata (address, balance), and loading states.
 * 
 * IMPLEMENTATION INSTRUCTIONS:
 * 1. Import 'useWallet' from '@meshsdk/react'.
 * 2. Initialize the hook at the top level of your function:
 *    const { wallet, connected, connecting, name, disconnect, error } = useWallet();
 * 3. Use 'useState' for 'address' (string) and 'balance' (string/number).
 * 4. Use 'useEffect' to fetch the address and balance whenever 'connected' is true:
 *    - Address: Call 'wallet.getUsedAddresses()'.
 *    - Balance: Call 'wallet.getBalance()'.
 * 5. Handle potential errors during fetching with a 'try/catch' block.
 * 
 * FLOW:
 * - On component mount, 'useWallet()' is initialized and connects to the nearest 'MeshProvider'.
 * - It reactively listens to the global wallet state (e.g., when a user connects via CardanoWallet button).
 * - When 'connected' transitions to 'true', the hook triggers local 'useEffect' logic to hydrate address and balance.
 * - Provides the 'wallet' instance required for signing transactions in 'lib/mesh/sendAda.ts'.
 * 
 * RETURN VALUE:
 * An object containing:
 * - wallet: The BrowserWallet instance (for transaction signing).
 * - connected: boolean indicating if a wallet is currently linked.
 * - connecting: boolean indicating if the connection is in progress.
 * - address: The primary Cardano address of the connected user.
 * - balance: The current ADA balance in Lovelaces or ADA.
 * - name: The name of the wallet extension (e.g., 'Eternl').
 * - disconnect: Function to manually terminate the connection.
 * 
 * STEP-BY-STEP IMPLEMENTATION FLOW:
 * 1. INITIALIZATION: Call the base 'useWallet' hook to access the underlying MeshJS state machine.
 * 2. LOCAL STATE: Initialize React state variables to hold the 'address' and 'balance' which aren't provided reactively by the base hook.
 * 3. REACTIVE HYDRATION: Create a 'useEffect' that watches the 'connected' variable.
 * 4. ASYNC DATA FETCH: When 'connected' is true, invoke the wallet's asynchronous methods to retrieve the user's public address and assets.
 * 5. ERROR BOUNDARY: Wrap the async calls in a try/catch to prevent UI crashes if the wallet extension fails to respond.
 * 6. STATE SYNC: Update the local state with the results. If 'connected' becomes false, clear the local state to ensure security and UI consistency.
 * 7. EXPOSURE: Return a consolidated object that merges the base MeshJS state with your hydrated data.
 * 
 * PSEUDOCODE:
 * ```
 * FUNCTION useWalletConnection() {
 *    // Access MeshJS base states
 *    BASE_STATE = CALL useWallet()
 * 
 *    // Setup local storage for data we need to fetch manually
 *    STATE [address, balance, loading]
 * 
 *    // Watch for connection changes
 *    EFFECT (whenever BASE_STATE.connected changes) {
 *       IF (BASE_STATE.connected is TRUE) {
 *          SET loading = TRUE
 *          TRY {
 *             // Request data from the wallet extension
 *             addresses = AWAIT BASE_STATE.wallet.getUsedAddresses()
 *             lovelaces = AWAIT BASE_STATE.wallet.getBalance()
 *             
 *             // Update local state
 *             SET address = addresses[0]
 *             SET balance = lovelaces
 *          } CATCH (error) {
 *             LOG error
 *          } FINALLY {
 *             SET loading = FALSE
 *          }
 *       } ELSE {
 *          // Clear data on disconnect
 *          SET address = NULL
 *          SET balance = NULL
 *       }
 *    }
 * 
 *    // Return unified interface
 *    RETURN {
 *       ...BASE_STATE,
 *       address: address,
 *       balance: balance,
 *       isFetchingData: loading
 *    }
 * }
 * ```
 */

// Corrected Implementation Pattern

import { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';

export const useWalletConnection = () => {
    const { wallet, connected, connecting, name, disconnect, error } = useWallet();
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);

    useEffect(() => {
        const updateData = async () => {
            if (connected && wallet) {
                try {
                    const addresses = await wallet.getUsedAddresses();
                    const lovelace = await wallet.getBalance();
                    setAddress(addresses[0]);
                    setBalance(lovelace);
                } catch (e) {
                    console.error("Wallet data fetch failed", e);
                }
            } else {
                setAddress(null);
                setBalance(null);
            }
        };

        updateData();
    }, [connected, wallet]);

    return {
        wallet,
        connected,
        connecting,
        address,
        balance,
        name,
        disconnect,
        error
    };
};

