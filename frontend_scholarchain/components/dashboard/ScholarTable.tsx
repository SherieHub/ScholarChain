import type { Scholar, Scholarship } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import TxHashLink from "@/components/transparency/TxHashLink";
import MintNFTButton from "@/components/dashboard/MintNFTButton";
import { shortenAddress } from "@/lib/utils/addressUtils";

interface ScholarTableProps {
  scholars: Scholar[];
  onSend: (scholar: Scholar) => void;
  onMint: (scholar: Scholar) => void;
  onApproveScholarship: (scholarship: Scholarship) => void;
  processingId: string | null;
  mintingId: string | null;
  scholarshipMap: Map<string, Scholarship>;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-800">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-800 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export { SkeletonRow };

export default function ScholarTable({
  scholars,
  onSend,
  onMint,
  onApproveScholarship,
  processingId,
  mintingId,
  scholarshipMap,
}: ScholarTableProps) {
  if (scholars.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm border border-gray-800 rounded-xl">
        No scholars found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-500 uppercase bg-gray-900 border-b border-gray-800">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Wallet Address</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Scholar ID</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {scholars.map((scholar, idx) => (
            <tr
              key={scholar.id}
              className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
            >
              <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
              <td className="px-4 py-3 font-medium text-white">{scholar.name}</td>
              <td className="px-4 py-3 text-gray-400">{scholar.course}</td>
              <td className="px-4 py-3 font-mono text-gray-400 text-xs">
                {shortenAddress(scholar.walletAddress)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={scholar.status} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">
                {scholar.policyId ? (
                  `${scholar.policyId.slice(0, 8)}...`
                ) : (
                  <span className="text-gray-700">Not Minted</span>
                )}
              </td>
              <td className="px-4 py-3">
                {(() => {
                  const ss = scholar.id ? scholarshipMap.get(scholar.id) : undefined;
                  if (ss?.status === "Paid" && ss.stipendTxHash) {
                    return <TxHashLink txHash={ss.stipendTxHash} label="Paid ✓" />;
                  }
                  return <span className="text-gray-600 text-xs">—</span>;
                })()}
              </td>
              <td className="px-4 py-3">
                {(() => {
                  const busy = processingId !== null || mintingId !== null;
                  const ss = scholar.id ? scholarshipMap.get(scholar.id) : undefined;

                  // Identity not minted yet — mint first
                  if (!scholar.policyId) {
                    return (
                      <MintNFTButton
                        scholar={scholar}
                        onMint={onMint}
                        isMinting={mintingId === scholar.id}
                        disabled={busy}
                      />
                    );
                  }

                  // Sending ADA in progress
                  if (processingId === scholar.id) {
                    return (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-950/60 border border-sky-500/30 rounded-lg">
                        <div className="h-3.5 w-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sky-300 text-xs font-medium tracking-wide">Sending...</span>
                      </div>
                    );
                  }

                  // No scholarship for this semester
                  if (!ss) {
                    return <span className="text-gray-600 text-xs">Not enrolled</span>;
                  }

                  if (ss.status === "Pending") {
                    return (
                      <button
                        onClick={() => onApproveScholarship(ss)}
                        disabled={busy}
                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                    );
                  }

                  if (ss.status === "Approved") {
                    return (
                      <button
                        onClick={() => onSend(scholar)}
                        disabled={busy}
                        className={[
                          "group relative inline-flex items-center gap-1.5 px-3 py-1.5",
                          "bg-gradient-to-r from-blue-600 to-cyan-500",
                          "hover:from-blue-500 hover:to-cyan-400",
                          "disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed",
                          "text-white text-xs font-semibold rounded-lg",
                          "shadow-md shadow-blue-900/50 hover:shadow-blue-500/50",
                          "hover:-translate-y-px active:translate-y-0",
                          "ring-1 ring-white/10 hover:ring-cyan-400/30",
                          "transition-all duration-150",
                          "disabled:shadow-none disabled:translate-y-0 disabled:ring-white/5",
                        ].join(" ")}
                      >
                        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-gradient-to-b from-white/10 to-transparent" />
                        <span className="relative font-bold text-cyan-200 group-hover:text-white transition-colors">₳</span>
                        <span className="relative">Send 5 tADA</span>
                        <span className="relative text-blue-200 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-150">→</span>
                      </button>
                    );
                  }

                  if (ss.status === "Paid") {
                    return <span className="text-green-400 text-xs font-medium">Paid ✓</span>;
                  }

                  // Rejected or Expired
                  return <span className="text-gray-600 text-xs capitalize">{ss.status}</span>;
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
