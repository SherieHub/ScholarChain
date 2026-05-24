"use client";
import { useState, useEffect } from "react";
import BackButton from "@/components/ui/BackButton";
import PledgeVsBalanceCard from "@/components/transparency/PledgeVsBalanceCard";
import DiscrepancyBanner from "@/components/transparency/DiscrepancyBanner";
import LedgerTable from "@/components/transparency/LedgerTable";
import TxHashLink from "@/components/transparency/TxHashLink";
import { useTreasuryData } from "@/hooks/useTreasuryData";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { getAllSponsors } from "@/lib/firebase/sponsors";
import { shortenAddress } from "@/lib/utils/addressUtils";
import type { Sponsor } from "@/types";

function ErrorAlert({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-800/50 bg-red-950/30 px-4 py-3">
      <span className="shrink-0 text-red-400">⚠️</span>
      <div className="flex-1 min-w-0">
        <p className="text-red-300 text-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="shrink-0 text-xs text-red-300 hover:text-white border border-red-700/50 hover:border-red-400/60 rounded-lg px-3 py-1.5 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function TokenDistributedCard({ total, loading }: { total: number; loading: boolean }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-2">
      <p className="text-xs text-slate-500 uppercase tracking-wider">Total Scholar Tokens Distributed</p>
      {loading ? (
        <div className="h-8 w-40 bg-white/[0.06] rounded-lg animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-white">
          {total.toLocaleString()} <span className="text-sm font-normal text-slate-400">SCHL</span>
        </p>
      )}
      <p className="text-xs text-slate-600">⛓️ Firebase — confirmed token reward payouts</p>
    </div>
  );
}

function SponsorRow({ sponsor, idx }: { sponsor: Sponsor; idx: number }) {
  return (
    <tr className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-slate-500 text-xs">{idx + 1}</td>
      <td className="px-4 py-3 text-white font-medium text-sm">{sponsor.sponsorName}</td>
      <td className="px-4 py-3 font-mono text-xs text-slate-400">
        {sponsor.walletAddress ? shortenAddress(sponsor.walletAddress) : "—"}
      </td>
      <td className="px-4 py-3">
        <span className="text-green-300 font-semibold text-sm">{sponsor.pledgedAmount}</span>
        <span className="text-slate-500 text-xs ml-1">tADA</span>
      </td>
      <td className="px-4 py-3">
        {sponsor.txHash ? (
          <TxHashLink txHash={sponsor.txHash} label={`${sponsor.txHash.slice(0, 14)}…`} />
        ) : (
          <span className="text-slate-600 text-xs italic">Off-chain record</span>
        )}
      </td>
    </tr>
  );
}

export default function TransparencyPage() {
  const treasury = useTreasuryData();
  const txHistory = useTransactionHistory();
  const [page, setPage] = useState(1);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(true);

  useEffect(() => {
    getAllSponsors()
      .then(setSponsors)
      .catch(() => setSponsors([]))
      .finally(() => setSponsorsLoading(false));
  }, []);

  return (
    <main className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <BackButton href="/" />

        <div>
          <h1 className="text-3xl font-bold mb-1">Transparency Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Live on-chain data — no wallet connection required.
          </p>
        </div>

        {/* ── Treasury overview ── */}
        {treasury.error ? (
          <ErrorAlert message={treasury.error} onRetry={treasury.refetch} />
        ) : (
          <>
            <PledgeVsBalanceCard
              totalPledgedADA={treasury.totalPledgedADA}
              liveBalanceADA={treasury.liveBalanceADA}
              totalPaidOutADA={treasury.totalPaidOutADA}
              discrepancyADA={treasury.discrepancyADA}
              isAccountable={treasury.isAccountable}
              loading={treasury.loading}
            />
            {!treasury.loading && !treasury.isAccountable && treasury.discrepancyADA > 0 && (
              <DiscrepancyBanner discrepancyADA={treasury.discrepancyADA} />
            )}
          </>
        )}

        {/* ── Total Scholar Tokens Distributed ── */}
        <TokenDistributedCard
          total={treasury.totalTokensDistributed}
          loading={treasury.loading}
        />

        {/* ── Sponsor contributions ── */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Sponsor Contributions</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white/[0.02] border-b border-white/[0.06]">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Sponsor</th>
                  <th className="px-4 py-3">Wallet</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {sponsorsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.05]">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-white/[0.06] rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : sponsors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-600 text-sm">
                      No sponsor contributions recorded yet.
                    </td>
                  </tr>
                ) : (
                  sponsors.map((s, i) => <SponsorRow key={s.id} sponsor={s} idx={i} />)
                )}
              </tbody>
              {!sponsorsLoading && sponsors.length > 0 && (
                <tfoot className="border-t border-white/[0.06]">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-xs text-slate-500 text-right">Total</td>
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-semibold">
                        {sponsors.reduce((s, sp) => s + sp.pledgedAmount, 0).toFixed(2)}
                      </span>
                      <span className="text-slate-500 text-xs ml-1">tADA</span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ── Outgoing transaction ledger ── */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Outgoing Transaction Ledger</h2>
          {txHistory.error ? (
            <ErrorAlert
              message={txHistory.error}
              onRetry={() => { txHistory.refetch(); setPage(1); }}
            />
          ) : (
            <LedgerTable
              transactions={txHistory.transactions}
              loading={txHistory.loading}
              page={page}
              pageSize={10}
              onPageChange={setPage}
            />
          )}
        </div>

        <div className="border-t border-white/[0.06] pt-6 text-xs text-slate-600 space-y-1">
          <p><span className="text-slate-500">Total Pledged</span> — sourced from confirmed on-chain sponsor transactions recorded in Firebase</p>
          <p><span className="text-slate-500">Live Treasury Balance</span> — sourced from Cardano Preprod via Blockfrost API</p>
          <p><span className="text-slate-500">Total Scholar Tokens Distributed</span> — sum of all SCHL token rewards paid to scholars</p>
          <p><span className="text-slate-500">Transaction Ledger</span> — outgoing transactions from the admin wallet on Cardano Preprod</p>
          <p><span className="text-slate-500">Recipient names</span> — masked to protect scholar privacy (first name + last initial)</p>
        </div>
      </div>
    </main>
  );
}
