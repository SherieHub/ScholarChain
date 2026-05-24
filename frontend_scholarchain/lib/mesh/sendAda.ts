import { Transaction, BrowserWallet } from "@meshsdk/core";
import { adaToLovelace } from "@/lib/utils/lovelaceConversion";
import { isValidPreprodAddress, normalizeToB32, getWalletAddressBech32 } from "@/lib/utils/addressUtils";
import { submitTransaction } from "@/lib/mesh/submitTx";
import { filterPendingSpent, markUtxosSpent } from "@/lib/mesh/pendingUtxos";

export async function sendADA(
  wallet: any,
  recipientAddress: string,
  adaAmount: string,
): Promise<string> {
  if (!wallet)
    throw new Error("Wallet not connected. Please connect your wallet first.");

  const normalizedAddress = normalizeToB32(recipientAddress);
  if (!isValidPreprodAddress(normalizedAddress)) {
    throw new Error(
      "Invalid recipient address. Preprod addresses must start with 'addr_test1'.",
    );
  }

  const lovelaceAmount = adaToLovelace(adaAmount);

  // Resolve the sender address for change and to bypass broken wallet methods
  const changeAddress = await getWalletAddressBech32(wallet);

  const tx = new Transaction({ initiator: wallet });
  tx.sendLovelace({ address: normalizedAddress }, lovelaceAmount);

  // MeshJS beta workaround: pre-set change address and UTxOs before build()
  // to bypass broken Address.fromString calls. See mintNFT.ts for explanation.
  tx.setChangeAddress(changeAddress);
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
      "No spendable UTxOs found. Please ensure you have tADA in your Preprod wallet."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tx as any).txBuilder.meshTxBuilderBody.extraInputs = utxos;

  const unsignedTx = await tx.build();
  const witnessSet = await wallet.signTx(unsignedTx);
  const txHash = await submitTransaction(unsignedTx, witnessSet);
  markUtxosSpent(utxos);
  return txHash;
}
