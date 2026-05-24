import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./config";

export interface UniversityConfig {
  badgeIPFSUri: string;
  nftPolicyId: string;
  tokenPolicyId: string;
  adminWalletAddresses: string[];
  scholarTokenTotalSupply?: number;
}

const CONFIG_DOC = doc(db, "config", "config");

// In-memory cache — avoids a Firestore read on every component mount.
// Invalidated after 60 s or whenever a write occurs.
let _configCache: UniversityConfig | null = null;
let _configCacheAt = 0;
const CONFIG_TTL_MS = 60_000;

export async function getUniversityConfig(): Promise<UniversityConfig> {
  const now = Date.now();
  if (_configCache && now - _configCacheAt < CONFIG_TTL_MS) return _configCache;
  const snap = await getDoc(CONFIG_DOC);
  if (!snap.exists()) throw new Error("University config not found in Firestore.");
  _configCache = snap.data() as UniversityConfig;
  _configCacheAt = now;
  return _configCache;
}

function invalidateConfigCache() {
  _configCache = null;
  _configCacheAt = 0;
}

export async function updateNftPolicyId(policyId: string): Promise<void> {
  await updateDoc(CONFIG_DOC, { nftPolicyId: policyId });
  invalidateConfigCache();
}

export async function updateTokenPolicyId(policyId: string, totalSupply: number): Promise<void> {
  await updateDoc(CONFIG_DOC, { tokenPolicyId: policyId, scholarTokenTotalSupply: totalSupply });
  invalidateConfigCache();
}
