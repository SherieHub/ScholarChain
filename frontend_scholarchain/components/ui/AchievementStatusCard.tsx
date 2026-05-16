import type { Achievement } from "@/types";
import TxHashLink from "@/components/transparency/TxHashLink";

const STATUS_STYLES: Record<string, string> = {
  "Pending Review": "bg-amber-500/10 text-amber-300 border-amber-500/25",
  Approved: "bg-blue-500/10 text-blue-300 border-blue-500/25",
  Paid: "bg-green-500/10 text-green-300 border-green-500/25",
};

const STATUS_ICONS: Record<string, string> = {
  "Pending Review": "⏳",
  Approved: "✅",
  Paid: "🏆",
};

interface AchievementStatusCardProps {
  achievement: Achievement;
}

export default function AchievementStatusCard({ achievement }: AchievementStatusCardProps) {
  const styleClass = STATUS_STYLES[achievement.rewardStatus] ?? STATUS_STYLES["Pending Review"];
  const icon = STATUS_ICONS[achievement.rewardStatus] ?? "⏳";

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Achievement</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClass}`}>
          {icon} {achievement.rewardStatus}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Subject</p>
          <p className="text-white font-medium">{achievement.subject}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Grade</p>
          <p className="text-white font-medium">{achievement.grade}</p>
        </div>
      </div>
      {achievement.rewardStatus === "Paid" && (
        <div className="border-t border-white/[0.06] pt-3 flex flex-col gap-1.5 text-xs">
          {achievement.adaRewarded && (
            <p className="text-slate-400">
              ADA Rewarded: <span className="text-green-300 font-medium">{achievement.adaRewarded} tADA</span>
            </p>
          )}
          {achievement.tokensRewarded && (
            <p className="text-slate-400">
              SCHOLAR Tokens: <span className="text-green-300 font-medium">{achievement.tokensRewarded}</span>
            </p>
          )}
          {achievement.rewardTxHash && (
            <TxHashLink txHash={achievement.rewardTxHash} label="View Reward Transaction" />
          )}
        </div>
      )}
    </div>
  );
}
