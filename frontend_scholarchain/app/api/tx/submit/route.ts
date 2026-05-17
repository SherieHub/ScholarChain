import { NextRequest, NextResponse } from "next/server";
import { decode as cborDecode, encode as cborEncode } from "cbor";

const BLOCKFROST_URL = "https://cardano-preprod.blockfrost.io/api/v0/tx/submit";

/**
 * CIP-30 wallet.signTx() returns cbor<transaction_witness_set>, NOT cbor<transaction>.
 * This assembles the full signed transaction from the unsigned transaction (which
 * carries the body and auxiliary data) and the witness set returned by the wallet.
 */
function assembleSignedTx(unsignedTxHex: string, witnessSetHex: string): ArrayBuffer {
  const unsignedDecoded = cborDecode(Buffer.from(unsignedTxHex, "hex")) as unknown[];
  if (!Array.isArray(unsignedDecoded) || unsignedDecoded.length < 3) {
    throw new Error("Unsigned transaction is not a valid CBOR array");
  }

  // The unsigned tx's witness set (element [1]) already contains the native scripts
  // that MeshJS placed there via mintingScript(). The wallet's witness set only has
  // the vkey signature (key 0). We must MERGE, not replace, so the native script
  // (key 1) is preserved — otherwise the node throws MissingScriptWitnessesUTXOW.
  const originalWitnessSet = unsignedDecoded[1];
  const walletWitnessSet = cborDecode(Buffer.from(witnessSetHex, "hex"));

  // Both are CBOR maps decoded as JS Map objects with integer keys.
  // Cardano witness set integer keys: 0=vkeys, 1=native scripts, 2=bootstrap, 3=plutus_v1 …
  const merged = new Map(originalWitnessSet instanceof Map ? originalWitnessSet : []);
  if (walletWitnessSet instanceof Map) {
    for (const [k, v] of walletWitnessSet as Map<unknown, unknown>) {
      merged.set(k, v); // wallet entries take precedence (they have the real vkeys)
    }
  }

  const reassembled = [unsignedDecoded[0], merged, ...unsignedDecoded.slice(2)];
  const encoded: Buffer = cborEncode(reassembled);
  const arrayBuf = new ArrayBuffer(encoded.length);
  new Uint8Array(arrayBuf).set(encoded);
  return arrayBuf;
}

export async function POST(req: NextRequest) {
  const projectId = process.env.BLOCKFROST_PROJECT_ID;
  if (!projectId) {
    return NextResponse.json({ error: "BLOCKFROST_PROJECT_ID is not configured." }, { status: 500 });
  }

  let unsignedTxHex: string;
  let witnessSetHex: string;
  try {
    const body = await req.json();
    unsignedTxHex = body.unsignedTx;
    witnessSetHex = body.witnessSet;
    if (!unsignedTxHex || !witnessSetHex) throw new Error("missing fields");
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON { unsignedTx: '<hex>', witnessSet: '<hex>' }" },
      { status: 400 }
    );
  }

  let txBuffer: ArrayBuffer;
  try {
    txBuffer = assembleSignedTx(unsignedTxHex, witnessSetHex);
    const view = new Uint8Array(txBuffer);
    console.log(`[/api/tx/submit] assembled tx first byte: 0x${view[0].toString(16).padStart(2, "0")}, size: ${txBuffer.byteLength} bytes`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/tx/submit] assembly failed:", msg);
    return NextResponse.json({ error: `Failed to assemble transaction: ${msg}` }, { status: 400 });
  }

  const res = await fetch(BLOCKFROST_URL, {
    method: "POST",
    headers: { "project_id": projectId, "Content-Type": "application/cbor" },
    body: txBuffer,
  });

  if (res.ok) {
    const txHash = await res.json().catch(() => res.text());
    return NextResponse.json({ txHash });
  }

  const errorBody = await res.text().catch(() => res.statusText);
  console.error(`[/api/tx/submit] Blockfrost HTTP ${res.status}:`, errorBody);
  return NextResponse.json(
    { error: `Cardano node rejected the transaction (HTTP ${res.status}): ${errorBody}` },
    { status: res.status }
  );
}
