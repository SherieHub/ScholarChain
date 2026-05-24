import type { Scholarship } from "@/types";
import TxHashLink from "@/components/transparency/TxHashLink";

const STATUS_STYLES: Record<string, string> = {
  Pending:  "bg-yellow-500/10 text-yellow-300 border-yellow-500/25",
  Approved: "bg-blue-500/10  text-blue-300  border-blue-500/25",
  Paid:     "bg-green-500/10 text-green-300 border-green-500/25",
  Rejected: "bg-red-500/10   text-red-300   border-red-500/25",
  Expired:  "bg-gray-500/10  text-gray-400  border-gray-500/25",
};

const STATUS_ICONS: Record<string, string> = {
  Pending:  "⏳",
  Approved: "✅",
  Paid:     "🏆",
  Rejected: "❌",
  Expired:  "📅",
};

const STATUS_MESSAGES: Record<string, string> = {
  Pending:  "Your application is under review by the admin.",
  Approved: "Approved — your stipend will be sent shortly.",
  Paid:     "Your stipend for this semester has been sent.",
  Rejected: "Your application was not approved. Contact your administrator.",
  Expired:  "This semester has ended. Re-enroll for the next semester below.",
};

interface ScholarshipStatusCardProps {
  scholarship: Scholarship;
}

export default function ScholarshipStatusCard({ scholarship }: ScholarshipStatusCardProps) {
  const styleClass = STATUS_STYLES[scholarship.status] ?? STATUS_STYLES.Pending;
  const icon = STATUS_ICONS[scholarship.status] ?? "⏳";
  const message = STATUS_MESSAGES[scholarship.status] ?? "";

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Scholarship — {scholarship.semester}
        </h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleClass}`}>
          {icon} {scholarship.status}
        </span>
      </div>

      <p className="text-xs text-slate-400">{message}</p>

      {scholarship.status === "Paid" && scholarship.stipendTxHash && (
        <div className="border-t border-white/[0.06] pt-3">
          <TxHashLink txHash={scholarship.stipendTxHash} label="View Stipend Transaction" />
        </div>
      )}
    </div>
  );
}
