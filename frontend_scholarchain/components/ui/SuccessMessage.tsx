"use client";

import { CheckCircle, Copy, ArrowRight } from "lucide-react";

interface SuccessMessageProps {
  txHash: string;
  onReset: () => void;
}

export default function SuccessMessage({ txHash, onReset }: SuccessMessageProps) {
  const cardanoscanUrl = "https://preprod.cardanoscan.io/transaction/" + txHash;

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-white/[0.03] backdrop-blur-md border border-emerald-500/25 rounded-2xl p-6 w-full text-center shadow-[0_0_30px_rgba(16,185,129,0.08)]"
    >
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <CheckCircle className="w-6 h-6 text-emerald-400" aria-hidden="true" />
        </div>
      </div>

      <h2 className="text-white font-semibold text-lg mb-1">
        Scholarship Sent Successfully!
      </h2>
      <p className="text-slate-500 text-xs mb-4">Transaction confirmed on Cardano Preprod</p>

      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 mb-4 text-left">
        <p className="text-slate-500 text-xs mb-2 uppercase tracking-wide">Transaction Hash</p>
        <p className="font-mono text-xs text-slate-400 break-all mb-2">{txHash}</p>
        <a
          href={cardanoscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View transaction on Cardanoscan (opens in new tab)"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-400/40 rounded-lg px-3 py-1.5 transition-all duration-150"
        >
          View on Cardanoscan
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <button
          onClick={handleCopy}
          aria-label="Copy transaction hash to clipboard"
          className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] rounded-lg px-3 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          Copy TxHash
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-5 rounded-lg transition-all shadow-[0_0_16px_rgba(59,130,246,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Send Another
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
