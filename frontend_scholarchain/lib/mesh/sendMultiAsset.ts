import { Transaction } from "@meshsdk/core";
import { getUniversityConfig } from "@/lib/firebase/config-store";
import { adaToLovelace } from "@/lib/utils/lovelaceConversion";

export async function sendMultiAssetReward(
  wallet: any,
  recipientAddress: string,
  adaAmount: number,
  tokenAmount: number
): Promise<{ txHash: string; adaSent: number; tokensSent: number }> {
  const config = await getUniversityConfig();

  if (!config.tokenPolicyId) {
    throw new Error("SCHOLAR token has not been minted yet. Mint the token supply first.");
  }

  const lovelace = adaToLovelace(adaAmount);
  const tokenUnit = `${config.tokenPolicyId}SCHOLAR`;

  const tx = new Transaction({ initiator: wallet });
  tx.sendAssets({ address: recipientAddress }, [
    { unit: "lovelace", quantity: lovelace },
    { unit: tokenUnit, quantity: String(tokenAmount) },
  ]);

  const unsignedTx = await tx.build();
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);

  return { txHash, adaSent: adaAmount, tokensSent: tokenAmount };
}
