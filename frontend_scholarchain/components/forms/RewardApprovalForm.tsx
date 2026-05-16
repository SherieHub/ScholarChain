"use client";
import { useState } from "react";

interface RewardApprovalFormProps {
  scholarId: string;
  onApprove: (adaAmount: number, tokenAmount: number) => Promise<void>;
  isProcessing: boolean;
}

export default function RewardApprovalForm({ scholarId: _scholarId, onApprove, isProcessing }: RewardApprovalFormProps) {
  const [ada, setAda] = useState("");
  const [tokens, setTokens] = useState("");

  const isValid = Number(ada) > 0 && Number(tokens) >= 0;

  const handleApprove = async () => {
    if (!isValid) return;
    await onApprove(Number(ada), Number(tokens));
    setAda("");
    setTokens("");
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        step="any"
        value={ada}
        onChange={e => setAda(e.target.value)}
        placeholder="ADA"
        className="w-20 bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
      />
      <input
        type="number"
        min="0"
        step="1"
        value={tokens}
        onChange={e => setTokens(e.target.value)}
        placeholder="SCHL"
        className="w-20 bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors"
      />
      <button
        onClick={handleApprove}
        disabled={!isValid || isProcessing}
        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
      >
        {isProcessing ? "Sending..." : "Approve & Send 🚀"}
      </button>
    </div>
  );
}
