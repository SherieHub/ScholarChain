"use client";

import { useState } from "react";
import SendScholarshipForm from "@/components/forms/SendScholarshipForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SuccessMessage from "@/components/ui/SuccessMessage";
import ErrorMessage from "@/components/ui/ErrorMessage";
import BackButton from "@/components/ui/BackButton";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { sendADA } from "@/lib/mesh/sendAda";
import { parseTxError } from "@/lib/mesh/errorHandler";
import WalletStatus from "@/components/wallet/WalletStatus";

type TxState = "idle" | "processing" | "success" | "error";

export default function AdminDashboard() {
  const { connected, wallet } = useWalletConnection();
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSend = async (address: string, amount: number) => {
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

  const resetTx = () => {
    setErrorMsg("");
    setTxState("idle");
  };

  return (
    <main className="relative flex flex-col items-center py-16 px-4 flex-1 overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/8 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg flex flex-col gap-6">
        <BackButton />

        <div>
          <h1 className="text-3xl font-bold text-gradient-animated mb-1">
            Admin Dashboard
          </h1>
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

        <div>
          {txState === "idle" && (
            <SendScholarshipForm
              onSubmit={handleSend}
              isLoading={false}
              isConnected={connected}
            />
          )}
          {txState === "processing" && <LoadingSpinner />}
          {txState === "success" && (
            <SuccessMessage txHash={txHash} onReset={resetTx} />
          )}
          {txState === "error" && (
            <ErrorMessage error={errorMsg} onDismiss={resetTx} />
          )}
        </div>
      </div>
    </main>
  );
}
