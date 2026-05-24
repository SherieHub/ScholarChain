"use client";
import { shortenAddress } from "@/lib/utils/addressUtils";

interface AccessDeniedProps {
  walletAddress?: string;
  onDisconnect: () => void;
}

export default function AccessDenied({ walletAddress, onDisconnect }: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 px-4 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">
        🚫
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          No Scholar Badge NFT was found in this wallet. You must hold a valid Scholar Badge to access the portal.
        </p>
      </div>
      {walletAddress && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 w-full text-left">
          <p className="text-xs text-slate-500 mb-1">Connected Wallet</p>
          <p className="font-mono text-sm text-slate-300">{shortenAddress(walletAddress)}</p>
        </div>
      )}
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl px-4 py-3 text-sm text-amber-300 text-left w-full">
        Contact your scholarship administrator to have your Scholar Badge minted and sent to this wallet.
      </div>
      <button
        onClick={onDisconnect}
        className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white border border-white/[0.10] hover:border-white/[0.22] bg-white/[0.04] hover:bg-white/[0.08] rounded-xl px-5 py-2.5 transition-all duration-150 font-medium"
      >
        Disconnect &amp; Try Another Wallet
      </button>
    </div>
  );
}
