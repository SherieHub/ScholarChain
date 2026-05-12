"use client";
import { useState } from "react";
import { addScholar } from "@/lib/firebase/scholars";
import { isValidPreprodAddress, shortenAddress } from "@/lib/utils/addressUtils";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ScholarApplicationForm() {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");

  const validate = (): string | null => {
    if (name.trim().length < 3) return "Full name must be at least 3 characters.";
    if (course.trim().length < 2) return "Course / degree program is required.";
    if (!isValidPreprodAddress(walletAddress.trim()))
      return "Wallet address must start with addr_test1 and be at least 50 characters.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");
    setFormState("submitting");
    try {
      await addScholar({ name: name.trim(), course: course.trim(), walletAddress: walletAddress.trim() });
      setSubmittedAddress(walletAddress.trim());
      setFormState("success");
    } catch {
      setFormState("error");
      setErrorMsg("Failed to submit application. Please try again.");
    }
  };

  const reset = () => {
    setName("");
    setCourse("");
    setWalletAddress("");
    setErrorMsg("");
    setFormState("idle");
  };

  if (formState === "success") {
    return (
      <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">🎉</div>
          <div>
            <h3 className="font-semibold text-green-300">Application Submitted!</h3>
            <p className="text-green-400 text-sm">Your application is under review.</p>
          </div>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-4 text-sm space-y-1">
          <p className="text-slate-400">Status: <span className="text-yellow-300 font-medium">Pending</span></p>
          <p className="text-slate-400">Wallet on file: <span className="font-mono text-slate-300">{shortenAddress(submittedAddress)}</span></p>
        </div>
        <button
          onClick={reset}
          className="text-sm text-blue-400 hover:text-blue-300 underline self-start transition-colors"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-5">Scholarship Application</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Juan Dela Cruz"
            className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Course / Degree Program</label>
          <input
            type="text"
            value={course}
            onChange={e => setCourse(e.target.value)}
            placeholder="e.g. BS Computer Science"
            className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Cardano Preprod Wallet Address</label>
          <input
            type="text"
            value={walletAddress}
            onChange={e => setWalletAddress(e.target.value)}
            placeholder="addr_test1..."
            className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
          <p className="text-xs text-slate-500">
            Copy from your Eternl or Nami wallet on Preprod. Starts with <span className="font-mono">addr_test1</span>.
          </p>
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
          {formState === "submitting" ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
