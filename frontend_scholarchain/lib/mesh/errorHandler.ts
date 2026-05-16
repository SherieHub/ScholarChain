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
  if (msg.toLowerCase().includes("addr_test"))
    return "Invalid recipient address format. Must start with addr_test1.";
  if (msg.toLowerCase().includes("scholar") && msg.toLowerCase().includes("token"))
    return "Insufficient SCHOLAR tokens in admin wallet. Mint more supply first.";
  if (msg.toLowerCase().includes("policy") && msg.toLowerCase().includes("not found"))
    return "Token Policy ID not found. Mint the SCHOLAR token supply before sending rewards.";
  return `Transaction failed: ${msg}`;
}
