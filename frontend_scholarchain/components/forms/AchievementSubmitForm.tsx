"use client";
import { useState } from "react";
import type { Achievement } from "@/types";

interface AchievementSubmitFormProps {
  scholarId: string;
  onSubmit: (data: { proofLink: string }) => Promise<void>;
  isSubmitting: boolean;
  currentAchievement?: Achievement;
}

export default function AchievementSubmitForm({
  scholarId: _scholarId,
  onSubmit,
  isSubmitting,
  currentAchievement,
}: AchievementSubmitFormProps) {
  const [proofLink, setProofLink] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (currentAchievement?.rewardStatus === "Paid") {
    return (
      <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-lg">🏆</div>
          <div>
            <p className="font-semibold text-green-300 text-sm">Reward Received!</p>
            <p className="text-green-500 text-xs">
              {currentAchievement.tokensRewarded
                ? `${currentAchievement.tokensRewarded} SCHOLAR tokens sent`
                : "Tokens have been distributed to your wallet."}
            </p>
          </div>
        </div>
        {currentAchievement.proofLink && (
          <a
            href={currentAchievement.proofLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 rounded-lg px-3 py-1.5 transition-all self-start"
          >
            View Submitted Proof
          </a>
        )}
      </div>
    );
  }

  if (currentAchievement?.rewardStatus === "Pending Review") {
    return (
      <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-amber-300 text-sm font-medium">Achievement Under Review</p>
        </div>
        <p className="text-xs text-slate-500">Your proof has been submitted. The admin will review and send your SCHOLAR token reward.</p>
        {currentAchievement.proofLink && (
          <a
            href={currentAchievement.proofLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 rounded-lg px-3 py-1.5 transition-all self-start"
          >
            View Submitted Proof
          </a>
        )}
      </div>
    );
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = proofLink.trim();
    if (!url) { setErrorMsg("Please provide a link to your proof of achievement."); return; }
    try { new URL(url); } catch { setErrorMsg("Please enter a valid URL (e.g. https://drive.google.com/…)."); return; }
    setErrorMsg("");
    await onSubmit({ proofLink: url });
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-1">Submit Proof of Achievement</h3>
      <p className="text-xs text-slate-500 mb-4">
        Paste a link to your grade report, transcript, or any document that proves your academic achievement. The admin will review it and send SCHOLAR tokens.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Proof Link</label>
          <input
            type="url"
            value={proofLink}
            onChange={e => setProofLink(e.target.value)}
            placeholder="https://drive.google.com/file/…"
            className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
          <p className="text-xs text-slate-600">Google Drive, Dropbox, or any shareable link to your document</p>
        </div>
        {errorMsg && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2">
            {errorMsg}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !proofLink.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit Proof"
          )}
        </button>
      </form>
    </div>
  );
}
