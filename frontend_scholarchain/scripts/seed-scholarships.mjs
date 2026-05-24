/**
 * seed-scholarships.mjs
 *
 * Creates the `scholarships` collection in Firestore by writing a placeholder
 * document, then immediately deletes it. Run once to make the collection
 * visible in the Firebase Console.
 *
 * Usage (from frontend_scholarchain/):
 *   node scripts/seed-scholarships.mjs
 *
 * Requires: NEXT_PUBLIC_FIREBASE_* variables in .env.local
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env.local manually (no dotenv dependency needed) ───────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");

try {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    process.env[key] = val;
  }
} catch {
  console.error("Could not read .env.local — make sure you run this from frontend_scholarchain/");
  process.exit(1);
}

// ── Firebase client SDK (ESM) ─────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, deleteDoc, getDocs, query, limit, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

async function run() {
  const col = collection(db, "scholarships");

  // Check if the collection already has documents
  const existing = await getDocs(query(col, limit(1)));
  if (!existing.empty) {
    console.log("✓ `scholarships` collection already exists with", existing.size, "document(s). Nothing to seed.");
    process.exit(0);
  }

  // Write a sentinel document, then delete it to create the collection
  console.log("Creating `scholarships` collection...");
  const ref = await addDoc(col, {
    _seed: true,
    scholarId:     "__seed__",
    walletAddress: "__seed__",
    semester:      "__seed__",
    status:        "Pending",
    createdAt:     serverTimestamp(),
    updatedAt:     serverTimestamp(),
  });
  await deleteDoc(ref);
  console.log("✓ `scholarships` collection created (seed document written and removed).");
  console.log("  → The collection is now visible in the Firebase Console.");
  console.log("  → Remember to deploy Firestore rules and indexes:");
  console.log("       firebase deploy --only firestore");
  process.exit(0);
}

run().catch(err => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
