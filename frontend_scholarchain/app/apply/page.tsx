"use client";

import dynamic from "next/dynamic";
import BackButton from "@/components/ui/BackButton";

const WalletGate = dynamic(() => import("@/components/wallet/WalletGate"), { ssr: false });
const ScholarApplicationForm = dynamic(
  () => import("@/components/forms/ScholarApplicationForm"),
  { ssr: false }
);

export default function ApplyPage() {
  return (
    <main className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <BackButton href="/" />
        <WalletGate
          role="applicant"
          message="Connect your Cardano wallet to apply. Your wallet address will be auto-filled and verified with a signature."
        >
          <div>
            <h1 className="text-3xl font-bold mb-1">Apply for Scholarship</h1>
            <p className="text-slate-400 text-sm">
              Connect your wallet to apply. Your address is auto-filled and verified with a signature.
            </p>
          </div>
          <ScholarApplicationForm />
        </WalletGate>
      </div>
    </main>
  );
}
