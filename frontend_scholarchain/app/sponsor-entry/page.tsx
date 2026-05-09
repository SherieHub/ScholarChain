import React from 'react';
import BackButton from "@/components/ui/BackButton";
import SponsorEntryForm from '@/components/forms/SponsorEntryForm';

export const metadata = {
  title: 'Sponsor Pledge Entry | ScholarChain',
  description: 'Enter new sponsor pledges to fund the scholarship program.',
};

export default function SponsorEntryPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <BackButton href="/" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Sponsor Registration
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Log official pledges from sponsors. All data is securely recorded for public verification.
          </p>
        </div>
        
        <SponsorEntryForm />
      </div>
    </main>
  );
}