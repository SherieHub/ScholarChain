"use client";
import type { Scholar } from "@/types";
import TxHashLink from "@/components/transparency/TxHashLink";
import RewardApprovalForm from "@/components/forms/RewardApprovalForm";

interface PendingRewardsTableProps {
  scholars: Scholar[];
  onApproveReward: (scholar: Scholar, tokenAmount: number) => Promise<void>;
  processingId: string | null;
}

export default function PendingRewardsTable({
  scholars,
  onApproveReward,
  processingId,
}: PendingRewardsTableProps) {
  if (scholars.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm border border-gray-800 rounded-xl">
        No pending achievement rewards.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-500 uppercase bg-gray-900 border-b border-gray-800">
          <tr>
            <th className="px-4 py-3">Scholar</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Proof of Achievement</th>
            <th className="px-4 py-3">Send Reward</th>
          </tr>
        </thead>
        <tbody>
          {scholars.map(scholar => {
            const ach = scholar.achievement!;
            const isPaid = ach.rewardStatus === "Paid";
            const isProcessing = processingId === scholar.id;

            return (
              <tr key={scholar.id} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{scholar.name}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{scholar.course}</td>
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
                    <span className="text-gray-600 text-xs italic">No link provided</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isPaid ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-xs font-medium">Paid ✓</span>
                      {ach.rewardTxHash && <TxHashLink txHash={ach.rewardTxHash} label="View Tx" />}
                    </div>
                  ) : (
                    <RewardApprovalForm
                      scholarId={scholar.id!}
                      onApprove={(tokens) => onApproveReward(scholar, tokens)}
                      isProcessing={isProcessing}
                    />
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
