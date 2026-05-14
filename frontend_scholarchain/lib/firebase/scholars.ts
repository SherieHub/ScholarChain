import {
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, serverTimestamp, Timestamp
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