import React from 'react';
import BackButton from "@/components/ui/BackButton";
import ScholarApplicationForm from '@/components/forms/ScholarApplicationForm';

export const metadata = {
  title: 'Apply for Scholarship',
  description: 'Submit your application for the scholarship program.',
};

export default function ApplyPage() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Background glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/8 blur-3xl" />

      <div className="max-w-3xl mx-auto">
        <BackButton href="/" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-animated mb-4">
            Join the Program
          </h1>
          <div 
            role="alert"
            aria-live="polite"
            className="w-fit mx-auto bg-amber-500/10 border border-amber-500/30 rounded-xl px-7 py-3 text-amber-300 text-sm backdrop-blur-sm"
          >
            <p>Fill out the form below to submit your scholar application. Make</p>
            <p>sure you have your Cardano Preprod wallet address ready.</p>
          </div>
          
        </div>
        
        
        <ScholarApplicationForm/>
      </div>
    </main>
  );
}