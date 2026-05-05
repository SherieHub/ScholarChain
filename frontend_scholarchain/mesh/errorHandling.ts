export function parseTxError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.toLowerCase().includes("user declined")) return "You cancelled the transaction. Click Try Again when ready.";
  if (msg.toLowerCase().includes("insufficient")) return "Insufficient tADA balance. Please top up from the Cardano Faucet.";
  if (msg.toLowerCase().includes("network")) return "Network error. Check your internet connection and retry.";
  if (msg.toLowerCase().includes("addr_test")) return "Invalid recipient address format. Must start with addr_test1.";
  return `Transaction failed: ${msg}`;
}