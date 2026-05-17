/**
 * Submits a Cardano transaction via our server-side Blockfrost route.
 *
 * CIP-30 wallet.signTx() returns only the witness set (cbor<transaction_witness_set>),
 * not the full transaction. The server route assembles the full signed transaction from
 * the original unsigned tx (body + aux data) and the witness set before submitting.
 *
 * @param unsignedTx - Full unsigned transaction CBOR hex from tx.build()
 * @param witnessSet - Witness set CBOR hex from wallet.signTx()
 */
export async function submitTransaction(unsignedTx: string, witnessSet: string): Promise<string> {
  const res = await fetch("/api/tx/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ unsignedTx, witnessSet }),
  });

  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));

  if (!res.ok) {
    throw new Error(data.error ?? `Transaction submission failed (HTTP ${res.status})`);
  }

  const txHash = data.txHash;
  if (!txHash || typeof txHash !== "string") {
    throw new Error("Submission succeeded but no txHash was returned.");
  }
  return txHash;
}
