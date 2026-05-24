interface DiscrepancyBannerProps {
  discrepancyADA: number;
}

export default function DiscrepancyBanner({ discrepancyADA }: DiscrepancyBannerProps) {
  return (
    <div className="w-full bg-amber-900/20 border border-amber-700/40 rounded-xl px-5 py-3 flex items-center gap-3">
      <span className="text-xl shrink-0">⚠️</span>
      <div>
        <p className="text-amber-300 font-semibold text-sm">Discrepancy Detected</p>
        <p className="text-amber-400 text-xs mt-0.5">
          {discrepancyADA.toFixed(2)} tADA cannot be accounted for by the live balance and paid-out transactions.
          This may indicate pending withdrawals or data latency.
        </p>
      </div>
    </div>
  );
}
