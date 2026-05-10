import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "./config";
import type { Sponsor } from "@/types";

const SPONSORS_COLLECTION = "sponsors";

export async function addSponsor(data: Omit<Sponsor, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, SPONSORS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllSponsors(): Promise<Sponsor[]> {
  const snapshot = await getDocs(collection(db, SPONSORS_COLLECTION));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Sponsor));
}

/** Returns the sum of all sponsor pledgedAmount values (used in Inc 5) */
export async function getTotalPledgedADA(): Promise<number> {
  const sponsors = await getAllSponsors();
  return sponsors.reduce((sum, s) => sum + s.pledgedAmount, 0);
}