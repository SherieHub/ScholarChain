import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { ScholarAchievement } from "@/types/scholarAchievement";

const COL = "scholarAchievements";

export async function addScholarAchievement(
  data: Omit<ScholarAchievement, "id" | "submittedAt" | "status">
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    status: "Pending Review",
    submittedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAchievementsByScholarId(
  scholarId: string
): Promise<ScholarAchievement[]> {
  const q = query(
    collection(db, COL),
    where("scholarId", "==", scholarId)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => {
    const raw = d.data();
    return {
      ...raw,
      id: d.id,
      submittedAt:
        raw.submittedAt instanceof Timestamp
          ? raw.submittedAt.toDate().toISOString()
          : String(raw.submittedAt ?? ""),
    } as ScholarAchievement;
  });
  return docs.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function getAllPendingAchievements(): Promise<ScholarAchievement[]> {
  const q = query(
    collection(db, COL),
    where("status", "==", "Pending Review")
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => {
    const raw = d.data();
    return {
      ...raw,
      id: d.id,
      submittedAt:
        raw.submittedAt instanceof Timestamp
          ? raw.submittedAt.toDate().toISOString()
          : String(raw.submittedAt ?? ""),
    } as ScholarAchievement;
  });
  return docs.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

export async function updateAchievementStatus(
  id: string,
  status: ScholarAchievement["status"],
  adminNote?: string
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    status,
    adminNote: adminNote ?? "",
    reviewedAt: serverTimestamp(),
  });
}

export async function getTotalTokensDistributed(): Promise<number> {
  const q = query(collection(db, COL), where("status", "==", "Approved"));
  const snap = await getDocs(q);
  return snap.docs.reduce((sum, d) => sum + Number(d.data()?.tokensRewarded ?? 0), 0);
}

export async function markAchievementRewarded(
  id: string,
  txHash: string,
  tokensRewarded: number
): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    status: "Approved",
    rewardTxHash: txHash,
    tokensRewarded,
    reviewedAt: serverTimestamp(),
  });
}
