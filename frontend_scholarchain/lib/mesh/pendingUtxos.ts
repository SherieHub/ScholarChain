/**
 * Client-side set of UTxO references that have been submitted in transactions
 * but may not yet appear as spent in wallet.getUtxosMesh().
 *
 * Problem: After submitting transaction A, the wallet's local UTxO cache still
 * lists the consumed inputs as available. If transaction B is built immediately,
 * it selects the same inputs and the node rejects it with "All inputs are spent".
 *
 * Fix: record spent UTxO refs here and filter them out of getUtxosMesh() results.
 * Entries expire after 120 seconds (two Cardano epochs on Preprod) so normal
 * wallet refreshes eventually take over.
 */

interface PendingRef {
  expiresAt: number;
}

const pending = new Map<string, PendingRef>();
const TTL_MS = 120_000;

function key(txHash: string, outputIndex: number): string {
  return `${txHash}#${outputIndex}`;
}

/** Mark UTxOs as spent so getFilteredUtxos() excludes them. */
export function markUtxosSpent(utxos: Array<{ input: { txHash: string; outputIndex: number } }>): void {
  const expiresAt = Date.now() + TTL_MS;
  for (const u of utxos) {
    pending.set(key(u.input.txHash, u.input.outputIndex), { expiresAt });
  }
}

/** Returns wallet UTxOs with any pending-spent entries removed. */
export function filterPendingSpent(
  utxos: Array<{ input: { txHash: string; outputIndex: number } }>
): typeof utxos {
  const now = Date.now();
  // Expire old entries first
  for (const [k, v] of pending) {
    if (v.expiresAt <= now) pending.delete(k);
  }
  return utxos.filter(
    u => !pending.has(key(String(u.input.txHash), Number(u.input.outputIndex)))
  );
}
