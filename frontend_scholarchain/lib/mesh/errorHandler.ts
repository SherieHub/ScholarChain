/**
 * Maps raw MeshJS / Cardano error strings to human-readable UI messages.
 * Called in every catch block that wraps a MeshJS transaction call.
 *
 * @param error - The thrown value from a failed transaction
 * @returns A friendly string safe to display directly to the Admin
 */
export function parseTxError(error: unknown): string {
  // CIP-30 wallets (Eternl, Nami, etc.) throw plain objects like { code, info }
  // rather than Error instances. Extract the info field when present.
  let msg: string;
  if (error instanceof Error) {
    msg = error.message;
  } else if (
    error !== null &&
    typeof error === "object" &&
    "info" in error &&
    typeof (error as Record<string, unknown>).info === "string"
  ) {
    msg = (error as Record<string, unknown>).info as string;
  } else {
    msg = String(error);
  }

  const lower = msg.toLowerCase();

  if (lower.includes("user declined") || lower.includes("user cancelled") || lower.includes("declined by user"))
    return "You cancelled the transaction. Click Try Again when ready.";
  if (lower.includes("insufficient"))
    return "Insufficient tADA balance. Please top up from the Cardano Faucet.";
  if (lower.includes("network"))
    return "Network error. Check your internet connection and retry.";
  if (lower.includes("addr_test"))
    return "Invalid recipient address format. Must start with addr_test1.";
  if (lower.includes("scholar") && lower.includes("token"))
    return "Insufficient SCHOLAR tokens in admin wallet. Mint more supply first.";
  if (lower.includes("policy") && lower.includes("not found"))
    return "Token Policy ID not found. Mint the SCHOLAR token supply before sending rewards.";
  if (lower.includes("university config not found"))
    return "Firestore config document is missing. Create the config/config document in Firebase Console before minting.";
  if (lower.includes("badge ipfs uri is not configured"))
    return "Badge IPFS URI is not set. Upload a badge image to Pinata and store the ipfs:// URI in the Firestore config document.";
  if (lower.includes("max_length_limit") || lower.includes("too long"))
    return "Transaction rejected: a metadata value exceeds Cardano's 64-byte limit.";
  if (lower.includes("all inputs are spent") || lower.includes("probably already been included") || lower.includes("mempoolFailure"))
    return "A previous transaction is still being processed. Wait 30–60 seconds for it to confirm on-chain, then try again.";
  if (lower.includes("unknown error") || lower.includes("submitTx") || lower.includes("submittx"))
    return "Transaction rejected by the Cardano node. Check that your wallet has enough tADA and try again.";
  if (lower.includes("utxo") || lower.includes("no spendable"))
    return "No spendable UTxOs found. Ensure your Preprod wallet has tADA.";

  return `Transaction failed: ${msg}`;
}
