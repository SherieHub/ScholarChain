import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

export interface UniversityConfig {
  badgeIPFSUri: string;
  nftPolicyId: string;
  tokenPolicyId: string;
  adminWalletAddresses: string[];
  scholarTokenTotalSupply: number;
}

const CONFIG_DOC = doc(db, "config", "config");

export async function getUniversityConfig(): Promise<UniversityConfig> {
  const snap = await getDoc(CONFIG_DOC);
  if (!snap.exists()) throw new Error("University config not found in Firestore.");
  return snap.data() as UniversityConfig;
}

export async function updateNftPolicyId(policyId: string): Promise<void> {
  await updateDoc(CONFIG_DOC, { nftPolicyId: policyId });
}

export async function updateTokenPolicyId(policyId: string, totalSupply: number): Promise<void> {
  await updateDoc(CONFIG_DOC, { tokenPolicyId: policyId, scholarTokenTotalSupply: totalSupply });
}
