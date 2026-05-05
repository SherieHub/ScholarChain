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
      <div className="w-36 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] animate-pulse" />
    );
  }

  return <WalletModal />;
}
