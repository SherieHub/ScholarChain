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

      {achievement.proofLink ? (
        <div>
          <p className="text-xs text-slate-500 mb-2">Proof of Achievement</p>
          <a
            href={achievement.proofLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-400/40 rounded-lg px-3 py-1.5 transition-all duration-150"
          >
            View Proof Document
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      ) : achievement.grade ? (
        <div className="text-sm">
          <p className="text-xs text-slate-500 mb-0.5">Grade</p>
          <p className="text-white font-medium">{achievement.grade}</p>
        </div>
      ) : null}

      {achievement.rewardStatus === "Paid" && (
        <div className="border-t border-white/[0.06] pt-3 flex flex-col gap-2 text-xs">
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
