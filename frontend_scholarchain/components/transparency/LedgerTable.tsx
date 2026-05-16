"use client";
import type { TransactionSummary } from "@/types";
import TxHashLink from "./TxHashLink";
import { shortenAddress } from "@/lib/utils/addressUtils";

interface LedgerTableProps {
  transactions: TransactionSummary[];
  loading: boolean;
  page: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-800">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-800 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function LedgerTable({
  transactions,
  loading,
  page,
  pageSize = 10,
  onPageChange,
}: LedgerTableProps) {
  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const paginated = transactions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-500 uppercase bg-gray-900 border-b border-gray-800">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3 hidden sm:table-cell">Recipient</th>
              <th className="px-4 py-3">TxHash</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-600 text-sm">
                  No transactions found.
                </td>
              </tr>
            ) : (
              paginated.map((tx, idx) => (
                <tr key={`${tx.txHash}-${idx}`} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(tx.blockTimeISO).toLocaleDateString("en-PH", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {tx.adaAmount.toFixed(2)} <span className="text-gray-500 text-xs">ADA</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-400 text-xs">
                    {tx.scholarName ?? shortenAddress(tx.recipientAddress)}
                  </td>
                  <td className="px-4 py-3">
                    <TxHashLink txHash={tx.txHash} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-gray-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
