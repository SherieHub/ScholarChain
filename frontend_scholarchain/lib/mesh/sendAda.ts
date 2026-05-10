import { Transaction, BrowserWallet } from "@meshsdk/core";
import { adaToLovelace } from "@/lib/utils/lovelaceConversion";
import { isValidPreprodAddress } from "@/lib/utils/addressUtils";

const MAX_SYNC_RETRIES = 2;

// ErrorSync.loadUtxoCborFromTxList is thrown by the wallet extension when its
// internal UTxO sync fetch fails — a transient network/rate-limit issue on Preprod.
function isSyncError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("ErrorSync") || msg.includes("loadUtxoCbor");
}

/**
 * Sends ADA from the connected Admin wallet to a specified recipient address.
 *
 * Accepts a wallet name (e.g. "eternl") instead of the wallet object directly.
 * This is necessary because @meshsdk/react@2.x returns a v2 BrowserWallet whose
 * getUtxos() returns raw hex CBOR strings, but @meshsdk/transaction (used by the
 * Transaction class) calls selectUtxosFrom() which expects deserialized UTxO objects.
 * Re-enabling via BrowserWallet.enable() from @meshsdk/core gives the correct v1
 * wallet that deserializes UTxOs properly — no wallet popup is shown since the
 * browser extension caches the already-granted permission.
 *
 * @param walletName - The wallet identifier returned by useWallet().name (e.g. "eternl")
 * @param recipientAddress - The destination Preprod wallet address (addr_test1...)
 * @param adaAmount - ADA amount as a string (e.g. "5")
 * @returns The TxHash string on success
 * @throws Error with a user-friendly message on any failure
 */
export async function sendADA(
  walletName: string,
  recipientAddress: string,
  adaAmount: string,
): Promise<string> {
  if (!walletName)
    throw new Error("Wallet not connected. Please connect your wallet first.");
  if (!isValidPreprodAddress(recipientAddress)) {
    throw new Error(
      "Invalid recipient address. Preprod addresses must start with 'addr_test1'.",
    );
  }

  const lovelaceAmount = adaToLovelace(adaAmount);

  // BrowserWallet.enable() does NOT show a popup when already connected — the
  // extension returns the cached permission. Using the core v1 wallet here so
  // getUtxos() returns deserialized UTxO objects as Transaction.build() expects.
  const wallet = await BrowserWallet.enable(walletName);

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_SYNC_RETRIES; attempt++) {
    if (attempt > 0) {
      // Wallet sync errors are transient — give the extension time to re-sync.
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
    try {
      const tx = new Transaction({ initiator: wallet });
      tx.sendLovelace({ address: recipientAddress }, lovelaceAmount);
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      return await wallet.submitTx(signedTx);
    } catch (err: unknown) {
      if (attempt < MAX_SYNC_RETRIES && isSyncError(err)) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
