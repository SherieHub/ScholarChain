import type { ScholarAchievement, AchievementType } from "@/types/scholarAchievement";

const TYPE_COLORS: Record<AchievementType, { bg: string; text: string; border: string }> = {
  Competition:          { bg: "bg-yellow-500/10",  text: "text-yellow-400",  border: "border-yellow-500/25" },
  Certification:        { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/25"   },
  Leadership:           { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/25" },
  "Community Service":  { bg: "bg-green-500/10",   text: "text-green-400",   border: "border-green-500/25"  },
  "Academic Award":     { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/25" },
  "Seminar & Training": { bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/25"   },
  Research:             { bg: "bg-teal-500/10",    text: "text-teal-400",    border: "border-teal-500/25"   },
  Sports:               { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/25" },
  "Arts & Culture":     { bg: "bg-pink-500/10",    text: "text-pink-400",    border: "border-pink-500/25"   },
};

const STATUS_STYLE: Record<ScholarAchievement["status"], { bg: string; text: string; border: string; dot: string }> = {
  "Pending Review": { bg: "bg-amber-500/10",  text: "text-amber-300",  border: "border-amber-500/25",  dot: "bg-amber-400"  },
  Approved:         { bg: "bg-green-500/10",  text: "text-green-300",  border: "border-green-500/25",  dot: "bg-green-400"  },
  Rejected:         { bg: "bg-red-500/10",    text: "text-red-300",    border: "border-red-500/25",    dot: "bg-red-400"    },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-PH", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return iso;
  }
}

interface ScholarAchievementCardProps {
  achievement: ScholarAchievement;
}

export default function ScholarAchievementCard({ achievement }: ScholarAchievementCardProps) {
  const typeColor = TYPE_COLORS[achievement.achievementType] ?? {
    bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/25",
  };
  const statusStyle = STATUS_STYLE[achievement.status];

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3 hover:border-white/[0.13] transition-colors">
      {/* Top row: name + status badge */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-white font-semibold text-sm leading-snug">{achievement.achievementName}</p>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {achievement.status}
        </span>
      </div>

      {/* Type pill + org */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
        >
          {achievement.achievementType}
        </span>
        <span className="text-slate-400 text-xs">{achievement.issuingOrganization}</span>
      </div>

      {/* Date + proof link */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.05]">
        <p className="text-xs text-slate-500">
          <span className="text-slate-600">Achieved: </span>
          {formatDate(achievement.dateAchieved)}
        </p>
        {achievement.proofLink && (
          <a
            href={achievement.proofLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-400/40 rounded-lg px-3 py-1.5 transition-all duration-150"
          >
            View Proof
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        )}
      </div>

      {/* Admin note (if rejected) */}
      {achievement.status === "Rejected" && achievement.adminNote && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2 text-xs text-red-300">
          <span className="font-semibold">Note: </span>{achievement.adminNote}
        </div>
      )}
    </div>
  );
}
