import { getUniversityConfig } from "@/lib/firebase/config-store";

interface MatchedAsset {
  unit: string;
  quantity: string;
  policyId: string;
  assetName: string;
}

export async function verifyScholarBadge(wallet: any): Promise<{
  isAuthorized: boolean;
  matchedAsset: MatchedAsset | null;
}> {
  let isAuthorized = false; // fail-closed — default deny
  let matchedAsset: MatchedAsset | null = null;

  try {
    const config = await getUniversityConfig();

    // An empty policyId would match every asset in the wallet — deny immediately.
    if (!config.nftPolicyId || config.nftPolicyId.trim() === "") {
      return { isAuthorized: false, matchedAsset: null };
    }

    const assets = await wallet.getAssets();

    const match = assets.find(
      (asset: any) => asset.unit && asset.unit.startsWith(config.nftPolicyId)
    );

    if (match) {
      isAuthorized = true;
      matchedAsset = {
        unit: match.unit,
        quantity: match.quantity,
        policyId: config.nftPolicyId,
        assetName: match.unit.slice(config.nftPolicyId.length),
      };
    }
  } catch {
    isAuthorized = false;
    matchedAsset = null;
  }

  return { isAuthorized, matchedAsset };
}
