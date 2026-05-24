import { getScholarByWalletAddress } from "@/lib/firebase/scholars";
import type { Scholar } from "@/types";

interface MatchedAsset {
  unit: string;
  quantity: string;
  policyId: string;
  assetName: string;
}

// Each mint uses ForgeScript.withOneSignature(changeAddress), so the policyId is
// unique per mint session (the change address rotates after each transaction).
// The global config.nftPolicyId only holds the FIRST mint's policyId and goes stale.
// Fix: look up the scholar's own policyId from their Firestore document instead.
export async function verifyScholarBadge(
  wallet: any,
  walletAddress: string
): Promise<{
  isAuthorized: boolean;
  matchedAsset: MatchedAsset | null;
  scholar: Scholar | null;
}> {
  try {
    const scholar = await getScholarByWalletAddress(walletAddress);

    if (!scholar) return { isAuthorized: false, matchedAsset: null, scholar: null };

    if (scholar.status !== "Approved" || !scholar.policyId || scholar.policyId.trim() === "") {
      return { isAuthorized: false, matchedAsset: null, scholar: null };
    }

    const policyId = scholar.policyId.trim();

    // wallet from useWallet() is MeshCardanoBrowserWallet which has no getAssets().
    // getBalanceMesh() returns Asset[] ({ unit, quantity }) — same underlying data.
    const balance: Array<{ unit: string; quantity: string }> =
      typeof wallet.getBalanceMesh === "function"
        ? await wallet.getBalanceMesh()
        : await wallet.getAssets();

    const match = balance.find((asset) => asset.unit && asset.unit.startsWith(policyId));

    if (match) {
      return {
        isAuthorized: true,
        matchedAsset: {
          unit: match.unit,
          quantity: match.quantity,
          policyId,
          assetName: match.unit.slice(policyId.length),
        },
        scholar,
      };
    }

    return { isAuthorized: false, matchedAsset: null, scholar: null };
  } catch {
    return { isAuthorized: false, matchedAsset: null, scholar: null };
  }
}
