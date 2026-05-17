import { Transaction, ForgeScript, resolveScriptHash } from "@meshsdk/core";
import type { Mint } from "@meshsdk/core";
import { getWalletAddressBech32 } from "@/lib/utils/addressUtils";

const TOKEN_NAME = "SCHOLAR";

export async function mintTokenSupply(
  wallet: any,
  supplyAmount: number
): Promise<{ txHash: string; policyId: string; tokenName: string; supplyMinted: number }> {
  const address = await getWalletAddressBech32(wallet);

  const forgingScript = ForgeScript.withOneSignature(address);
  const policyId = resolveScriptHash(forgingScript);

  const asset: Mint = {
    assetName: TOKEN_NAME,
    assetQuantity: String(supplyAmount),
    metadata: {
      [policyId]: {
        [TOKEN_NAME]: {
          name: "SCHOLAR Token",
          description: "ScholarChain incentive token awarded for academic achievements.",
          ticker: "SCHOLAR",
          decimals: 0,
        },
      },
    },
    label: "20",
    recipient: address,
  };

  const tx = new Transaction({ initiator: wallet });
  tx.mintAsset(forgingScript, asset);

  const unsignedTx = await tx.build();
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);

  return { txHash, policyId, tokenName: TOKEN_NAME, supplyMinted: supplyAmount };
}
