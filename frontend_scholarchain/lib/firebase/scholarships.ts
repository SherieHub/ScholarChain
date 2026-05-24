import {
  collection, addDoc, getDocs, updateDoc, doc,
  query, where, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { Scholarship, ScholarshipStatus } from "@/types";
import { getCurrentSemester } from "@/lib/utils/semesterUtils";

const SCHOLARSHIPS_COLLECTION = "scholarships";

/**
 * Create a scholarship application for the current semester.
 * Guards against duplicates: throws if the wallet already has an application
 * for the same semester.
 */
export async function createScholarship(
  scholarId: string,
  walletAddress: string
): Promise<string> {
  const sem = getCurrentSemester();

  // Duplicate guard — one application per wallet per semester
  const existing = await getScholarshipByWalletAndSemester(
    walletAddress,
    sem.label
  );
  if (existing) {
    throw new Error(
      `You already have a scholarship application for ${sem.label}. ` +
        "Check your Scholar Portal for the current status."
    );
  }

  const docRef = await addDoc(collection(db, SCHOLARSHIPS_COLLECTION), {
    scholarId,
    walletAddress: walletAddress.trim(),
    semester: sem.label,
    semesterStart: Timestamp.fromDate(sem.start),
    semesterEnd: Timestamp.fromDate(sem.end),
    status: "Pending" as ScholarshipStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/** Fetch the scholarship for a wallet address in the current semester. */
export async function getCurrentScholarship(
  walletAddress: string
): Promise<Scholarship | null> {
  const sem = getCurrentSemester();
  return getScholarshipByWalletAndSemester(walletAddress, sem.label);
}

/** Fetch a scholarship by wallet + exact semester label. */
export async function getScholarshipByWalletAndSemester(
  walletAddress: string,
  semesterLabel: string
): Promise<Scholarship | null> {
  const q = query(
    collection(db, SCHOLARSHIPS_COLLECTION),
    where("walletAddress", "==", walletAddress.trim()),
    where("semester", "==", semesterLabel)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Scholarship;
}

/** Fetch all scholarship applications for the current semester (admin view). */
export async function getScholarshipsByCurrentSemester(): Promise<Scholarship[]> {
  const sem = getCurrentSemester();
  const q = query(
    collection(db, SCHOLARSHIPS_COLLECTION),
    where("semester", "==", sem.label)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Scholarship));
}

/** Admin: approve a scholarship application. */
export async function approveScholarship(scholarshipId: string): Promise<void> {
  await updateDoc(doc(db, SCHOLARSHIPS_COLLECTION, scholarshipId), {
    status: "Approved" as ScholarshipStatus,
    updatedAt: serverTimestamp(),
  });
}

/** Admin: reject a scholarship application. */
export async function rejectScholarship(scholarshipId: string): Promise<void> {
  await updateDoc(doc(db, SCHOLARSHIPS_COLLECTION, scholarshipId), {
    status: "Rejected" as ScholarshipStatus,
    updatedAt: serverTimestamp(),
  });
}

/** Admin: mark scholarship as paid after confirmed ADA transaction. */
export async function markScholarshipPaid(
  scholarshipId: string,
  txHash: string
): Promise<void> {
  await updateDoc(doc(db, SCHOLARSHIPS_COLLECTION, scholarshipId), {
    status: "Paid" as ScholarshipStatus,
    stipendTxHash: txHash,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Mark all expired scholarships — called on admin load. */
export async function expireStaleScholarships(): Promise<void> {
  const now = Timestamp.now();
  const q = query(
    collection(db, SCHOLARSHIPS_COLLECTION),
    where("status", "in", ["Pending", "Approved"])
  );
  const snap = await getDocs(q);
  const stale = snap.docs.filter(d => {
    const end: Timestamp = d.data().semesterEnd;
    return end && end.toMillis() < now.toMillis();
  });
  await Promise.all(
    stale.map(d =>
      updateDoc(d.ref, {
        status: "Expired" as ScholarshipStatus,
        updatedAt: serverTimestamp(),
      })
    )
  );
}
