"use client";

import { useWalletConnection } from "@/hooks/useWalletConnection";

export default function WalletStatus() {
  const { connected, address, balance, name } = useWalletConnection();

  if (!connected) return null;

  const shortAddress = address
    ? `${address.slice(0, 16)}...${address.slice(-6)}`
    : "—";

  const adaDisplay = balance
    ? (Number(balance) / 1_000_000).toFixed(2)
    : "—";

  return (
    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 text-sm backdrop-blur-sm">
      <span className="text-yellow-400 text-xs font-semibold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
        PREPROD
      </span>
      <span className="text-slate-400 hidden sm:inline">
        {name ?? "Wallet"}
      </span>
      <span className="text-slate-300 font-mono text-xs">{shortAddress}</span>
      <span className="text-emerald-400 font-semibold">{adaDisplay} tADA</span>
    </div>
  );
}
