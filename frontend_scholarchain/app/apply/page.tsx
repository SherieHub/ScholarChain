import React from 'react';
import BackButton from "@/components/ui/BackButton";
import ScholarApplicationForm from '@/components/forms/ScholarApplicationForm';

export const metadata = {
  title: 'Apply for Scholarship',
  description: 'Submit your application for the scholarship program.',
};

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <BackButton href="/" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Join the Program
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Fill out the form below to submit your scholar application. Make sure you have your Cardano Preprod wallet address ready.
          </p>
        </div>
        
        
        <ScholarApplicationForm/>
      </div>
    </main>
  );
}