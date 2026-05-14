import { Timestamp } from "firebase/firestore";

export type ScholarStatus = "Pending" | "Approved" | "Rejected";
export type RewardStatus = "Pending Review" | "Approved" | "Paid";

export interface Achievement {
  subject: string;
  grade: string;
  proofLink: string;
  rewardStatus: RewardStatus;
  adaRewarded?: number;
  tokensRewarded?: number;
  rewardTxHash?: string;
  submittedAt: Timestamp;
  paidAt?: Timestamp;
}

export interface Scholar {
  id?: string;
  name: string;
  course: string;
  walletAddress: string;
  status: ScholarStatus;
  policyId?: string;
  scholarTokenId?: string;
  achievement?: Achievement;
  lastPaidTxHash?: string;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
