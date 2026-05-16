"use client";
import { useEffect, useState } from "react";
import { useWallet, useLovelace } from "@meshsdk/react";
import { useNFTVerification } from "@/hooks/useNFTVerification";
import ScholarDashboard from "@/components/dashboard/ScholarDashboard";
import AccessDenied from "@/components/wallet/AccessDenied";
import NFTScanningState from "@/components/wallet/NFTScanningState";
import WalletGate from "@/components/wallet/WalletGate";
import BackButton from "@/components/ui/BackButton";

function PortalContent() {
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

  if (portalState === "signing") {
    return (
      <div className="flex flex-col items-center gap-6 py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-3xl">
          ✍️
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Signature Required</h2>
          <p className="text-slate-400 text-sm">
            Please sign the authentication challenge in your wallet to verify your identity.
          </p>
        </div>
        <div className="flex items-center gap-2 text-indigo-400 text-sm">
          <div className="h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          Waiting for signature...
        </div>
        <button
          onClick={handleDisconnect}
          className="text-sm text-slate-500 hover:text-slate-300 underline transition-colors"
        >
          Cancel and disconnect
        </button>
      </div>
    );
  }

  if (portalState === "scanning") return <NFTScanningState />;

  if (portalState === "authorized" && scholar) {
    return (
      <ScholarDashboard
        scholar={scholar}
        walletBalance={adaBalance}
        onDisconnect={handleDisconnect}
      />
    );
  }

  if (portalState === "denied") {
    return (
      <div className="flex flex-col gap-4">
        <AccessDenied walletAddress={walletAddress} onDisconnect={handleDisconnect} />
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>
    );
  }

  return null;
}

export default function ScholarPortalPage() {
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
        <WalletGate message="Connect your Cardano wallet to begin. You will be asked to sign an authentication challenge.">
          <PortalContent />
        </WalletGate>
      </div>
    </main>
  );
}
