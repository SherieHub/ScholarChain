"use client";

import { useState } from "react";
import { useScholarData } from "@/hooks/useScholarData";
import ScholarTable, { SkeletonRow } from "@/components/dashboard/ScholarTable";
import TxHashLink from "@/components/transparency/TxHashLink";
import SendScholarshipForm from "@/components/forms/SendScholarshipForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SuccessMessage from "@/components/ui/SuccessMessage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import BackButton from "@/components/ui/BackButton";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { sendADA } from "@/lib/mesh/sendAda";
import { markScholarAsPaid } from "@/lib/firebase/scholars";
import { parseTxError } from "@/lib/mesh/errorHandler";
import WalletStatus from "@/components/wallet/WalletStatus";
import type { Scholar } from "@/types";

// TODO [Increment 4]: Replace with dynamic per-scholar amount input
const SCHOLARSHIP_AMOUNT_ADA = "5";

type TxState = "idle" | "processing" | "success" | "error";
type ActiveTab = "table" | "manual";

export default function AdminDashboard() {
  const { connected, name: walletName } = useWalletConnection();
  const { scholars, loading, error, refresh } = useScholarData("Approved");

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  // Tracks txHash when DB write fails after a successful on-chain tx
  const [rowWarnings, setRowWarnings] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<ActiveTab>("table");

  // Manual send tab state (Increment 1 backward compat)
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSendToScholar = async (scholar: Scholar) => {
    if (!walletName || !scholar.id) return;
    setProcessingId(scholar.id);
    setRowErrors(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    setRowWarnings(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    try {
      const hash = await sendADA(walletName, scholar.walletAddress, SCHOLARSHIP_AMOUNT_ADA);
      try {
        await markScholarAsPaid(scholar.id, hash);
      } catch (dbErr) {
        // Transaction is confirmed on-chain — show the TxHash so the Admin can record it
        console.error("DB update failed after successful tx:", dbErr);
        setRowWarnings(prev => ({ ...prev, [scholar.id!]: hash }));
      }
      refresh();
    } catch (err: unknown) {
      setRowErrors(prev => ({ ...prev, [scholar.id!]: parseTxError(err) }));
    } finally {
      setProcessingId(null);
    }
  };

  const handleManualSend = async (address: string, amount: number) => {
    if (!walletName) return;
    setTxState("processing");
    setErrorMsg("");
    try {
      const hash = await sendADA(walletName, address, amount.toString());
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
      {/* Background glows */}
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

        {/* Tab switcher */}
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
                processingId={processingId}
                amountAda={SCHOLARSHIP_AMOUNT_ADA}
                isConnected={connected}
              />
            )}
            {Object.entries(rowWarnings).map(([id, hash]) => (
              <div key={id} role="alert" className="flex flex-wrap items-center gap-2 text-amber-300 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <span>⚠ Payment sent on-chain but record update failed. Save this TxHash manually:</span>
                <TxHashLink txHash={hash} short={false} />
              </div>
            ))}
            {Object.entries(rowErrors).map(([id, msg]) => (
              <div key={id} role="alert" className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                Transaction error: {msg}
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
