/**
 * Maps raw MeshJS / Cardano error strings to human-readable UI messages.
 * Called in every catch block that wraps a MeshJS transaction call.
 *
 * @param error - The thrown value from a failed transaction
 * @returns A friendly string safe to display directly to the Admin
 */
export function parseTxError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.toLowerCase().includes("user declined"))
    return "You cancelled the transaction. Click Try Again when ready.";
  if (msg.toLowerCase().includes("insufficient"))
    return "Insufficient tADA balance. Please top up from the Cardano Faucet.";
  if (msg.toLowerCase().includes("network"))
    return "Network error. Check your internet connection and retry.";
  if (msg.includes("ErrorSync") || msg.includes("loadUtxoCbor"))
    return "Wallet sync failed. The Preprod network may be slow — please wait a moment and try again.";
  if (msg.toLowerCase().includes("addr_test"))
    return "Invalid recipient address format. Must start with addr_test1.";
  return `Transaction failed: ${msg}`;
}
