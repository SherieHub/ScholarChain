import { Transaction } from "@meshsdk/core";
import { getUniversityConfig } from "@/lib/firebase/config-store";
import { normalizeToB32, getWalletAddressBech32 } from "@/lib/utils/addressUtils";
import { submitTransaction } from "@/lib/mesh/submitTx";
import { filterPendingSpent, markUtxosSpent } from "@/lib/mesh/pendingUtxos";

// Cardano native-token unit = policyId + hex(assetName).
// "SCHOLAR" → 5343484f4c4152
const SCHOLAR_ASSET_NAME_HEX = "5343484f4c4152";

// Cardano requires a minimum ADA amount alongside any native token output.
// 2 ADA satisfies the minimum UTxO rule on Preprod. This is not a reward —
// it is a protocol requirement and is not configurable by the admin.
const MIN_UTxO_LOVELACE = "2000000";

export async function sendTokenReward(
  wallet: any,
  recipientAddress: string,
  tokenAmount: number
): Promise<{ txHash: string; tokensSent: number }> {
  const config = await getUniversityConfig();

  if (!config.tokenPolicyId) {
    throw new Error("SCHOLAR token has not been minted yet. Mint the token supply first.");
  }

  // Unit format: policyId + hex(assetName) — required by Cardano ledger and MeshJS
  const tokenUnit = `${config.tokenPolicyId}${SCHOLAR_ASSET_NAME_HEX}`;
  const normalizedAddress = normalizeToB32(recipientAddress);
  const changeAddress = await getWalletAddressBech32(wallet);

  const tx = new Transaction({ initiator: wallet });
  tx.sendAssets({ address: normalizedAddress }, [
    { unit: "lovelace", quantity: MIN_UTxO_LOVELACE },
    { unit: tokenUnit, quantity: String(tokenAmount) },
  ]);

  // MeshJS beta workaround: pre-set change address and UTxOs before build()
  // to bypass broken Address.fromString. See mintNFT.ts for explanation.
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
  return { txHash, tokensSent: tokenAmount };
}
