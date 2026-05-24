"use client";
import { useState } from "react";
import type { ScholarAchievement } from "@/types/scholarAchievement";
import type { Scholar } from "@/types";

interface ScholarAchievementsReviewTableProps {
  achievements: ScholarAchievement[];
  scholars: Scholar[];
  onApprove: (achievement: ScholarAchievement, tokenAmount: number) => Promise<void>;
  onReject: (achievement: ScholarAchievement, note: string) => Promise<void>;
  processingId: string | null;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-PH", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ScholarAchievementsReviewTable({
  achievements,
  scholars,
  onApprove,
  onReject,
  processingId,
}: ScholarAchievementsReviewTableProps) {
  const [tokenAmounts, setTokenAmounts] = useState<Record<string, string>>({});
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});

  const scholarMap = new Map(scholars.map((s) => [s.id!, s]));

  if (achievements.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 text-sm border border-white/[0.06] rounded-xl">
        No pending achievement submissions.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="text-xs text-slate-500 uppercase bg-white/[0.03] border-b border-white/[0.08]">
          <tr>
            <th className="px-4 py-3">Scholar</th>
            <th className="px-4 py-3">Achievement</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Organization</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Proof</th>
            <th className="px-4 py-3">Send Reward</th>
          </tr>
        </thead>
        <tbody>
          {achievements.map((ach) => {
            const scholar = scholarMap.get(ach.scholarId);
            const isProcessing = processingId === ach.id;
            const showReject = showRejectInput[ach.id!] ?? false;
            const tokenVal = tokenAmounts[ach.id!] ?? "";
            const tokenNum = Number(tokenVal);
            const isValidToken = tokenNum > 0 && Number.isInteger(tokenNum);

            return (
              <tr
                key={ach.id}
                className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors align-top"
              >
                {/* Scholar */}
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  <p>{scholar?.name ?? (
                    <span className="text-slate-500 font-mono text-xs">{ach.scholarId.slice(0, 8)}…</span>
                  )}</p>
                  {scholar?.course && (
                    <p className="text-xs text-slate-500 mt-0.5">{scholar.course}</p>
                  )}
                </td>

                {/* Achievement */}
                <td className="px-4 py-3 max-w-[180px]">
                  <p className="font-medium text-sm text-white leading-snug">{ach.achievementName}</p>
                </td>

                {/* Type */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5">
                    {ach.achievementType}
                  </span>
                </td>

                {/* Org */}
                <td className="px-4 py-3 text-slate-400 text-xs max-w-[140px]">
                  {ach.issuingOrganization}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                  {formatDate(ach.dateAchieved)}
                </td>

                {/* Proof */}
                <td className="px-4 py-3">
                  {ach.proofLink ? (
                    <a
                      href={ach.proofLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-400/40 rounded-lg px-3 py-1.5 transition-all duration-150"
                    >
                      View Proof
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  ) : (
                    <span className="text-slate-600 text-xs italic">No link</span>
                  )}
                </td>

                {/* Send Reward / Reject */}
                <td className="px-4 py-4">
                  {showReject ? (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Rejection reason (optional)"
                        value={rejectNotes[ach.id!] ?? ""}
                        onChange={(e) =>
                          setRejectNotes((p) => ({ ...p, [ach.id!]: e.target.value }))
                        }
                        className="w-full bg-red-500/5 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-white placeholder-red-900/60 outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 transition-all"
                        disabled={isProcessing}
                      />
                      <button
                        onClick={() => onReject(ach, rejectNotes[ach.id!] ?? "")}
                        disabled={isProcessing}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-lg shadow-red-900/40 transition-all"
                      >
                        {isProcessing ? (
                          <>
                            <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Rejecting…
                          </>
                        ) : (
                          "Confirm Reject"
                        )}
                      </button>
                      <button
                        onClick={() => setShowRejectInput((p) => ({ ...p, [ach.id!]: false }))}
                        disabled={isProcessing}
                        className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.12] hover:border-white/[0.22] rounded-lg transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={tokenVal}
                        onChange={(e) =>
                          setTokenAmounts((p) => ({ ...p, [ach.id!]: e.target.value }))
                        }
                        placeholder="SCHL token amount"
                        disabled={isProcessing}
                        className="w-full bg-violet-500/5 border border-violet-500/25 hover:border-violet-500/40 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/25 transition-all disabled:opacity-50"
                      />
                      <button
                        onClick={() => onApprove(ach, tokenNum)}
                        disabled={!isValidToken || isProcessing}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:from-violet-700 active:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-lg shadow-violet-900/50 transition-all"
                      >
                        {isProcessing ? (
                          <>
                            <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <span>Send Tokens</span>
                            <span className="text-violet-300">✦</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowRejectInput((p) => ({ ...p, [ach.id!]: true }))}
                        disabled={isProcessing}
                        className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-bold text-red-300 bg-red-500/[0.08] hover:bg-red-500/[0.18] border border-red-500/30 hover:border-red-400/60 rounded-lg shadow-sm shadow-red-900/20 transition-all disabled:opacity-50"
                      >
                        Reject Submission
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
