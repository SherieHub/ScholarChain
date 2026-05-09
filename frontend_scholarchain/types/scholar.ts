import { Timestamp } from "firebase/firestore";

export type ScholarStatus = "Pending" | "Approved" | "Rejected";

export interface Scholar {
  id?: string;            // Firestore auto-ID (added after fetch)
  name: string;
  course: string;
  walletAddress: string;
  status: ScholarStatus;
  policyId?: string;      // Populated in Increment 3
  lastPaidTxHash?: string;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}