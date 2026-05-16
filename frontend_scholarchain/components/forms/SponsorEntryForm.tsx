"use client";
import { useState } from "react";
import { addSponsor } from "@/lib/firebase/sponsors";
import WalletGate from "@/components/wallet/WalletGate";

type FormState = "idle" | "submitting" | "success" | "error";

function SponsorFormInner() {
  const [sponsorName, setSponsorName] = useState("");
  const [amount, setAmount] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [submittedAmount, setSubmittedAmount] = useState(0);

  const validate = (): string | null => {
    if (sponsorName.trim().length < 2) return "Sponsor name must be at least 2 characters.";
    const parsed = Number(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) return "Pledge amount must be a positive number.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");
    setFormState("submitting");
    try {
      await addSponsor({ sponsorName: sponsorName.trim(), pledgedAmount: Number(amount) });
      setSubmittedName(sponsorName.trim());
      setSubmittedAmount(Number(amount));
      setFormState("success");
    } catch {
      setFormState("error");
      setErrorMsg("Failed to register sponsor. Please try again.");
    }
  };

  const reset = () => {
    setSponsorName("");
    setAmount("");
    setErrorMsg("");
    setFormState("idle");
  };

  if (formState === "success") {
    return (
      <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">✅</div>
          <div>
            <h3 className="font-semibold text-green-300">Sponsor Registered!</h3>
            <p className="text-green-400 text-sm">Thank you for your pledge.</p>
          </div>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-4 text-sm space-y-1">
          <p className="text-slate-400">Sponsor: <span className="text-white font-medium">{submittedName}</span></p>
          <p className="text-slate-400">Pledge: <span className="text-green-300 font-medium">{submittedAmount} ADA</span></p>
        </div>
        <button
          onClick={reset}
          className="text-sm text-blue-400 hover:text-blue-300 underline self-start transition-colors"
        >
          Register another sponsor
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-5">Sponsor Registration</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Sponsor Name</label>
          <input
            type="text"
            value={sponsorName}
            onChange={e => setSponsorName(e.target.value)}
            placeholder="e.g. Acme Corporation"
            className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Pledge Amount (ADA)</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 pr-16 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
              ADA
            </span>
          </div>
          <p className="text-xs text-slate-500">Enter the amount in ADA you intend to contribute.</p>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-2.5">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={formState === "submitting"}
          className="mt-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-60 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors"
        >
          {formState === "submitting" ? "Registering..." : "Register as Sponsor"}
        </button>
      </form>
    </div>
  );
}

export default function SponsorEntryForm() {
  return (
    <WalletGate message="Connect your Cardano wallet to register as a sponsor.">
      <SponsorFormInner />
    </WalletGate>
  );
}
