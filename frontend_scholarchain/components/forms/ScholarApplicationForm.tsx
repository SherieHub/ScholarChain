'use client';

import React, { useState } from 'react';
// Note: Adjust these import paths based on your actual project structure
import { addScholar } from '@/lib/firebase/scholars';
import { isValidPreprodAddress } from '@/lib/utils/addressUtils'; 

type FormState = "idle" | "submitting" | "success" | "error";

export default function ScholarApplicationForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Form field states
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const truncateAddress = (addr: string) => {
    if (!addr || addr.length < 15) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");

    // 1. Basic Validation
    if (name.length < 3) {
      setErrorMessage("Name must be at least 3 characters long.");
      setFormState("error");
      return;
    }

    if (!isValidPreprodAddress(walletAddress)) {
      setErrorMessage("Please enter a valid Cardano Preprod wallet address.");
      setFormState("error");
      return;
    }

    // 2. Submit to Firebase
    try {
      // The addScholar service handles setting status: "Pending" internally based on your spec
      await addScholar({ name, course, walletAddress });
      setFormState("success");
    } catch (error) {
      console.error("Submission failed:", error);
      setErrorMessage("Failed to submit application. Please try again later.");
      setFormState("error");
    }
  };

  const resetForm = () => {
    setName("");
    setCourse("");
    setWalletAddress("");
    setFormState("idle");
    setErrorMessage("");
  };

  // --- SUCCESS STATE UI ---
  if (formState === "success") {
    return (
      <div className="p-6 max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg text-center shadow-sm">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted! 🎉</h2>
        <p className="text-green-700 mb-4">Your application is under review. Status: <strong>Pending</strong></p>
        <p className="text-sm text-gray-600 mb-6">
          Your wallet address on file: <br/>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{truncateAddress(walletAddress)}</span>
        </p>
        <button 
          onClick={resetForm}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  // --- FORM STATE UI ---
  return (
    <div className="max-w-md mx-auto p-6 bg-black/50 backdrop-blur-md rounded-xl shadow-lg border border-gray-800">
      <h2 className="text-white text-xl font-bold mb-3">Scholar Application</h2>
      
      {formState === "error" && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
          <input
            id="name"
            type="text"
            required
            minLength={3}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-5 px-3 py-2 bg-black/40 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
            placeholder="John Doe"
            disabled={formState === "submitting"}
          />
        </div>

        
        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-300 mb-1">Course / Degree Program</label>
          <input
            id="course"
            type="text"
            required
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full pl-5 px-3 py-2 bg-black/40 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
            placeholder="e.g., BS Computer Science"
            disabled={formState === "submitting"}
          />
        </div>

        
        <div>
          <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300 mb-1">Cardano Preprod Wallet Address</label>
          <input
            id="walletAddress"
            type="text"
            required
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full pl-5 px-3 py-2 bg-black/40 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
            placeholder="addr_test1..."
            disabled={formState === "submitting"}
          />
          <p className="text-xs text-gray-500 mt-2">
            Don't have a Cardano wallet? Install the{' '}
            <a href="https://eternl.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Eternl browser extension
            </a>{' '}
            and switch to Preprod Testnet.
          </p>
        </div>

        
        <button
          type="submit"
          disabled={formState === "submitting"}
          className="w-full bg-indigo-600 text-white font-medium py-2.5 px-4 mt-4 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          {formState === "submitting" ? "Submitting..." : "Apply Now"}
        </button>
      </form>
    </div>
  );
}