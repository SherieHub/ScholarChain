"use client";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@meshsdk/react";
import { addScholar } from "@/lib/firebase/scholars";
import { isValidPreprodAddress, shortenAddress, getWalletAddressBech32 } from "@/lib/utils/addressUtils";

function toHex(text: string): string {
  return Array.from(new TextEncoder().encode(text))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

type FormState = "idle" | "submitting" | "success" | "error";

function ApplicationFormInner() {
  const { wallet, name: walletName } = useWallet();
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [addressChanged, setAddressChanged] = useState(false);

  // Track the address that was active when the user started filling the form
  const lockedAddressRef = useRef<string>("");

  useEffect(() => {
    if (!wallet) return;
    getWalletAddressBech32(wallet).then(addr => {
      if (addr) setWalletAddress(addr);
    });
  }, [wallet]);

  // Detect mid-session address change — warn the user if the form has content
  useEffect(() => {
    if (!walletAddress) return;
    const hasContent = name.trim().length > 0 || course.trim().length > 0;
    if (!lockedAddressRef.current) {
      lockedAddressRef.current = walletAddress;
      return;
    }
    if (hasContent && walletAddress !== lockedAddressRef.current) {
      setAddressChanged(true);
    } else {
      setAddressChanged(false);
      lockedAddressRef.current = walletAddress;
    }
  }, [walletAddress, name, course]);

  const validate = (): string | null => {
    if (name.trim().length < 3) return "Full name must be at least 3 characters.";
    if (course.trim().length < 2) return "Course / degree program is required.";
    if (!isValidPreprodAddress(walletAddress.trim()))
      return "Wallet address could not be read. Please reconnect your wallet.";
    return null;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");
    setFormState("submitting");
    try {
      await wallet!.signData(
        walletAddress,
        toHex(`ScholarChain application: ${name.trim()}`)
      );
      await addScholar({ name: name.trim(), course: course.trim(), walletAddress: walletAddress.trim() });
      setSubmittedAddress(walletAddress.trim());
      setFormState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (
        msg.toLowerCase().includes("user declined") ||
        msg.toLowerCase().includes("cancelled") ||
        msg.toLowerCase().includes("rejected")
      ) {
        setErrorMsg("You must sign the application to confirm wallet ownership.");
        setFormState("idle");
      } else {
        setFormState("error");
        setErrorMsg("Failed to submit application. Please try again.");
      }
    }
  };

  const reset = () => {
    setName("");
    setCourse("");
    setErrorMsg("");
    setAddressChanged(false);
    lockedAddressRef.current = walletAddress;
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
        <button onClick={reset} className="text-sm text-blue-400 hover:text-blue-300 underline self-start transition-colors">
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-5">

      {/* Connected wallet indicator chip */}
      {walletAddress && (
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs text-slate-400">
            Submitting as{" "}
            <span className="font-mono text-slate-200">{shortenAddress(walletAddress)}</span>
            {walletName && (
              <span className="text-slate-500 capitalize"> · {walletName}</span>
            )}
          </span>
        </div>
      )}

      {/* Address-changed warning */}
      {addressChanged && (
        <div className="flex items-start gap-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-3">
          <span className="text-yellow-400 text-base shrink-0">⚠️</span>
          <p className="text-yellow-300 text-xs leading-relaxed">
            Your connected wallet changed. This application will now be submitted from{" "}
            <span className="font-mono">{shortenAddress(walletAddress)}</span>.
            Continue if this is correct, or switch back to your original wallet.
          </p>
        </div>
      )}

      <h2 className="text-lg font-semibold text-white">Scholarship Application</h2>

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
            readOnly
            value={walletAddress || "Loading from wallet..."}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-400 cursor-default"
          />
          <p className="text-xs text-slate-500">Auto-filled from your connected wallet.</p>
        </div>

        {errorMsg && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-2.5">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={formState === "submitting" || !walletAddress}
          className="mt-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-60 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors"
        >
          {formState === "submitting" ? "Signing & Submitting..." : "Sign & Submit Application"}
        </button>

        <p className="text-xs text-slate-600 text-center">
          Your wallet will ask you to sign as proof of ownership. No ADA is spent.
        </p>
      </form>
    </div>
  );
}

export default function ScholarApplicationForm() {
  return <ApplicationFormInner />;
}
