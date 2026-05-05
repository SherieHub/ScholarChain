"use client";

import { useState } from "react";
import SendScholarshipForm from "@/components/forms/SendScholarshipForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SuccessMessage from "@/components/ui/SuccessMessage";
import ErrorMessage from "@/components/ui/ErrorMessage";
// import WalletStatus from "@/components/wallet/WalletStatus"; uncomment when Austine's work is merged

type TxState = "idle" | "processing" | "success" | "error";

export default function AdminPage() {
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // STUB — Replace with Christian's sendADA() in Task C-03
  const handleSend = async (address: string, amount: number) => {
    console.log("Sending", amount, "ADA to", address);
    setTxState("processing");
    await new Promise((r) => setTimeout(r, 3000));
    setTxHash("mock_txhash_abc123def456");
    setTxState("success");
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    setTxState("error");
  };

  // TODO: swap isConnected with real value from Austine's useWalletConnection hook
  const isConnected = true;

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">ScholarChain · Preprod Testnet</p>

        {/* WalletStatus goes here when Austine's work is merged */}

        <div className="mt-6">
          {txState === "idle" && (
            <SendScholarshipForm
              onSubmit={handleSend}
              isLoading={false}
              isConnected={isConnected}
            />
          )}
          {txState === "processing" && <LoadingSpinner />}
          {txState === "success" && (
            <SuccessMessage
              txHash={txHash}
              onReset={() => setTxState("idle")}
            />
          )}
          {txState === "error" && (
            <ErrorMessage
              error={errorMsg}
              onDismiss={() => {
                setErrorMsg("");
                setTxState("idle");
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}