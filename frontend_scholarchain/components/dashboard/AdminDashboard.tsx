"use client";

import { useState, useEffect } from "react";
import { useScholarData } from "@/hooks/useScholarData";
import ScholarTable, { SkeletonRow } from "@/components/dashboard/ScholarTable";
import PendingRewardsTable from "@/components/dashboard/PendingRewardsTable";
import TreasuryMintPanel from "@/components/dashboard/TreasuryMintPanel";
import SendScholarshipForm from "@/components/forms/SendScholarshipForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SuccessMessage from "@/components/ui/SuccessMessage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import BackButton from "@/components/ui/BackButton";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { sendADA } from "@/lib/mesh/sendAda";
import { markScholarAsPaid, updateScholarPolicyId, getPendingRewardScholars, markRewardAsPaid } from "@/lib/firebase/scholars";
import { parseTxError } from "@/lib/mesh/errorHandler";
import { getUniversityConfig, updateNftPolicyId } from "@/lib/firebase/config-store";
import { mintScholarNFT } from "@/lib/mesh/mintNFT";
import { sendMultiAssetReward } from "@/lib/mesh/sendMultiAsset";
import WalletStatus from "@/components/wallet/WalletStatus";
import WalletGate from "@/components/wallet/WalletGate";
import TxHashLink from "@/components/transparency/TxHashLink";
import type { Scholar } from "@/types";

const SCHOLARSHIP_AMOUNT_ADA = "5";

type TxState = "idle" | "processing" | "success" | "error";
type ActiveTab = "table" | "manual" | "rewards" | "treasury";

