'use client';

import React, { useState } from 'react';
import { addSponsor } from '@/lib/firebase/sponsors';

type FormState = "idle" | "submitting" | "success" | "error";

export default function SponsorEntryForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form field states
  const [sponsorName, setSponsorName] = useState("");
  const [pledgeAmount, setPledgeAmount] = useState(""); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");

    // 1. Strict Validation
    const numericAmount = Number(pledgeAmount);

    if (!sponsorName.trim()) {
      setErrorMessage("Sponsor Name is required.");
      setFormState("error");
      return;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Pledge amount must be a positive number greater than 0.");
      setFormState("error");
      return;
    }

    if (!Number.isInteger(numericAmount)) {
      setErrorMessage("Pledge amount must be a whole number (integer).");
      setFormState("error");
      return;
    }

    // 2. Submit to Firebase
    try {
      // CRITICAL: Passing Number(amount) to satisfy Constraint C-07
      await addSponsor({ 
        sponsorName: sponsorName.trim(), 
        pledgedAmount: numericAmount 
      });
      setFormState("success");
    } catch (error) {
      console.error("Submission failed:", error);
      setErrorMessage("Failed to submit pledge. Please try again later.");
      setFormState("error");
    }
  };

  const resetForm = () => {
    setSponsorName("");
    setPledgeAmount("");
    setFormState("idle");
    setErrorMessage("");
  };

  // --- SUCCESS STATE UI ---
  if (formState === "success") {
    return (
      <div className="p-6 max-w-md mx-auto bg-black/50 backdrop-blur-md border border-green-800/50 rounded-lg text-center shadow-lg">
        <h2 className="text-2xl font-bold text-green-400 mb-2">Pledge Confirmed! 🎉</h2>
        <p className="text-gray-300 mb-4">
          Thank you, <strong className="text-white">{sponsorName}</strong>, for your generous support!
        </p>
        <div className="bg-black/40 rounded-lg p-4 mb-4 border border-green-900/50">
          <p className="text-sm text-gray-400 uppercase tracking-wide">Pledged Amount</p>
          <p className="text-3xl font-bold text-green-400">₳ {Number(pledgeAmount).toLocaleString()}</p>
        </div>
        {/* Required Transparency Note */}
        <p className="text-xs text-gray-500 italic mb-6">
          "This pledge amount will appear in the ScholarChain Public Transparency Dashboard."
        </p>
        <button 
          onClick={resetForm}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors"
        >
          Enter Another Pledge
        </button>
      </div>
    );
  }

  // --- FORM STATE UI ---
  return (
    <div className="max-w-md mx-auto p-6 bg-black/50 backdrop-blur-md rounded-xl shadow-lg border border-gray-800">
      <h2 className="text-white text-xl font-bold mb-2">Sponsor Pledge Entry</h2>
      <p className="text-gray-400 text-sm mb-6">
        Register a new sponsor and their committed ADA amount.
      </p>
      
      {formState === "error" && (
        <div className="mb-4 p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-800/50">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sponsor Name */}
        <div>
          <label htmlFor="sponsorName" className="block text-sm font-medium text-gray-300 mb-1">
            Sponsor Name (Individual or Organization)
          </label>
          <input
            id="sponsorName"
            type="text"
            required
            value={sponsorName}
            onChange={(e) => setSponsorName(e.target.value)}
            className="w-full px-3 py-2 bg-black/40 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
            placeholder="e.g., Ada Lovelace Foundation"
            disabled={formState === "submitting"}
          />
        </div>

        {/* Pledge Amount */}
        <div>
          <label htmlFor="pledgeAmount" className="block text-sm font-medium text-gray-300 mb-1">
            Pledge Amount (ADA)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₳</span>
            </div>
            <input
              id="pledgeAmount"
              type="number"
              required
              min="1"
              step="1" // Forces the browser to only allow whole numbers
              value={pledgeAmount}
              onChange={(e) => setPledgeAmount(e.target.value)}
              className="w-full pl-8 px-3 py-2 bg-black/40 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
              placeholder="1000"
              disabled={formState === "submitting"}
            />
          </div>
        </div>

        {/* Note required by constraints */}
        <p className="text-xs text-gray-500 mt-2">
          Note: This pledge amount will appear in the ScholarChain Public Transparency Dashboard.
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formState === "submitting"}
          className="w-full bg-indigo-600 text-white font-medium py-2.5 px-4 mt-4 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          {formState === "submitting" ? "Submitting..." : "Submit Pledge"}
        </button>
      </form>
    </div>
  );
}