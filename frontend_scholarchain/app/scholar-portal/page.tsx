"use client";
import { useEffect, useState } from "react";
import { useWallet, useLovelace, CardanoWallet } from "@meshsdk/react";
import { useNFTVerification } from "@/hooks/useNFTVerification";
import ScholarDashboard from "@/components/dashboard/ScholarDashboard";
import AccessDenied from "@/components/wallet/AccessDenied";
import NFTScanningState from "@/components/wallet/NFTScanningState";
import BackButton from "@/components/ui/BackButton";

export default function ScholarPortalPage() {
  const { connected, wallet, disconnect } = useWallet();
  const lovelace = useLovelace();
  const { portalState, scholar, error, reset } = useNFTVerification();
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    if (!connected || !wallet) { setWalletAddress(""); return; }
    wallet.getUsedAddresses().then(addrs => {
      if (addrs.length > 0) setWalletAddress(addrs[0]);
      else wallet.getChangeAddress().then(setWalletAddress);
    }).catch(() => {});
  }, [connected, wallet]);

  const adaBalance = lovelace ? (Number(lovelace) / 1_000_000).toFixed(2) : "—";

  const handleDisconnect = () => {
    disconnect();
    reset();
  };

  return (
    <main className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold mb-1">Scholar Portal</h1>
          <p className="text-slate-400 text-sm">
            Connect your wallet to verify your Scholar Badge and access your profile.
          </p>
        </div>

        {portalState === "disconnected" && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-sm text-slate-400">
              Connect a wallet that holds your Scholar Badge NFT to proceed.
            </p>
            <CardanoWallet />
          </div>
        )}

        {portalState === "scanning" && <NFTScanningState />}

        {portalState === "authorized" && scholar && (
          <ScholarDashboard
            scholar={scholar}
            walletBalance={adaBalance}
            onDisconnect={handleDisconnect}
          />
        )}

        {portalState === "denied" && (
          <AccessDenied walletAddress={walletAddress} onDisconnect={handleDisconnect} />
        )}

        {error && portalState === "denied" && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}
      </div>
    </main>
  );
}
