import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";
import type { MeshCardanoBrowserWallet } from "@meshsdk/wallet";

const apiKey = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID;

if (!apiKey) {
  throw new Error(
    "Blockfrost API key is not defined in environment variables.",
  );
}

const provider = new BlockfrostProvider(apiKey);

const txBuilder = new MeshTxBuilder({
  fetcher: provider,
  verbose: true,
});

export type Recipient = {
  address: string;
  amount: string;
};

export const sendLovelace = async (
  wallet: MeshCardanoBrowserWallet,
  recipient: Recipient,
): Promise<string> => {
  const utxos = await wallet.getUtxosMesh();
  const changeAddress = await wallet.getChangeAddressBech32();

  const unsignedTx = await txBuilder
    .txOut(recipient.address, [
      { unit: "lovelace", quantity: recipient.amount },
    ])
    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos)
    .complete();

  const signedTx = await wallet.signTxReturnFullTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);

  return txHash;
};