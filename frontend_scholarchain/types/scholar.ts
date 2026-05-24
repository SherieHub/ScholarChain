import { Timestamp } from "firebase/firestore";

export type ScholarStatus = "Pending" | "Approved" | "Rejected";

export interface Scholar {
  id?: string;
  name: string;
  course: string;
  walletAddress: string;
  status: ScholarStatus;
  policyId?: string;
  scholarTokenId?: string;
  lastPaidTxHash?: string;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
