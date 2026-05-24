import {
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, serverTimestamp
} from "firebase/firestore";
import { db } from "./config";
import type { Scholar, ScholarStatus } from "@/types";

const SCHOLARS_COLLECTION = "scholars";

/** Submit a new scholar application with status: Pending */
export async function addScholar(data: Omit<Scholar, "id" | "status" | "createdAt" | "updatedAt">): Promise<string> {
  const docRef = await addDoc(collection(db, SCHOLARS_COLLECTION), {
    ...data,
    status: "Pending" as ScholarStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Fetch all scholars matching a given status */
export async function getScholarsByStatus(status: ScholarStatus): Promise<Scholar[]> {
  const q = query(
    collection(db, SCHOLARS_COLLECTION),
    where("status", "==", status)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Scholar));
}

/** Update a scholar's LastPaidTxHash and paidAt after a successful transaction */
export async function markScholarAsPaid(scholarId: string, txHash: string): Promise<void> {
  const ref = doc(db, SCHOLARS_COLLECTION, scholarId);
  await updateDoc(ref, {
    lastPaidTxHash: txHash,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Update a scholar's status (used in Increment 3 after NFT mint) */
export async function updateScholarStatus(scholarId: string, status: ScholarStatus): Promise<void> {
  const ref = doc(db, SCHOLARS_COLLECTION, scholarId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

/** Returns true if a scholar record already exists for this wallet address. */
export async function scholarWalletExists(walletAddress: string): Promise<boolean> {
  const q = query(
    collection(db, SCHOLARS_COLLECTION),
    where("walletAddress", "==", walletAddress.trim())
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/** Find a scholar by their wallet address (used in Scholar Portal auth) */
export async function getScholarByWalletAddress(walletAddress: string): Promise<Scholar | null> {
  const q = query(
    collection(db, SCHOLARS_COLLECTION),
    where("walletAddress", "==", walletAddress.trim())
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as Scholar;
}

/** Fetch scholars by a list of wallet addresses (parallel batch lookup, max 30 per chunk) */
export async function getScholarsByWalletAddresses(addresses: string[]): Promise<Scholar[]> {
  if (addresses.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < addresses.length; i += 30) {
    chunks.push(addresses.slice(i, i + 30));
  }
  const snapshots = await Promise.all(
    chunks.map(chunk =>
      getDocs(query(collection(db, SCHOLARS_COLLECTION), where("walletAddress", "in", chunk)))
    )
  );
  return snapshots.flatMap(snap => snap.docs.map(d => ({ id: d.id, ...d.data() } as Scholar)));
}

/** Fetch all scholars regardless of status (used in Admin Dashboard table) */
export async function getAllScholars(): Promise<Scholar[]> {
  const snapshot = await getDocs(collection(db, SCHOLARS_COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Scholar));
}

/** Update a scholar's policyId and scholarTokenId after NFT mint, marks status Approved */
export async function updateScholarPolicyId(
  scholarId: string,
  policyId: string,
  scholarTokenId: string
): Promise<void> {
  const ref = doc(db, SCHOLARS_COLLECTION, scholarId);
  await updateDoc(ref, {
    policyId,
    scholarTokenId,
    status: "Approved" as ScholarStatus,
    updatedAt: serverTimestamp(),
  });
}