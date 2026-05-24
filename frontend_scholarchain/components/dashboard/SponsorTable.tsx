import type { Sponsor } from "@/types";
import TxHashLink from "@/components/transparency/TxHashLink";
import { shortenAddress } from "@/lib/utils/addressUtils";

interface SponsorTableProps {
  sponsors: Sponsor[];
  loading: boolean;
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

export default function SponsorTable({ sponsors, loading }: SponsorTableProps) {
  if (!loading && sponsors.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm border border-gray-800 rounded-xl">
        No sponsors recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-500 uppercase bg-gray-900 border-b border-gray-800">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Sponsor</th>
            <th className="px-4 py-3">Wallet</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Transaction</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
          ) : (
            sponsors.map((sponsor, idx) => (
              <tr
                key={sponsor.id}
                className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
              >
                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-white">{sponsor.sponsorName}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  {sponsor.walletAddress ? shortenAddress(sponsor.walletAddress) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-green-300 font-semibold">{sponsor.pledgedAmount}</span>
                  <span className="text-gray-500 text-xs ml-1">tADA</span>
                </td>
                <td className="px-4 py-3">
                  {sponsor.txHash ? (
                    <TxHashLink txHash={sponsor.txHash} label={`${sponsor.txHash.slice(0, 14)}…`} />
                  ) : (
                    <span className="text-gray-600 text-xs">Off-chain record</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {!loading && sponsors.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-800 flex justify-end">
          <span className="text-xs text-slate-500">
            Total pledged:{" "}
            <span className="text-green-300 font-semibold">
              {sponsors.reduce((s, sp) => s + sp.pledgedAmount, 0).toFixed(2)} tADA
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
