"use client";

import dynamic from "next/dynamic";
import BackButton from "@/components/ui/BackButton";

const WalletGate = dynamic(() => import("@/components/wallet/WalletGate"), { ssr: false });
const SponsorEntryForm = dynamic(
  () => import("@/components/forms/SponsorEntryForm"),
  { ssr: false }
);

export default function SponsorEntryPage() {
  return (
    <main className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <BackButton href="/" />
        <div>
          <h1 className="text-3xl font-bold mb-1">Sponsor Registration</h1>
          <p className="text-slate-400 text-sm">
            Connect your wallet and send your pledge directly to the scholarship treasury on-chain.
          </p>
        </div>
        <WalletGate
          role="sponsor"
          message="Connect your Cardano wallet to send your pledge. The ADA will be transferred directly to the treasury wallet."
        >
          <SponsorEntryForm />
        </WalletGate>
      </div>
    </main>
  );
}
