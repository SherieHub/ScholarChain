"use client";
import { useState } from "react";
import type { ScholarAchievement } from "@/types/scholarAchievement";
import type { Scholar } from "@/types";

interface ScholarAchievementsReviewTableProps {
  achievements: ScholarAchievement[];
  scholars: Scholar[];
  onApprove: (achievement: ScholarAchievement) => Promise<void>;
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
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {achievements.map((ach) => {
            const scholar = scholarMap.get(ach.scholarId);
            const isProcessing = processingId === ach.id;
            const showReject = showRejectInput[ach.id!] ?? false;

            return (
              <tr
                key={ach.id}
                className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors align-top"
              >
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {scholar?.name ?? (
                    <span className="text-slate-500 font-mono text-xs">{ach.scholarId.slice(0, 8)}…</span>
                  )}
                </td>

                <td className="px-4 py-3 text-white max-w-[180px]">
                  <p className="font-medium text-sm leading-snug">{ach.achievementName}</p>
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-0.5">
                    {ach.achievementType}
                  </span>
                </td>

                <td className="px-4 py-3 text-slate-400 text-xs max-w-[140px]">
                  {ach.issuingOrganization}
                </td>

                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                  {formatDate(ach.dateAchieved)}
                </td>

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

                <td className="px-4 py-3">
                  {showReject ? (
                    <div className="flex flex-col gap-1.5 min-w-[180px]">
                      <input
                        type="text"
                        placeholder="Reason (optional)"
                        value={rejectNotes[ach.id!] ?? ""}
                        onChange={(e) =>
                          setRejectNotes((p) => ({ ...p, [ach.id!]: e.target.value }))
                        }
                        className="bg-white/[0.04] border border-white/[0.10] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-red-500/50"
                        disabled={isProcessing}
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onReject(ach, rejectNotes[ach.id!] ?? "")}
                          disabled={isProcessing}
                          className="flex-1 inline-flex items-center justify-center text-xs font-medium text-red-300 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 rounded-lg px-2.5 py-1.5 transition-all disabled:opacity-50"
                        >
                          {isProcessing ? "…" : "Confirm Reject"}
                        </button>
                        <button
                          onClick={() => setShowRejectInput((p) => ({ ...p, [ach.id!]: false }))}
                          disabled={isProcessing}
                          className="text-xs text-slate-400 hover:text-white border border-white/[0.10] hover:border-white/[0.20] bg-white/[0.03] rounded-lg px-2.5 py-1.5 transition-all disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onApprove(ach)}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center text-xs font-semibold text-green-300 bg-green-500/10 border border-green-500/25 hover:bg-green-500/20 hover:text-green-200 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <span className="h-3 w-3 border-2 border-green-500/30 border-t-green-300 rounded-full animate-spin" />
                        ) : "Approve"}
                      </button>
                      <button
                        onClick={() => setShowRejectInput((p) => ({ ...p, [ach.id!]: true }))}
                        disabled={isProcessing}
                        className="inline-flex items-center justify-center text-xs font-medium text-red-400 bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 hover:border-red-400/30 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50"
                      >
                        Reject
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
