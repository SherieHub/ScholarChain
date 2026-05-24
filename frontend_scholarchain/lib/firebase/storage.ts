import { storage } from "./config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateProofFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type))
    return "Only JPG, PNG, WEBP, PDF, DOC, or DOCX files are allowed.";
  if (file.size > MAX_BYTES) return "File must be 10 MB or smaller.";
  return null;
}

export async function uploadAchievementProof(
  scholarId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `achievements/${scholarId}/${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
