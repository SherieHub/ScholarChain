import { Transaction, ForgeScript, resolveScriptHash } from "@meshsdk/core";
import type { Mint } from "@meshsdk/core";
import { buildScholarBadgeMetadata, generateAssetName } from "@/lib/utils/metadataBuilder";
import { getWalletAddressBech32, normalizeToB32 } from "@/lib/utils/addressUtils";
import { submitTransaction } from "@/lib/mesh/submitTx";
import { filterPendingSpent, markUtxosSpent } from "@/lib/mesh/pendingUtxos";
import type { Scholar } from "@/types";

export async function mintScholarNFT(
  wallet: any,
  scholar: Scholar,
  badgeIPFSUri: string
): Promise<{ txHash: string; policyId: string; assetName: string }> {
  if (!wallet) throw new Error("Wallet not connected.");
  if (!scholar.id) throw new Error("Scholar record is missing an ID.");
  if (!badgeIPFSUri || badgeIPFSUri.trim() === "") {
    throw new Error(
      "Badge IPFS URI is not configured. Upload a badge image to Pinata and set badgeIPFSUri in the Firestore config document."
    );
  }

  // Use the wallet's CHANGE address for the ForgeScript policy.
  // getWalletAddressBech32() returns getUsedAddressesBech32()[0] (a historical receive
  // address). When the node validates the native script, it looks for a vkeywitness
  // whose key hash matches the ScriptPubkey in the ForgeScript. Eternl signs with its
  // currently-active key (the change key), not historical receive keys — so we must
  // build the ForgeScript from the change address to guarantee the witness matches.
  const address: string = typeof wallet.getChangeAddressBech32 === "function"
    ? await wallet.getChangeAddressBech32()
    : await getWalletAddressBech32(wallet);
  if (!address) throw new Error("Could not resolve wallet address.");

  const forgingScript = ForgeScript.withOneSignature(address);
  const policyId = resolveScriptHash(forgingScript);

  const assetName = generateAssetName(scholar.name);

  // Build the Mint object WITHOUT metadata/label so MeshJS does not wrap the
  // metadata internally. We set the CIP-25 structure manually below via
  // tx.setMetadata, which avoids the double-wrapping that mintAsset introduces.
  const asset: Mint = {
    assetName,
    assetQuantity: "1",
    recipient: normalizeToB32(scholar.walletAddress),
  };

  const tx = new Transaction({ initiator: wallet });
  tx.mintAsset(forgingScript, asset);

  // CIP-25 metadata: { 721: { version:1, <policyId>: { <assetName>: { ... } } } }
  // Setting version and properties at the same level as policyId.
  tx.setMetadata(721, {
    version: 1,
    [policyId]: {
      [assetName]: buildScholarBadgeMetadata(scholar.name, scholar.course, badgeIPFSUri),
    },
  });

  // ── MeshJS beta workaround ────────────────────────────────────────────────
  // Transaction.build() calls getChangeAddress() and selectUtxosFrom() on the
  // initiator wallet. Both paths internally call Address.fromString() from
  // @meshsdk/core-cst which returns null for both hex and bech32 inputs in
  // this beta, triggering a TypeError inside the transaction builder.
  //
  // Fix: pre-set the change address and extraInputs before build() runs.
  // Transaction.addChangeAddress() and addTxInputsAsNeeded() both check
  // whether these are already set and skip the broken calls when they are.
  tx.setChangeAddress(address);

  // wallet.getUtxos() uses getUsedUTxOs() → deserializeTxUnspentOutput() on
  // raw CBOR bytes → fromTxUnspentOutput() which in this beta does not call
  // .toString() on the transactionId() result. Guard the fetch and filter to
  // only entries that have a plain-string txHash and a defined output address,
  // which is what the coin selection algorithm (meshUtxoToCSDKUtxo) requires.
  // wallet.getUtxos() (CIP-30 pass-through) returns raw CBOR hex strings.
  // wallet.getUtxosMesh() deserializes them into { input, output } objects.
  let utxos: any[] = [];
  try {
    const raw: any[] = typeof wallet.getUtxosMesh === "function"
      ? await wallet.getUtxosMesh()
      : await wallet.getUtxos() ?? [];
    utxos = filterPendingSpent(
      raw
        .filter(
          (u: any) =>
            u != null &&
            u.input != null &&
            u.input.txHash != null &&
            u.output != null &&
            u.output.address
        )
        .map((u: any) => ({
          ...u,
          input: { ...u.input, txHash: String(u.input.txHash) },
        }))
    );
  } catch {
    throw new Error(
      "Failed to read wallet UTxOs. Ensure your wallet is connected and has tADA on Preprod Testnet."
    );
  }
  if (utxos.length === 0) {
    throw new Error(
      "No spendable UTxOs found. Please ensure you have tADA in your Preprod wallet before minting."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tx as any).txBuilder.meshTxBuilderBody.extraInputs = utxos;
  // ─────────────────────────────────────────────────────────────────────────

  const unsignedTx = await tx.build();
  // wallet.signTx() per CIP-30 spec returns cbor<transaction_witness_set>, not the
  // full transaction. submitTransaction() assembles [body, witnessSet, auxData] server-side.
  const witnessSet = await wallet.signTx(unsignedTx);
  const txHash = await submitTransaction(unsignedTx, witnessSet);
  markUtxosSpent(utxos);
  return { txHash, policyId, assetName };
}
