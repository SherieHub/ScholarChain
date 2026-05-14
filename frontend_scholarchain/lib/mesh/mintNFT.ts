import { Transaction, ForgeScript, resolveScriptHash } from "@meshsdk/core";
import type { Mint } from "@meshsdk/core";
import { buildScholarBadgeMetadata, generateAssetName } from "@/lib/utils/metadataBuilder";
import type { Scholar } from "@/types";

export async function mintScholarNFT(
  wallet: any,
  scholar: Scholar,
  badgeIPFSUri: string
): Promise<{ txHash: string; policyId: string; assetName: string }> {
  const usedAddresses = await wallet.getUsedAddresses();
  const address =
    usedAddresses.length > 0 ? usedAddresses[0] : await wallet.getChangeAddress();

  const forgingScript = ForgeScript.withOneSignature(address);
  const policyId = resolveScriptHash(forgingScript);

  const assetName = generateAssetName(scholar.name);
  const metadata = buildScholarBadgeMetadata(
    policyId,
    assetName,
    scholar.name,
    scholar.course,
    badgeIPFSUri
  );

  const asset: Mint = {
    assetName,
    assetQuantity: "1",
    metadata,
    label: "721",
    recipient: scholar.walletAddress,
  };

  const tx = new Transaction({ initiator: wallet });
  tx.mintAsset(forgingScript, asset);

  const unsignedTx = await tx.build();
  const signedTx = await wallet.signTx(unsignedTx);
  const txHash = await wallet.submitTx(signedTx);

  return { txHash, policyId, assetName };
}
