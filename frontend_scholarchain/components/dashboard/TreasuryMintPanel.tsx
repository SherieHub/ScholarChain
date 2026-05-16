"use client";
import { useState } from "react";
import { useWallet } from "@meshsdk/react";
import { mintTokenSupply } from "@/lib/mesh/mintTokens";
import { updateTokenPolicyId } from "@/lib/firebase/config-store";
import { parseTxError } from "@/lib/mesh/errorHandler";

export default function TreasuryMintPanel() {
  const { wallet } = useWallet();
  const [supplyAmount, setSupplyAmount] = useState("");
  const [minting, setMinting] = useState(false);
  const [result, setResult] = useState<{ txHash: string; policyId: string; supply: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleMint = async () => {
    const amount = Number(supplyAmount);
    if (!wallet || !amount || amount <= 0) return;
    setMinting(true);
    setErrorMsg("");
    try {
      const { txHash, policyId, supplyMinted } = await mintTokenSupply(wallet, amount);
      await updateTokenPolicyId(policyId, supplyMinted);
      setResult({ txHash, policyId, supply: supplyMinted });
      setSupplyAmount("");
    } catch (err: unknown) {
      setErrorMsg(parseTxError(err));
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-300">Mint SCHOLAR Token Supply</h3>
        <p className="text-xs text-slate-500">
          Mint the initial supply of SCHOLAR tokens to your admin wallet. These will be used as incentive rewards for scholars.
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            min="1"
            step="1"
            value={supplyAmount}
            onChange={e => setSupplyAmount(e.target.value)}
            placeholder="Supply amount"
            className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
          <button
            onClick={handleMint}
            disabled={minting || !supplyAmount || Number(supplyAmount) <= 0}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
          >
            {minting ? "Minting..." : "Mint Supply"}
          </button>
        </div>
        {errorMsg && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2">
            {errorMsg}
          </p>
        )}
      </div>

      {result && (
        <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-5 flex flex-col gap-2">
          <p className="text-green-300 text-sm font-semibold">Mint Successful ✓</p>
          <p className="text-xs text-slate-400">
            Token: <span className="text-white font-medium">SCHOLAR</span> ·{" "}
            Supply: <span className="text-white font-medium">{result.supply.toLocaleString()}</span>
          </p>
          <p className="text-xs text-slate-400">
            Policy ID: <span className="font-mono text-slate-300">{result.policyId.slice(0, 20)}...</span>
          </p>
          <a
            href={`https://preprod.cardanoscan.io/transaction/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline"
          >
            View on Cardanoscan
          </a>
        </div>
      )}
    </div>
  );
}
