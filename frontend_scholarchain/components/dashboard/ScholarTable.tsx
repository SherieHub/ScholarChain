import type { Scholar } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import TxHashLink from "@/components/transparency/TxHashLink";
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
                {mintingId === scholar.id ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-purple-400 text-xs">Minting NFT...</span>
                  </div>
                ) : processingId === scholar.id ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-blue-400 text-xs">Sending...</span>
                  </div>
                ) : scholar.status === "Pending" ? (
                  <button
                    onClick={() => onMint(scholar)}
                    disabled={mintingId !== null || processingId !== null}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Mint Scholar ID 🎖️
                  </button>
                ) : scholar.status === "Approved" && scholar.lastPaidTxHash ? (
                  <span className="text-green-400 text-xs font-medium">Paid ✓</span>
                ) : scholar.status === "Approved" ? (
                  <button
                    onClick={() => onSend(scholar)}
                    disabled={processingId !== null || mintingId !== null}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Send 5 tADA →
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
