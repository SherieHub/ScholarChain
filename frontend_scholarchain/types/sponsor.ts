import { Timestamp } from "firebase/firestore";

export interface Sponsor {
  id?: string;
  sponsorName: string;
  walletAddress: string;
  pledgedAmount: number;
  txHash: string;
  createdAt: Timestamp;
}
