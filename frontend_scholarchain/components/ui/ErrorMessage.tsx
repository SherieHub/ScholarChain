import { XCircle, RotateCcw } from "lucide-react";

interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

const friendlyErrors: Record<string, string> = {
  "User declined": "You closed the signing window. Click Try Again when ready.",
  "Insufficient funds":
    "Your wallet doesn't have enough tADA. Visit the Cardano Faucet to top up.",
};

function getFriendlyMessage(error: string): string {
  for (const key of Object.keys(friendlyErrors)) {
    if (error.includes(key)) return friendlyErrors[key];
  }
  return error;
}

export default function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-white/[0.03] backdrop-blur-md border border-red-500/25 rounded-2xl p-6 w-full text-center shadow-[0_0_30px_rgba(239,68,68,0.08)]"
    >
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <XCircle className="w-6 h-6 text-red-400" aria-hidden="true" />
        </div>
      </div>

      <h2 className="text-white font-semibold text-lg mb-3">Transaction Failed</h2>

      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-left mb-5">
        <p className="text-slate-300 text-sm font-mono">{getFriendlyMessage(error)}</p>
      </div>

      <button
        onClick={onDismiss}
        className="flex items-center justify-center gap-1.5 mx-auto bg-red-600/80 hover:bg-red-500 text-white text-sm font-medium py-2 px-5 rounded-lg transition-all shadow-[0_0_16px_rgba(239,68,68,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        Try Again
      </button>
    </div>
  );
}
