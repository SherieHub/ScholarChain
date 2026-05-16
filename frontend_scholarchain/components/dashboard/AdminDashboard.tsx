"use client";

import { useState } from "react";
import { useScholarData } from "@/hooks/useScholarData";
import ScholarTable, { SkeletonRow } from "@/components/dashboard/ScholarTable";
import SendScholarshipForm from "@/components/forms/SendScholarshipForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SuccessMessage from "@/components/ui/SuccessMessage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import BackButton from "@/components/ui/BackButton";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { sendADA } from "@/lib/mesh/sendAda";
import { markScholarAsPaid, updateScholarPolicyId } from "@/lib/firebase/scholars";
import { parseTxError } from "@/lib/mesh/errorHandler";
import { getUniversityConfig, updateNftPolicyId } from "@/lib/firebase/config-store";
import { mintScholarNFT } from "@/lib/mesh/mintNFT";
import WalletStatus from "@/components/wallet/WalletStatus";
import type { Scholar } from "@/types";

const SCHOLARSHIP_AMOUNT_ADA = "5";

type TxState = "idle" | "processing" | "success" | "error";
type ActiveTab = "table" | "manual";

export default function AdminDashboard() {
  const { connected, wallet } = useWalletConnection();
  const { scholars, loading, error, refresh } = useScholarData("all");

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<ActiveTab>("table");

  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSendToScholar = async (scholar: Scholar) => {
    if (!wallet || !scholar.id) return;
    setProcessingId(scholar.id);
    setRowErrors(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    try {
      const hash = await sendADA(wallet, scholar.walletAddress, SCHOLARSHIP_AMOUNT_ADA);
      try {
        await markScholarAsPaid(scholar.id, hash);
      } catch (dbErr) {
        console.error("DB update failed after successful tx:", dbErr);
      }
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
    setRowErrors(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    try {
      const config = await getUniversityConfig();
      const { txHash: mintTxHash, policyId, assetName } = await mintScholarNFT(
        wallet,
        scholar,
        config.badgeIPFSUri
      );
      try {
        await updateScholarPolicyId(scholar.id, policyId, assetName);
        if (!config.nftPolicyId) {
          await updateNftPolicyId(policyId);
        }
      } catch (dbErr) {
        console.error("DB update failed after mint:", dbErr);
      }
      setRowErrors(prev => ({
        ...prev,
        [`mint_${scholar.id}`]: `Minted ✓  tx: ${mintTxHash.slice(0, 14)}...`,
      }));
      refresh();
    } catch (err: unknown) {
      setRowErrors(prev => ({ ...prev, [scholar.id!]: parseTxError(err) }));
    } finally {
      setMintingId(null);
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

  return (
    <main className="relative flex flex-col items-center py-16 px-4 flex-1 overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/8 blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6">
        <BackButton />

        <div>
          <h1 className="text-3xl font-bold text-gradient-animated mb-1">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">ScholarChain · Preprod Testnet</p>
        </div>

        <WalletStatus />

        {!connected && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm backdrop-blur-sm"
          >
            Please connect your wallet to send scholarships.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm backdrop-blur-sm"
          >
            Failed to load scholars: {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "table"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Scholar Table
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "manual"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Manual Send
          </button>
        </div>

        {activeTab === "table" && (
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm">
                  <tbody>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </tbody>
                </table>
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
            {Object.entries(rowErrors).map(([id, msg]) => (
              <div
                key={id}
                className={`text-xs rounded-lg px-3 py-2 ${
                  id.startsWith("mint_")
                    ? "text-green-400 bg-green-500/10 border border-green-500/20"
                    : "text-red-400 bg-red-500/10 border border-red-500/20"
                }`}
              >
                {id.startsWith("mint_") ? msg : `Transaction error: ${msg}`}
              </div>
            ))}
          </div>
        )}

        {activeTab === "manual" && (
          <div className="max-w-lg">
            {txState === "idle" && (
              <SendScholarshipForm
                onSubmit={handleManualSend}
                isLoading={false}
                isConnected={connected}
              />
            )}
            {txState === "processing" && <LoadingSpinner />}
            {txState === "success" && <SuccessMessage txHash={txHash} onReset={resetManual} />}
            {txState === "error" && <ErrorMessage error={errorMsg} onDismiss={resetManual} />}
          </div>
        )}
      </div>
    </main>
  );
}
