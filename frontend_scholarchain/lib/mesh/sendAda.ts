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
  adaAmount: string,
): Promise<string> {
  // Step 1: Validate inputs before touching MeshJS
  if (!wallet)
    throw new Error("Wallet not connected. Please connect your wallet first.");
  if (!isValidPreprodAddress(recipientAddress)) {
    throw new Error(
      "Invalid recipient address. Preprod addresses must start with 'addr_test1'.",
    );
  }

  // Step 2: Convert ADA input to Lovelace string (may throw on invalid input)
  const lovelaceAmount = adaToLovelace(adaAmount);

  // Step 3: Build the transaction using MeshJS Transaction class
  const tx = new Transaction({ initiator: wallet });
  tx.sendLovelace({ address: recipientAddress }, lovelaceAmount);

  // Step 4: Build and sign — triggers the browser wallet popup
  const unsignedTx = await tx.build();
  const signedTx = await wallet.signTx(unsignedTx);

  // Step 5: Submit the signed transaction to Cardano Preprod Testnet
  const txHash = await wallet.submitTx(signedTx);

  return txHash;
}
