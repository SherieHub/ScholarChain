"use client";
import { useState } from "react";
import BackButton from "@/components/ui/BackButton";
import PledgeVsBalanceCard from "@/components/transparency/PledgeVsBalanceCard";
import DiscrepancyBanner from "@/components/transparency/DiscrepancyBanner";
import LedgerTable from "@/components/transparency/LedgerTable";
import { useTreasuryData } from "@/hooks/useTreasuryData";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";

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

export default function TransparencyPage() {
  const treasury = useTreasuryData();
  const txHistory = useTransactionHistory();
  const [page, setPage] = useState(1);

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

        {treasury.error ? (
          <ErrorAlert
            message={treasury.error}
            onRetry={treasury.refetch}
          />
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
          <p><span className="text-slate-500">Total Pledged</span> — sourced from Firebase (sponsor registration records)</p>
          <p><span className="text-slate-500">Live Treasury Balance</span> — sourced from Cardano Preprod via Blockfrost API</p>
          <p><span className="text-slate-500">Transaction Ledger</span> — outgoing transactions from the admin wallet on Cardano Preprod</p>
          <p><span className="text-slate-500">Recipient names</span> — masked to protect scholar privacy (first name + last initial)</p>
        </div>
      </div>
    </main>
  );
}
