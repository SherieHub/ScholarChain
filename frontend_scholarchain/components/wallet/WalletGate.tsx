"use client";

import { useWallet } from "@meshsdk/react";
import { useMeshReady } from "@/app/providers";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";

interface WalletGateProps {
  children: React.ReactNode;
  message?: string;
}

export default function WalletGate({
  children,
  message = "Connect your Cardano wallet to continue.",
}: WalletGateProps) {
  const meshReady = useMeshReady();
  const { connected } = useWallet();

  if (!meshReady) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
        <div className="h-4 w-48 bg-white/[0.07] rounded-lg" />
        <div className="h-4 w-64 bg-white/[0.05] rounded-lg" />
        <div className="h-10 w-40 bg-white/[0.07] rounded-xl" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex flex-col items-center gap-5 text-center">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-2xl">
          🔒
        </div>
        <div>
          <p className="text-white font-medium text-sm mb-1">Wallet Required</p>
          <p className="text-slate-400 text-sm">{message}</p>
        </div>
        <WalletConnectButton />
      </div>
    );
  }

  return <>{children}</>;
}
