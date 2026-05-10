import { Timestamp } from "firebase/firestore";

export interface Sponsor {
  id?: string;
  sponsorName: string;
  pledgedAmount: number;
  createdAt: Timestamp;
}