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
    walletAddress: data.walletAddress.trim(),
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