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
    console.debug("[verifyScholarBadge] walletAddress:", walletAddress);

    const scholar = await getScholarByWalletAddress(walletAddress);
    console.debug("[verifyScholarBadge] scholar from Firestore:", scholar);

    // No matching scholar record → deny
    if (!scholar) return { isAuthorized: false, matchedAsset: null, scholar: null };

    // Scholar not yet approved or NFT not yet minted → deny
    if (scholar.status !== "Approved" || !scholar.policyId || scholar.policyId.trim() === "") {
      console.debug("[verifyScholarBadge] denied — status:", scholar.status, "policyId:", scholar.policyId);
      return { isAuthorized: false, matchedAsset: null, scholar: null };
    }

    const policyId = scholar.policyId.trim();
    console.debug("[verifyScholarBadge] checking policyId:", policyId);

    // wallet from useWallet() is MeshCardanoBrowserWallet which has no getAssets().
    // getBalanceMesh() returns Asset[] ({ unit, quantity }) — same underlying data.
    const balance: Array<{ unit: string; quantity: string }> =
      typeof wallet.getBalanceMesh === "function"
        ? await wallet.getBalanceMesh()
        : await wallet.getAssets();

    console.debug("[verifyScholarBadge] wallet balance assets:", balance);

    const match = balance.find(
      (asset) => asset.unit && asset.unit.startsWith(policyId)
    );

    console.debug("[verifyScholarBadge] matched asset:", match ?? "none");

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
  } catch (err) {
    console.error("[verifyScholarBadge] error:", err);
    return { isAuthorized: false, matchedAsset: null, scholar: null };
  }
}
