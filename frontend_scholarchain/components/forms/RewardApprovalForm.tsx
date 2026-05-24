"use client";
import { useState } from "react";

interface RewardApprovalFormProps {
  scholarId: string;
  onApprove: (tokenAmount: number) => Promise<void>;
  isProcessing: boolean;
}

export default function RewardApprovalForm({ scholarId: _scholarId, onApprove, isProcessing }: RewardApprovalFormProps) {
  const [tokens, setTokens] = useState("");

  const isValid = Number(tokens) > 0;

  const handleApprove = async () => {
    if (!isValid) return;
    await onApprove(Number(tokens));
    setTokens("");
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        step="1"
        value={tokens}
        onChange={e => setTokens(e.target.value)}
        placeholder="SCHL tokens"
        className="w-28 bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60 transition-colors"
      />
      <button
        onClick={handleApprove}
        disabled={!isValid || isProcessing}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
      >
        {isProcessing ? (
          <>
            <div className="h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Sending…
          </>
        ) : (
          "Send Tokens ✦"
        )}
      </button>
    </div>
  );
}
