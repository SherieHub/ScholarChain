"use client";

import { useState } from "react";

interface SendScholarshipFormProps {
  onSubmit: (recipientAddress: string, adaAmount: number) => Promise<void>;
  isLoading: boolean;
  isConnected: boolean;
}

export default function SendScholarshipForm({
  onSubmit,
  isLoading,
  isConnected,
}: SendScholarshipFormProps) {
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [adaAmount, setAdaAmount] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  const validate = (): boolean => {
    if (!recipientAddress.startsWith("addr_test")) {
      setValidationError("Address must start with addr_test (Preprod format).");
      return false;
    }
    if (!adaAmount || Number(adaAmount) <= 0 || !Number.isInteger(Number(adaAmount))) {
      setValidationError("ADA amount must be a positive whole number.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(recipientAddress, Number(adaAmount));
  };

  const isDisabled = isLoading || !isConnected || !recipientAddress || !adaAmount;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full mx-auto">
      <h2 className="text-xl font-semibold text-white mb-5">Send Scholarship Payment</h2>

      {!isConnected && (
        <p className="text-yellow-400 text-sm mb-4">
          Please connect your wallet to send scholarships.
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Recipient Wallet Address</label>
          <input
            type="text"
            placeholder="addr_test1..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">ADA Amount</label>
          <input
            type="number"
            placeholder="e.g. 50"
            min="1"
            step="1"
            value={adaAmount}
            onChange={(e) => setAdaAmount(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {validationError && (
          <p className="text-red-400 text-xs">{validationError}</p>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          className="bg-brand hover:bg-brand-dark text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Scholarship →"}
        </button>
      </form>
    </div>
  );
}