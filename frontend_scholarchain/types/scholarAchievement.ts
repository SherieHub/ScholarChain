export type AchievementType =
  | "Competition"
  | "Certification"
  | "Leadership"
  | "Community Service"
  | "Academic Award"
  | "Seminar & Training"
  | "Research"
  | "Sports"
  | "Arts & Culture";

export type AchievementStatus = "Pending Review" | "Approved" | "Rejected";

export interface ScholarAchievement {
  id?: string;
  scholarId: string;
  achievementName: string;
  achievementType: AchievementType;
  issuingOrganization: string;
  dateAchieved: string; // ISO date string YYYY-MM-DD
  proofLink: string;
  proofFileName?: string;
  status: AchievementStatus;
  submittedAt: string; // ISO timestamp
  reviewedAt?: string;
  adminNote?: string;
}
