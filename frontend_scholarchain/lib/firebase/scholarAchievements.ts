import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
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
    where("scholarId", "==", scholarId),
    orderBy("submittedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
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
