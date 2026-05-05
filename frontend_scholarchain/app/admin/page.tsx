import { sendADA } from "../../mesh/sendAda";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { parseTxError } from "../../mesh/errorHandling";
import { useState } from "react";
"use client";

import dynamic from "next/dynamic";
// const { wallet, isConnected } = useWalletConnection();
const { wallet} = useWalletConnection();
const [txState, setTxState] = useState<"idle" | "processing" | "success" | "error">("idle");
const [txHash, setTxHash] = useState<string | null>(null);
const [errorMsg, setErrorMsg] = useState<string>("");

const handleSend = async (address: string, amount: string) => {
  if (!wallet) return;
  setTxState("processing");
  setErrorMsg("");
  try {
    const hash = await sendADA(wallet, address, amount);
    setTxHash(hash);
    setTxState("success");
  } catch (err: any) {
    const msg = err?.message ?? "An unexpected error occurred.";
    setErrorMsg(msg);
    setTxState("error");
    parseTxError(err);
  }
};


// AdminDashboard uses MeshJS (libsodium) which cannot run server-side.
// next/dynamic with ssr:false ensures it only renders in the browser.
const AdminDashboard = dynamic(
  () => import("@/components/dashboard/AdminDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading Admin Dashboard...</p>
      </div>
    ),
  }
);

export default function AdminPage() {
  return <AdminDashboard />;
}
