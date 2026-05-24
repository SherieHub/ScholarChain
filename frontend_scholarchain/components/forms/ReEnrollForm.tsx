"use client";
import { useState } from "react";
import { createScholarship } from "@/lib/firebase/scholarships";
import { getNextSemester } from "@/lib/utils/semesterUtils";
import type { Scholar } from "@/types";

interface ReEnrollFormProps {
  scholar: Scholar;
  onSuccess: () => void;
}

export default function ReEnrollForm({ scholar, onSuccess }: ReEnrollFormProps) {
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const nextSem = getNextSemester();

  const handleEnroll = async () => {
    if (!scholar.id) return;
    setState("submitting");
    setErrorMsg("");
    try {
      await createScholarship(scholar.id, scholar.walletAddress);
      setState("success");
      onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Re-enrollment failed. Please try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-5 flex items-start gap-3">
        <span className="text-2xl">🎉</span>
        <div>
          <p className="text-green-300 font-semibold text-sm">Re-enrollment Submitted!</p>
          <p className="text-green-400 text-xs mt-0.5">
            Your application for <span className="font-medium">{nextSem.label}</span> is under review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Re-enroll for Next Semester</h3>
        <p className="text-xs text-slate-400 mt-1">
          Your current scholarship term has ended. Apply for the next semester to continue
          receiving your stipend.
        </p>
      </div>

      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 flex flex-col gap-1">
        <p className="text-xs text-slate-500">Applying for</p>
        <p className="text-sm font-semibold text-white">{nextSem.label}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {nextSem.start.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
          {" – "}
          {nextSem.end.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 space-y-1 text-xs text-slate-400">
        <p><span className="text-slate-500">Name:</span> {scholar.name}</p>
        <p><span className="text-slate-500">Course:</span> {scholar.course}</p>
      </div>

      {(state === "error") && errorMsg && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-2.5">
          {errorMsg}
        </p>
      )}

      <button
        onClick={handleEnroll}
        disabled={state === "submitting"}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
      >
        {state === "submitting" ? "Submitting..." : "Submit Re-enrollment Application"}
      </button>

      <p className="text-xs text-slate-600 text-center">
        The admin will review and approve your application before the stipend is released.
      </p>
    </div>
  );
}
