"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { addSponsor } from "@/lib/firebase/sponsors";
import { getUniversityConfig } from "@/lib/firebase/config-store";
import { sendADA } from "@/lib/mesh/sendAda";
import { parseTxError } from "@/lib/mesh/errorHandler";
import { getWalletAddressBech32, shortenAddress } from "@/lib/utils/addressUtils";
import TxHashLink from "@/components/transparency/TxHashLink";

type FormState = "idle" | "submitting" | "success" | "error";

function SponsorFormInner() {
  const { wallet, connected, name: walletName } = useWallet();
  const [sponsorName, setSponsorName] = useState("");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [submittedAmount, setSubmittedAmount] = useState(0);

  useEffect(() => {
    if (!connected || !wallet) { setWalletAddress(""); return; }
    getWalletAddressBech32(wallet).then(addr => { if (addr) setWalletAddress(addr); });
  }, [wallet, connected]);

  const validate = (): string | null => {
    if (sponsorName.trim().length < 2) return "Sponsor name must be at least 2 characters.";
    const parsed = Number(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) return "Pledge amount must be a positive number.";
    if (!walletAddress) return "Wallet address could not be read. Please reconnect.";
    return null;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");
    setFormState("submitting");

    try {
      const config = await getUniversityConfig();
      const treasuryAddress = config.adminWalletAddresses?.[0];
      if (!treasuryAddress) throw new Error("Treasury wallet not configured. Contact the administrator.");

      const hash = await sendADA(wallet, treasuryAddress, amount);

      await addSponsor({
        sponsorName: sponsorName.trim(),
        walletAddress: walletAddress.trim(),
        pledgedAmount: Number(amount),
        txHash: hash,
      });

      setTxHash(hash);
      setSubmittedName(sponsorName.trim());
      setSubmittedAmount(Number(amount));
      setFormState("success");
    } catch (err: unknown) {
      setErrorMsg(parseTxError(err));
      setFormState("error");
    }
  };

  const reset = () => {
    setSponsorName("");
    setAmount("");
    setErrorMsg("");
    setTxHash("");
    setFormState("idle");
  };

  if (formState === "success") {
    return (
      <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">✅</div>
          <div>
            <h3 className="font-semibold text-green-300">Pledge Sent On-Chain!</h3>
            <p className="text-green-400 text-sm">Thank you for supporting ScholarChain.</p>
          </div>
        </div>

        <div className="bg-white/[0.04] rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Sponsor</span>
            <span className="text-white font-medium">{submittedName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount Sent</span>
            <span className="text-green-300 font-medium">{submittedAmount} tADA</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Transaction</span>
            <TxHashLink txHash={txHash} label={`${txHash.slice(0, 14)}…`} />
          </div>
        </div>

        <button onClick={reset} className="text-sm text-blue-400 hover:text-blue-300 underline self-start transition-colors">
          Register another sponsor
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-5">

      {walletAddress && (
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs text-slate-400">
            Sending from{" "}
            <span className="font-mono text-slate-200">{shortenAddress(walletAddress)}</span>
            {walletName && <span className="text-slate-500 capitalize"> · {walletName}</span>}
          </span>
        </div>
      )}

      <h2 className="text-lg font-semibold text-white">Sponsor Registration</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Sponsor / Organization Name</label>
          <input
            type="text"
            value={sponsorName}
            onChange={e => setSponsorName(e.target.value)}
            placeholder="e.g. Acme Corporation"
            className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Pledge Amount (ADA)</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 pr-16 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">ADA</span>
          </div>
          <p className="text-xs text-slate-500">ADA will be sent directly to the treasury wallet on-chain.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Your Wallet Address</label>
          <input
            type="text"
            readOnly
            value={walletAddress || "Loading from wallet…"}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-400 cursor-default"
          />
          <p className="text-xs text-slate-500">Auto-filled from your connected wallet.</p>
        </div>

        {(formState === "error" || errorMsg) && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-2.5">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={formState === "submitting" || !walletAddress}
          className="mt-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-60 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors"
        >
          {formState === "submitting" ? "Sending Pledge…" : "Send Pledge On-Chain ₳"}
        </button>

        <p className="text-xs text-slate-600 text-center">
          Your wallet will ask you to sign the transaction. tADA is sent to the scholarship treasury.
        </p>
      </form>
    </div>
  );
}

export default function SponsorEntryForm() {
  return <SponsorFormInner />;
}
