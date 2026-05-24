interface PledgeVsBalanceCardProps {
  totalPledgedADA: number;
  liveBalanceADA: number;
  totalPaidOutADA: number;
  discrepancyADA: number;
  isAccountable: boolean;
  loading: boolean;
}

function StatCard({
  label,
  value,
  source,
  loading,
}: {
  label: string;
  value: string;
  source: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-2">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      {loading ? (
        <div className="h-8 w-32 bg-white/[0.06] rounded-lg animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-white">
          {value} <span className="text-sm font-normal text-slate-400">ADA</span>
        </p>
      )}
      <p className="text-xs text-slate-600">{source}</p>
    </div>
  );
}

export default function PledgeVsBalanceCard({
  totalPledgedADA,
  liveBalanceADA,
  totalPaidOutADA,
  discrepancyADA,
  isAccountable,
  loading,
}: PledgeVsBalanceCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Pledged"
          value={totalPledgedADA.toFixed(2)}
          source="📄 Firebase — sponsor pledges"
          loading={loading}
        />
        <StatCard
          label="Live Treasury Balance"
          value={liveBalanceADA.toFixed(2)}
          source="⛓️ Cardano Blockchain — Blockfrost"
          loading={loading}
        />
        <StatCard
          label="Total Paid Out"
          value={totalPaidOutADA.toFixed(2)}
          source="⛓️ Cardano Blockchain — Blockfrost"
          loading={loading}
        />
      </div>

      <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
        loading
          ? "bg-white/[0.02] border-white/[0.06]"
          : isAccountable
          ? "bg-green-900/10 border-green-700/30"
          : "bg-amber-900/10 border-amber-700/30"
      }`}>
        {loading ? (
          <div className="h-5 w-48 bg-white/[0.06] rounded animate-pulse" />
        ) : (
          <>
            <span className="text-2xl">{isAccountable ? "✅" : "⚠️"}</span>
            <div>
              <p className={`font-semibold text-sm ${isAccountable ? "text-green-300" : "text-amber-300"}`}>
                {isAccountable ? "Fully Accountable" : "Discrepancy Detected"}
              </p>
              {!isAccountable && (
                <p className="text-xs text-amber-400 mt-0.5">
                  Unaccounted: {discrepancyADA.toFixed(2)} ADA
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
