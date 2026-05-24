/**
 * Firestore Test Data Seeder — Increment 2
 * Task J2-01 (Jamiel)
 *
 * Seeds the `scholars` (4 docs) and `sponsors` (2 docs) collections with
 * realistic test data so the Admin Dashboard and QA tests have data to work
 * with immediately — without waiting for form submissions.
 *
 * Usage:
 *   node --env-file=.env.local --import tsx/esm scripts/seed-firestore.ts
 *
 * Requires Node 20+ for --env-file support. Alternatively:
 *   export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/seed-firestore.ts
 *
 * ⚠️  Replace the placeholder wallet addresses below with real Preprod
 *     addresses from your team's test wallets before running TXF-01–TXF-07.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error("❌ Missing Firebase env vars. Ensure .env.local is loaded.");
  process.exit(1);
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Replace PLACEHOLDER addresses with real Preprod wallet addresses (addr_test1...)
const SCHOLARS_TO_SEED = [
  {
    name: "Maria Santos",
    course: "BS Computer Science",
    walletAddress: "addr_test1PLACEHOLDER_approved_scholar_1_replace_with_real_addr",
    status: "Approved",
  },
  {
    name: "Juan dela Cruz",
    course: "BS Information Technology",
    walletAddress: "addr_test1PLACEHOLDER_approved_scholar_2_replace_with_real_addr",
    status: "Approved",
  },
  {
    name: "Ana Reyes",
    course: "BS Education",
    walletAddress: "addr_test1PLACEHOLDER_pending_scholar_3_replace_with_real_addr",
    status: "Pending",
  },
  {
    name: "Carlos Mendoza",
    course: "BS Nursing",
    walletAddress: "addr_test1PLACEHOLDER_rejected_scholar_4_replace_with_real_addr",
    status: "Rejected",
  },
];

const SPONSORS_TO_SEED = [
  { sponsorName: "Cebu Pacific Foundation", pledgedAmount: 5000 },
  { sponsorName: "SM Foundation", pledgedAmount: 3000 },
];

async function seed() {
  console.log(`Seeding Firestore project: ${firebaseConfig.projectId}\n`);

  const scholarIds: Record<string, string> = {};
  for (const scholar of SCHOLARS_TO_SEED) {
    const ref = await addDoc(collection(db, "scholars"), {
      ...scholar,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    scholarIds[scholar.name] = ref.id;
    console.log(`✓ Scholar [${scholar.status.padEnd(8)}] ${scholar.name.padEnd(20)} — ID: ${ref.id}`);
  }

  console.log();

  for (const sponsor of SPONSORS_TO_SEED) {
    const ref = await addDoc(collection(db, "sponsors"), {
      ...sponsor,
      createdAt: serverTimestamp(),
    });
    console.log(`✓ Sponsor: ${sponsor.sponsorName.padEnd(30)} (₳${sponsor.pledgedAmount}) — ID: ${ref.id}`);
  }

  console.log("\n✅ Seeding complete.");
  console.log("   Record the IDs above in docs/increment-2-test-data.md.");
  console.log("   Replace PLACEHOLDER addresses with real Preprod wallet addresses.");
  process.exit(0);
}

seed().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`\n❌ Seed failed: ${msg}`);
  process.exit(1);
});
