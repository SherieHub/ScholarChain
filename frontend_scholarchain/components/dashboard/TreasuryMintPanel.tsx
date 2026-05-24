"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { mintTokenSupply } from "@/lib/mesh/mintTokens";
import { updateTokenPolicyId, getUniversityConfig } from "@/lib/firebase/config-store";
import { parseTxError } from "@/lib/mesh/errorHandler";

const MAX_SUPPLY = 1_000_000;

export default function TreasuryMintPanel() {
  const { wallet } = useWallet();
  const [supplyAmount, setSupplyAmount] = useState("");
  const [minting, setMinting] = useState(false);
  const [result, setResult] = useState<{ txHash: string; policyId: string; supply: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [alreadyMinted, setAlreadyMinted] = useState<number | null>(null);
  const [loadingMinted, setLoadingMinted] = useState(true);

  useEffect(() => {
    getUniversityConfig()
      .then(cfg => setAlreadyMinted(cfg.scholarTokenTotalSupply ?? 0))
      .catch(() => setAlreadyMinted(0))
      .finally(() => setLoadingMinted(false));
  }, [result]);

  const minted = alreadyMinted ?? 0;
  const remaining = Math.max(0, MAX_SUPPLY - minted);
  const inputAmount = Number(supplyAmount);
  const exceedsCap = inputAmount > remaining;

  const handleMint = async () => {
    if (!wallet || !inputAmount || inputAmount <= 0) return;
    if (exceedsCap) {
      setErrorMsg(`Cannot mint ${inputAmount.toLocaleString()} — only ${remaining.toLocaleString()} SCHOLAR tokens remain in the supply cap.`);
      return;
    }
    setMinting(true);
    setErrorMsg("");
    try {
      const { txHash, policyId, supplyMinted } = await mintTokenSupply(wallet, inputAmount);
      await updateTokenPolicyId(policyId, supplyMinted);
      setResult({ txHash, policyId, supply: supplyMinted });
      setSupplyAmount("");
    } catch (err: unknown) {
      setErrorMsg(parseTxError(err));
    } finally {
      setMinting(false);
    }
  };

  const pct = MAX_SUPPLY > 0 ? Math.min(100, (minted / MAX_SUPPLY) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-slate-300">Mint SCHOLAR Token Supply</h3>
        <p className="text-xs text-slate-500">
          Mint SCHOLAR tokens to your admin wallet for scholar incentive rewards. Maximum total supply: {MAX_SUPPLY.toLocaleString()} SCHL.
        </p>

        {/* Supply meter */}
        {!loadingMinted && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Minted: <span className="text-slate-300 font-medium">{minted.toLocaleString()}</span></span>
              <span>Remaining: <span className={`font-medium ${remaining === 0 ? "text-red-400" : "text-green-400"}`}>{remaining.toLocaleString()}</span></span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct >= 90 ? "rgb(239,68,68)" : pct >= 70 ? "rgb(234,179,8)" : "rgb(99,102,241)",
                }}
              />
            </div>
            <p className="text-xs text-slate-600 text-right">{pct.toFixed(1)}% of max supply minted</p>
          </div>
        )}

        {remaining === 0 ? (
          <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 text-xs text-red-300">
            Maximum supply of {MAX_SUPPLY.toLocaleString()} SCHL has been reached. No more tokens can be minted.
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              max={remaining}
              step="1"
              value={supplyAmount}
              onChange={e => { setSupplyAmount(e.target.value); setErrorMsg(""); }}
              placeholder={`Amount (max ${remaining.toLocaleString()})`}
              className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            <button
              onClick={handleMint}
              disabled={minting || !supplyAmount || inputAmount <= 0 || exceedsCap}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2"
            >
              {minting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Minting…
                </>
              ) : (
                "Mint Supply"
              )}
            </button>
          </div>
        )}

        {exceedsCap && supplyAmount && (
          <p className="text-xs text-amber-400 bg-amber-900/20 border border-amber-700/30 rounded-xl px-3 py-2">
            Amount exceeds remaining cap of {remaining.toLocaleString()} SCHL.
          </p>
        )}

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
            Supply minted: <span className="text-white font-medium">{result.supply.toLocaleString()}</span>
          </p>
          <p className="text-xs text-slate-400">
            Policy ID: <span className="font-mono text-slate-300">{result.policyId.slice(0, 20)}...</span>
          </p>
          <a
            href={`https://preprod.cardanoscan.io/transaction/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-400/40 rounded-lg px-3 py-1.5 transition-all duration-150 self-start"
          >
            View on Cardanoscan
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      )}
    </div>
  );
}
