"use client";

import dynamic from "next/dynamic";
import { useMeshReady } from "@/app/providers";

// WalletModal imports useWallet + @meshsdk/core — must never run server-side
const WalletModal = dynamic(
  () => import("@/components/wallet/WalletModal"),
  { ssr: false }
);

export default function WalletConnectButton() {
  const meshReady = useMeshReady();

  if (!meshReady) {
    return (
      <div
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl animate-pulse"
        style={{
          background:
            "linear-gradient(135deg,rgba(29,78,216,0.25),rgba(79,70,229,0.25))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="w-4 h-4 rounded-full bg-white/20" />
        <div className="w-24 h-3 rounded-full bg-white/20" />
      </div>
    );
  }

  return <WalletModal />;
}
