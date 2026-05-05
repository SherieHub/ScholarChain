import { sendADA } from "../../mesh/sendAda";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { parseTxError } from "../../mesh/errorHandling";
import { useState } from "react";

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
