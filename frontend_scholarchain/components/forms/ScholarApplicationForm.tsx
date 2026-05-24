"use client";
import { useState, useEffect, useRef } from "react";
import { useWallet } from "@meshsdk/react";
import { addScholar, scholarWalletExists } from "@/lib/firebase/scholars";
import { createScholarship } from "@/lib/firebase/scholarships";
import { getCurrentSemester } from "@/lib/utils/semesterUtils";
import { isValidPreprodAddress, shortenAddress, getWalletAddressBech32 } from "@/lib/utils/addressUtils";

function toHex(text: string): string {
  return Array.from(new TextEncoder().encode(text))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

type FormState = "idle" | "submitting" | "success" | "error";

function ApplicationFormInner() {
  const { wallet, connected, name: walletName } = useWallet();
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
    if (!connected || !wallet) {
      setWalletAddress("");
      return;
    }
    getWalletAddressBech32(wallet).then(addr => {
      if (addr) setWalletAddress(addr);
    });
  }, [wallet, connected]);

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
    if (!course) return "Please select a course / degree program.";
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
      // Duplicate guard — one scholar record per wallet address
      const alreadyExists = await scholarWalletExists(walletAddress.trim());
      if (alreadyExists) {
        setErrorMsg(
          "A scholar record already exists for this wallet. " +
          "Go to the Scholar Portal to re-enroll for the current semester."
        );
        setFormState("idle");
        return;
      }

      await wallet!.signData(
        walletAddress,
        toHex(`ScholarChain application: ${name.trim()}`)
      );

      // Create scholar identity record + first semester scholarship in parallel
      const scholarId = await addScholar({
        name: name.trim(),
        course: course.trim(),
        walletAddress: walletAddress.trim(),
      });
      await createScholarship(scholarId, walletAddress.trim());

      setSubmittedAddress(walletAddress.trim());
      setFormState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes("user declined") ||
        msg.toLowerCase().includes("cancelled") ||
        msg.toLowerCase().includes("rejected")
      ) {
        setErrorMsg("You must sign the application to confirm wallet ownership.");
        setFormState("idle");
      } else if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("insufficient")) {
        setErrorMsg("Submission blocked by database rules. Please try again or contact support.");
        setFormState("idle");
      } else {
        setErrorMsg(msg || "Failed to submit application. Please try again.");
        setFormState("idle");
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

      {/* Semester info — student sees exactly what period they're applying for */}
      {(() => {
        const sem = getCurrentSemester();
        return (
          <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-xl px-4 py-3 flex flex-col gap-1">
            <p className="text-xs text-slate-500">Applying for</p>
            <p className="text-sm font-semibold text-white">{sem.label}</p>
            <p className="text-xs text-slate-500">
              {sem.start.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
              {" – "}
              {sem.end.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        );
      })()}

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
          <select
            value={course}
            onChange={e => setCourse(e.target.value)}
            className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors appearance-none cursor-pointer"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "20px" }}
          >
            <option value="" disabled className="bg-slate-900">Select your degree program…</option>
            <optgroup label="Business" className="bg-slate-900">
              <option value="BS Accountancy" className="bg-slate-900">BS Accountancy</option>
              <option value="BS Business Administration" className="bg-slate-900">BS Business Administration</option>
              <option value="BS Economics" className="bg-slate-900">BS Economics</option>
              <option value="BS Finance" className="bg-slate-900">BS Finance</option>
              <option value="BS Management" className="bg-slate-900">BS Management</option>
              <option value="BS Marketing" className="bg-slate-900">BS Marketing</option>
            </optgroup>
            <optgroup label="Engineering &amp; Technology" className="bg-slate-900">
              <option value="BS Chemical Engineering" className="bg-slate-900">BS Chemical Engineering</option>
              <option value="BS Civil Engineering" className="bg-slate-900">BS Civil Engineering</option>
              <option value="BS Computer Engineering" className="bg-slate-900">BS Computer Engineering</option>
              <option value="BS Computer Science" className="bg-slate-900">BS Computer Science</option>
              <option value="BS Electrical Engineering" className="bg-slate-900">BS Electrical Engineering</option>
              <option value="BS Electronics Engineering" className="bg-slate-900">BS Electronics Engineering</option>
              <option value="BS Industrial Engineering" className="bg-slate-900">BS Industrial Engineering</option>
              <option value="BS Information Technology" className="bg-slate-900">BS Information Technology</option>
              <option value="BS Mechanical Engineering" className="bg-slate-900">BS Mechanical Engineering</option>
            </optgroup>
            <optgroup label="Health Sciences" className="bg-slate-900">
              <option value="BS Medical Technology" className="bg-slate-900">BS Medical Technology</option>
              <option value="BS Midwifery" className="bg-slate-900">BS Midwifery</option>
              <option value="BS Nursing" className="bg-slate-900">BS Nursing</option>
              <option value="BS Nutrition and Dietetics" className="bg-slate-900">BS Nutrition and Dietetics</option>
              <option value="BS Pharmacy" className="bg-slate-900">BS Pharmacy</option>
              <option value="BS Physical Therapy" className="bg-slate-900">BS Physical Therapy</option>
              <option value="Doctor of Dental Medicine" className="bg-slate-900">Doctor of Dental Medicine</option>
              <option value="Doctor of Medicine" className="bg-slate-900">Doctor of Medicine</option>
            </optgroup>
            <optgroup label="Science" className="bg-slate-900">
              <option value="BS Biology" className="bg-slate-900">BS Biology</option>
              <option value="BS Chemistry" className="bg-slate-900">BS Chemistry</option>
              <option value="BS Environmental Science" className="bg-slate-900">BS Environmental Science</option>
              <option value="BS Mathematics" className="bg-slate-900">BS Mathematics</option>
              <option value="BS Physics" className="bg-slate-900">BS Physics</option>
              <option value="BS Psychology" className="bg-slate-900">BS Psychology</option>
            </optgroup>
            <optgroup label="Education" className="bg-slate-900">
              <option value="Bachelor of Elementary Education" className="bg-slate-900">Bachelor of Elementary Education</option>
              <option value="Bachelor of Secondary Education" className="bg-slate-900">Bachelor of Secondary Education</option>
              <option value="BS Education" className="bg-slate-900">BS Education</option>
            </optgroup>
            <optgroup label="Arts &amp; Social Sciences" className="bg-slate-900">
              <option value="AB Communication" className="bg-slate-900">AB Communication</option>
              <option value="AB English" className="bg-slate-900">AB English</option>
              <option value="AB Filipino" className="bg-slate-900">AB Filipino</option>
              <option value="AB Political Science" className="bg-slate-900">AB Political Science</option>
              <option value="AB Psychology" className="bg-slate-900">AB Psychology</option>
              <option value="AB Sociology" className="bg-slate-900">AB Sociology</option>
              <option value="BS Criminology" className="bg-slate-900">BS Criminology</option>
              <option value="BS Social Work" className="bg-slate-900">BS Social Work</option>
            </optgroup>
            <optgroup label="Hospitality &amp; Tourism" className="bg-slate-900">
              <option value="BS Hospitality Management" className="bg-slate-900">BS Hospitality Management</option>
              <option value="BS Hotel and Restaurant Management" className="bg-slate-900">BS Hotel and Restaurant Management</option>
              <option value="BS Tourism Management" className="bg-slate-900">BS Tourism Management</option>
            </optgroup>
            <optgroup label="Law &amp; Architecture" className="bg-slate-900">
              <option value="BS Architecture" className="bg-slate-900">BS Architecture</option>
              <option value="Juris Doctor" className="bg-slate-900">Juris Doctor</option>
            </optgroup>
          </select>
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
          Your wallet will ask you to sign as proof of ownership. No tADA is spent.
        </p>
      </form>
    </div>
  );
}

export default function ScholarApplicationForm() {
  return <ApplicationFormInner />;
}
