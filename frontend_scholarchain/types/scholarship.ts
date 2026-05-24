import { Timestamp } from "firebase/firestore";

export type ScholarshipStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Paid"
  | "Expired";

export interface Scholarship {
  id?: string;
  scholarId: string;
  walletAddress: string;
  semester: string;         // "1st Sem AY 2025-2026"
  semesterStart: Timestamp;
  semesterEnd: Timestamp;
  status: ScholarshipStatus;
  stipendTxHash?: string;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
