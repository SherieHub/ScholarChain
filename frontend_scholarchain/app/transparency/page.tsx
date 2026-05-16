"use client";
import { useState } from "react";
import BackButton from "@/components/ui/BackButton";
import PledgeVsBalanceCard from "@/components/transparency/PledgeVsBalanceCard";
import DiscrepancyBanner from "@/components/transparency/DiscrepancyBanner";
import LedgerTable from "@/components/transparency/LedgerTable";
import { useTreasuryData } from "@/hooks/useTreasuryData";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";

export default function TransparencyPage() {
  const { discrepancyADA, isAccountable } = useTreasuryData();
  const { transactions, loading } = useTransactionHistory();
  const [page, setPage] = useState(1);

  return (
    <main className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <BackButton />

        <div>
          <h1 className="text-3xl font-bold mb-1">Transparency Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Live on-chain data — no wallet connection required.
          </p>
        </div>

        <PledgeVsBalanceCard />

        {!isAccountable && discrepancyADA > 0 && (
          <DiscrepancyBanner discrepancyADA={discrepancyADA} />
        )}

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Outgoing Transaction Ledger</h2>
          <LedgerTable
            transactions={transactions}
            loading={loading}
            page={page}
            pageSize={10}
            onPageChange={setPage}
          />
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
