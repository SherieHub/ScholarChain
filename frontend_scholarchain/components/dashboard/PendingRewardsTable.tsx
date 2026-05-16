"use client";
import type { Scholar } from "@/types";
import TxHashLink from "@/components/transparency/TxHashLink";
import RewardApprovalForm from "@/components/forms/RewardApprovalForm";

interface PendingRewardsTableProps {
  scholars: Scholar[];
  onApproveReward: (scholar: Scholar, adaAmount: number, tokenAmount: number) => Promise<void>;
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
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Grade</th>
            <th className="px-4 py-3">Proof</th>
            <th className="px-4 py-3">Reward</th>
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
                <td className="px-4 py-3 text-gray-300">{ach.subject}</td>
                <td className="px-4 py-3 text-gray-300">{ach.grade}</td>
                <td className="px-4 py-3">
                  <a
                    href={ach.proofLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    View
                  </a>
                </td>
                <td className="px-4 py-3">
                  {isPaid ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-xs font-medium">Paid ✓</span>
                      {ach.rewardTxHash && <TxHashLink txHash={ach.rewardTxHash} label="tx" />}
                    </div>
                  ) : (
                    <RewardApprovalForm
                      scholarId={scholar.id!}
                      onApprove={(ada, tokens) => onApproveReward(scholar, ada, tokens)}
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
