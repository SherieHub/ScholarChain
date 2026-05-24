import { Transaction, ForgeScript } from "@meshsdk/core";
import type { Mint } from "@meshsdk/core";
import { adaToLovelace } from "@/lib/utils/lovelaceConversion";
import { normalizeToB32, getWalletAddressBech32 } from "@/lib/utils/addressUtils";
import { submitTransaction } from "@/lib/mesh/submitTx";
import { filterPendingSpent, markUtxosSpent } from "@/lib/mesh/pendingUtxos";

const SCHOLAR_ASSET_NAME = "SCHOLAR";

export async function sendMultiAssetReward(
  wallet: any,
  recipientAddress: string,
  adaAmount: number,
  tokenAmount: number
): Promise<{ txHash: string; adaSent: number; tokensSent: number }> {
  const lovelace = adaToLovelace(adaAmount);
  const normalizedAddress = normalizeToB32(recipientAddress);

  // Use the wallet's change address for the ForgeScript — same pattern as mintNFT.ts.
  // This ensures the ForgeScript's pubkey hash matches the key the wallet signs with.
  const changeAddress: string =
    typeof wallet.getChangeAddressBech32 === "function"
      ? await wallet.getChangeAddressBech32()
      : await getWalletAddressBech32(wallet);
  if (!changeAddress) throw new Error("Could not resolve wallet address.");

  const forgingScript = ForgeScript.withOneSignature(changeAddress);

  // Mint SCHOLAR tokens directly to the scholar — no pre-minted supply needed.
  // Any admin can do this because minting only requires their own key to sign.
  const asset: Mint = {
    assetName: SCHOLAR_ASSET_NAME,
    assetQuantity: String(tokenAmount),
    recipient: normalizedAddress,
  };

  const tx = new Transaction({ initiator: wallet });
  tx.mintAsset(forgingScript, asset);
  tx.sendLovelace({ address: normalizedAddress }, lovelace);
  tx.setChangeAddress(changeAddress);

  let utxos: any[] = [];
  try {
    const raw: any[] =
      typeof wallet.getUtxosMesh === "function"
        ? await wallet.getUtxosMesh()
        : (await wallet.getUtxos()) ?? [];
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
  return { txHash, adaSent: adaAmount, tokensSent: tokenAmount };
}