export default function AdminDashboard() {
  const { wallet, address, connected, disconnect } = useWalletConnection();
  const { scholars, loading, error, refresh } = useScholarData("all");

  const [wrongWallet, setWrongWallet] = useState<string | null>(null);
  // Prevents a flash of dashboard content before the wallet check resolves
  const [walletChecked, setWalletChecked] = useState(false);

  // Validate connected wallet against the stored admin address in Firestore config
  useEffect(() => {
    if (!connected || !address) {
      setWrongWallet(null);
      setWalletChecked(false);
      return;
    }
    setWalletChecked(false);
    getUniversityConfig()
      .then(config => {
        if (
          config.adminWalletAddress &&
          config.adminWalletAddress.trim() !== "" &&
          address.trim() !== config.adminWalletAddress.trim()
        ) {
          setWrongWallet(config.adminWalletAddress);
        } else {
          setWrongWallet(null);
        }
      })
      .catch(() => setWrongWallet(null)) // config missing → allow through
      .finally(() => setWalletChecked(true));
  }, [connected, address]);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [rewardProcessingId, setRewardProcessingId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  // Separate state for mint successes so we can render TxHashLink (not just plain text)
  const [mintSuccesses, setMintSuccesses] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<ActiveTab>("table");
  const [pendingRewards, setPendingRewards] = useState<Scholar[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);

  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const loadPendingRewards = async () => {
    setRewardsLoading(true);
    try {
      const data = await getPendingRewardScholars();
      setPendingRewards(data);
    } catch {
      setPendingRewards([]);
    } finally {
      setRewardsLoading(false);
    }
  };

  const handleSendToScholar = async (scholar: Scholar) => {
    if (!wallet || !scholar.id) return;
    setProcessingId(scholar.id);
    setRowErrors(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    try {
      const hash = await sendADA(wallet, scholar.walletAddress, SCHOLARSHIP_AMOUNT_ADA);
      try { await markScholarAsPaid(scholar.id, hash); } catch (dbErr) { console.error(dbErr); }
      refresh();
    } catch (err: unknown) {
      setRowErrors(prev => ({ ...prev, [scholar.id!]: parseTxError(err) }));
    } finally {
      setProcessingId(null);
    }
  };

  const handleMint = async (scholar: Scholar) => {
    if (!wallet || !scholar.id) return;
    setMintingId(scholar.id);
    // Clear any prior error or success for this scholar
    setRowErrors(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    setMintSuccesses(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    try {
      const config = await getUniversityConfig();
      const { txHash: mintTxHash, policyId, assetName } = await mintScholarNFT(wallet, scholar, config.badgeIPFSUri);
      try {
        await updateScholarPolicyId(scholar.id, policyId, assetName);
        if (!config.nftPolicyId) await updateNftPolicyId(policyId);
      } catch (dbErr) { console.error(dbErr); }
      setMintSuccesses(prev => ({ ...prev, [scholar.id!]: mintTxHash }));
      refresh();
    } catch (err: unknown) {
      setRowErrors(prev => ({ ...prev, [scholar.id!]: parseTxError(err) }));
    } finally {
      setMintingId(null);
    }
  };

  const handleApproveReward = async (scholar: Scholar, adaAmount: number, tokenAmount: number) => {
    if (!wallet || !scholar.id) return;
    setRewardProcessingId(scholar.id);
    try {
      const { txHash: rewardTxHash } = await sendMultiAssetReward(wallet, scholar.walletAddress, adaAmount, tokenAmount);
      await markRewardAsPaid(scholar.id, rewardTxHash, adaAmount, tokenAmount);
      await loadPendingRewards();
    } catch (err: unknown) {
      setRowErrors(prev => ({ ...prev, [`reward_${scholar.id}`]: parseTxError(err) }));
    } finally {
      setRewardProcessingId(null);
    }
  };

  const handleManualSend = async (address: string, amount: number) => {
    if (!wallet) return;
    setTxState("processing");
    setErrorMsg("");
    try {
      const hash = await sendADA(wallet, address, amount.toString());
      setTxHash(hash);
      setTxState("success");
    } catch (err: unknown) {
      setErrorMsg(parseTxError(err));
      setTxState("error");
    }
  };

  const resetManual = () => { setErrorMsg(""); setTxState("idle"); };

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "table", label: "Scholar Table" },
    { id: "manual", label: "Manual Send" },
    { id: "rewards", label: "Rewards" },
    { id: "treasury", label: "Treasury" },
  ];

  return (
    <main className="relative flex flex-col items-center py-16 px-4 flex-1 overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/8 blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6">
        <BackButton href="/" />

        <WalletGate role="admin" message="Connect your admin wallet to manage scholars and send scholarships.">

        <div>
          <h1 className="text-3xl font-bold text-gradient-animated mb-1">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">ScholarChain · Preprod Testnet</p>
        </div>

        <WalletStatus />

        {/* Wallet check in progress — prevent flash of dashboard content */}
        {connected && !walletChecked ? (
          <div className="flex items-center gap-3 py-10 justify-center text-slate-500 text-sm">
            <div className="h-4 w-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
            Verifying wallet…
          </div>
        ) : wrongWallet ? (
          /* Wrong wallet — full blocking screen, no dashboard content shown */
          <div className="flex flex-col items-center gap-6 py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">
              🚫
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Wrong Wallet Connected</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                This dashboard is reserved for the designated admin wallet.
                Disconnect and reconnect with the correct wallet to proceed.
              </p>
            </div>
            <div className="w-full max-w-sm flex flex-col gap-2">
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-left">
                <p className="text-xs text-slate-500 mb-1">Currently Connected</p>
                <p className="font-mono text-xs text-red-400 break-all">{address}</p>
              </div>
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-left">
                <p className="text-xs text-slate-500 mb-1">Expected Admin Wallet</p>
                <p className="font-mono text-xs text-slate-400">
                  {wrongWallet.slice(0, 20)}…
                </p>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              Disconnect &amp; Switch Wallet
            </button>
          </div>
        ) : (
          <>

        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm backdrop-blur-sm">
            Failed to load scholars: {error}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (id === "rewards") loadPendingRewards();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "table" && (
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm"><tbody><SkeletonRow /><SkeletonRow /><SkeletonRow /></tbody></table>
              </div>
            ) : (
              <ScholarTable
                scholars={scholars}
                onSend={handleSendToScholar}
                onMint={handleMint}
                processingId={processingId}
                mintingId={mintingId}
              />
            )}

            {/* Mint success banners — use TxHashLink for third-party verifiability */}
            {Object.entries(mintSuccesses).map(([scholarId, hash]) => (
              <div key={scholarId} className="flex items-center gap-3 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <span className="text-green-400 font-medium">Scholar ID Minted ✓</span>
                <TxHashLink txHash={hash} label={`${hash.slice(0, 14)}...`} />
              </div>
            ))}

            {/* Transaction error banners */}
            {Object.entries(rowErrors).map(([id, msg]) => (
              <div key={id} className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                Transaction error: {msg}
              </div>
            ))}
          </div>
        )}

        {activeTab === "manual" && (
          <div className="max-w-lg">
            {txState === "idle" && <SendScholarshipForm onSubmit={handleManualSend} isLoading={false} isConnected={true} />}
            {txState === "processing" && <LoadingSpinner />}
            {txState === "success" && <SuccessMessage txHash={txHash} onReset={resetManual} />}
            {txState === "error" && <ErrorMessage error={errorMsg} onDismiss={resetManual} />}
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="flex flex-col gap-3">
            {rewardsLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <PendingRewardsTable
                scholars={pendingRewards}
                onApproveReward={handleApproveReward}
                processingId={rewardProcessingId}
              />
            )}
            {Object.entries(rowErrors)
              .filter(([id]) => id.startsWith("reward_"))
              .map(([id, msg]) => (
                <div key={id} className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {msg}
                </div>
              ))}
          </div>
        )}

        {activeTab === "treasury" && <TreasuryMintPanel />}

          </> /* closes the normal-dashboard branch of the ternary */
        )} {/* closes the walletChecked / wrongWallet ternary */}

        </WalletGate>
      </div>
    </main>
  );
}
