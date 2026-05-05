"use client";

import { useState } from "react";
import { Send } from "lucide-react";

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
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 w-full">
      <h2 className="text-lg font-semibold text-white mb-5">Send Scholarship Payment</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="recipient-address" className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">
            Recipient Wallet Address
          </label>
          <input
            id="recipient-address"
            type="text"
            placeholder="addr_test1..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            autoComplete="off"
            aria-describedby={validationError ? "form-error" : undefined}
            className="w-full bg-white/[0.04] text-white border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/40 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="ada-amount" className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">
            ADA Amount
          </label>
          <input
            id="ada-amount"
            type="number"
            placeholder="e.g. 50"
            min="1"
            step="1"
            value={adaAmount}
            onChange={(e) => setAdaAmount(e.target.value)}
            aria-describedby={validationError ? "form-error" : undefined}
            className="w-full bg-white/[0.04] text-white border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/40 transition-colors"
          />
        </div>

        {validationError && (
          <p id="form-error" role="alert" className="text-red-400 text-xs">
            {validationError}
          </p>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          aria-disabled={isDisabled}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_28px_rgba(59,130,246,0.4)]"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          {isLoading ? "Sending..." : "Send Scholarship"}
        </button>
      </form>
    </div>
  );
}
