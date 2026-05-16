"use client";
import { useState } from "react";
import type { Achievement } from "@/types";

interface AchievementSubmitFormProps {
  scholarId: string;
  onSubmit: (data: { subject: string; grade: string; proofLink: string }) => Promise<void>;
  isSubmitting: boolean;
  currentAchievement?: Achievement;
}

export default function AchievementSubmitForm({
  scholarId: _scholarId,
  onSubmit,
  isSubmitting,
  currentAchievement,
}: AchievementSubmitFormProps) {
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (currentAchievement?.rewardStatus === "Paid") {
    return (
      <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-lg">🏆</div>
          <div>
            <p className="font-semibold text-green-300 text-sm">Reward Received!</p>
            <p className="text-green-500 text-xs">{currentAchievement.subject} — {currentAchievement.grade}</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 space-y-0.5">
          {currentAchievement.adaRewarded && (
            <p>ADA Rewarded: <span className="text-white font-medium">{currentAchievement.adaRewarded} tADA</span></p>
          )}
          {currentAchievement.tokensRewarded && (
            <p>SCHOLAR Tokens: <span className="text-white font-medium">{currentAchievement.tokensRewarded}</span></p>
          )}
        </div>
      </div>
    );
  }

  if (currentAchievement?.rewardStatus === "Pending Review") {
    return (
      <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-5 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-amber-300 text-sm font-medium">Achievement Under Review</p>
        </div>
        <p className="text-xs text-slate-400">
          Subject: <span className="text-slate-300">{currentAchievement.subject}</span> · Grade:{" "}
          <span className="text-slate-300">{currentAchievement.grade}</span>
        </p>
        <p className="text-xs text-slate-500">Your reward will be sent once the admin approves.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) { setErrorMsg("Subject is required."); return; }
    if (!grade.trim()) { setErrorMsg("Grade is required."); return; }
    if (!proofLink.trim()) { setErrorMsg("Proof link is required."); return; }
    setErrorMsg("");
    await onSubmit({ subject: subject.trim(), grade: grade.trim(), proofLink: proofLink.trim() });
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Submit Achievement for Reward</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Grade</label>
            <input
              type="text"
              value={grade}
              onChange={e => setGrade(e.target.value)}
              placeholder="e.g. A+"
              className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-400">Proof Link</label>
          <input
            type="url"
            value={proofLink}
            onChange={e => setProofLink(e.target.value)}
            placeholder="https://..."
            className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>
        {errorMsg && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2">
            {errorMsg}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium rounded-xl px-4 py-2 text-sm transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit Achievement"}
        </button>
      </form>
    </div>
  );
}
