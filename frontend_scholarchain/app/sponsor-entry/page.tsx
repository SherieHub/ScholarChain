"use client";

import dynamic from "next/dynamic";
import BackButton from "@/components/ui/BackButton";
import SponsorEntryForm from '@/components/forms/SponsorEntryForm';

export const metadata = {
  title: 'Sponsor Pledge Entry | ScholarChain',
  description: 'Enter new sponsor pledges to fund the scholarship program.',
};

const WalletGate = dynamic(() => import("@/components/wallet/WalletGate"), { ssr: false });
const SponsorEntryForm = dynamic(
  () => import("@/components/forms/SponsorEntryForm"),
  { ssr: false }
);

export default function SponsorEntryPage() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Background glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/8 blur-3xl" />

      <div className="max-w-3xl mx-auto">
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