import type { Scholar } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import TxHashLink from "@/components/transparency/TxHashLink";
import MintNFTButton from "@/components/dashboard/MintNFTButton";
import { shortenAddress } from "@/lib/utils/addressUtils";

interface ScholarTableProps {
  scholars: Scholar[];
  onSend: (scholar: Scholar) => void;
  onMint: (scholar: Scholar) => void;
  processingId: string | null;
  mintingId: string | null;
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
  processingId,
  mintingId,
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
                {scholar.lastPaidTxHash ? (
                  <TxHashLink txHash={scholar.lastPaidTxHash} label="Paid ✓" />
                ) : (
                  <span className="text-gray-600 text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {processingId === scholar.id ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-950/60 border border-sky-500/30 rounded-lg">
                    <div className="h-3.5 w-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sky-300 text-xs font-medium tracking-wide">Sending...</span>
                  </div>
                ) : scholar.status === "Pending" ? (
                  <MintNFTButton
                    scholar={scholar}
                    onMint={onMint}
                    isMinting={mintingId === scholar.id}
                    disabled={mintingId !== null || processingId !== null}
                  />
                ) : scholar.status === "Approved" && scholar.lastPaidTxHash ? (
                  <span className="text-green-400 text-xs font-medium">Paid ✓</span>
                ) : scholar.status === "Approved" ? (
                  <button
                    onClick={() => onSend(scholar)}
                    disabled={processingId !== null || mintingId !== null}
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
                    {/* Subtle inner shimmer on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150
                                 bg-gradient-to-b from-white/10 to-transparent"
                    />
                    <span className="relative font-bold text-cyan-200 group-hover:text-white transition-colors">
                      ₳
                    </span>
                    <span className="relative">Send 5 tADA</span>
                    <span className="relative text-blue-200 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-150">
                      →
                    </span>
                  </button>
                ) : (
                  <span className="text-gray-600 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
