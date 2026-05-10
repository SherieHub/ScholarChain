"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { BrowserWallet } from "@meshsdk/core";
import {
  X,
  Wallet,
  LogOut,
  ChevronDown,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

interface WalletInfo {
  name: string;
  icon: string;
}

type ModalState = "idle" | "selecting" | "verifying";

function shortenAddr(addr: string) {
  return `${addr.slice(0, 16)}...${addr.slice(-8)}`;
}

export default function WalletModal() {
  const { connect, connected, name: connectedName, disconnect } = useWallet();
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [verifyAddress, setVerifyAddress] = useState<string>("");

  // Load available wallet extensions once on mount
  useEffect(() => {
    BrowserWallet.getAvailableWallets().then((w) =>
      setWallets(w as unknown as WalletInfo[])
    );
  }, []);

  // Close modal on Escape
  useEffect(() => {
    if (modalState === "idle") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalState("idle");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalState]);

  const handleConnect = async (walletName: string) => {
    setConnecting(walletName);
    try {
      // Step 1: connect via MeshJS (updates global wallet context)
      await connect(walletName);

      // Step 2: get a fresh BrowserWallet instance to read the address immediately.
      // We can't rely on useWallet()'s `wallet` ref here because React state
      // updates are async — BrowserWallet.enable() gives us the live instance now.
      const bw = await BrowserWallet.enable(walletName);

      // Step 3: fetch address (fall back to change address for new wallets)
      const used = await bw.getUsedAddresses();
      const addr =
        used.length > 0 ? used[0] : await bw.getChangeAddress();

      setVerifyAddress(addr);
      setModalState("verifying");
    } catch {
      // User rejected or wallet error — stay on the selecting screen
      setModalState("selecting");
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnectAndRetry = () => {
    setVerifyAddress("");
    setModalState("selecting");
  };

  const handleConfirm = () => setModalState("idle");

  const handleDisconnect = () => {
    disconnect();
    setModalState("idle");
  };

  // ── Connected badge (idle + already connected) ───────────────────────────
  if (modalState === "idle" && connected) {
    return (
      <div className="flex items-center gap-2">
        {/* Connected status pill */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm backdrop-blur-sm"
          style={{
            background: "rgba(2,6,23,0.7)",
            border: "1px solid rgba(52,211,153,0.3)",
            boxShadow: "0 0 12px rgba(52,211,153,0.1)",
          }}
        >
          {/* Pulsing green dot */}
          <span className="relative flex items-center justify-center w-2.5 h-2.5">
            <span
              className="absolute inline-flex w-full h-full rounded-full bg-emerald-400"
              style={{ animation: "dot-ping 1.8s ease-out infinite" }}
            />
            <span className="relative w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </span>
          <span className="text-emerald-300 font-medium text-xs capitalize">
            {connectedName}
          </span>
        </div>

        {/* Disconnect button */}
        <button
          onClick={handleDisconnect}
          title="Disconnect wallet"
          className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 text-xs border border-white/[0.06] hover:border-red-500/30 rounded-xl px-2.5 py-1.5 transition-all duration-200 hover:bg-red-500/5"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          Disconnect
        </button>
      </div>
    );
  }

  // ── Trigger button (idle + disconnected) ─────────────────────────────────
  if (modalState === "idle") {
    return (
      <button
        onClick={() => setModalState("selecting")}
        className="relative overflow-hidden flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.05] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        style={{
          background:
            "linear-gradient(135deg, #1d4ed8 0%, #4f46e5 40%, #7c3aed 70%, #1d4ed8 100%)",
          backgroundSize: "300% 300%",
          animation: "gradient-x 4s ease infinite, btn-glow 2.5s ease-in-out infinite",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
        aria-label="Open wallet connection modal"
      >
        {/* Shimmer sweep */}
        <span
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.14) 50%, transparent 65%)",
            animation: "shimmer-sweep 3s ease-in-out infinite",
          }}
        />

        <Wallet
          className="relative w-4 h-4"
          style={{ animation: "icon-float 2.2s ease-in-out infinite" }}
          aria-hidden="true"
        />
        <span className="relative">Connect Wallet</span>
        <ChevronDown
          className="relative w-3.5 h-3.5 opacity-70"
          aria-hidden="true"
        />
      </button>
    );
  }

  // ── Modal (selecting or verifying) ───────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Blur backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={() => setModalState("idle")}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-white/[0.10] rounded-2xl shadow-2xl p-6 flex flex-col gap-4">

        {/* ── SELECTING ─────────────────────────────── */}
        {modalState === "selecting" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-base">
                  Connect a Wallet
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Select your Cardano wallet extension
                </p>
              </div>
              <button
                onClick={() => setModalState("idle")}
                aria-label="Close"
                className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {wallets.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-center">
                <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-medium">
                  No wallets detected
                </p>
                <p className="text-slate-600 text-xs mt-1">
                  Install{" "}
                  <a
                    href="https://eternl.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Eternl
                  </a>{" "}
                  and switch to{" "}
                  <span className="text-slate-400">Preprod Testnet</span>.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {wallets.map((w) => (
                  <li key={w.name}>
                    <button
                      onClick={() => handleConnect(w.name)}
                      disabled={connecting !== null}
                      className="w-full flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-blue-500/30 rounded-xl px-4 py-3 transition-all group disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {w.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={w.icon}
                          alt={w.name}
                          className="w-8 h-8 rounded-lg object-contain"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <span className="text-white text-sm font-medium capitalize flex-1 text-left">
                        {w.name}
                      </span>
                      {connecting === w.name ? (
                        <span className="text-xs text-blue-400 animate-pulse">
                          Connecting...
                        </span>
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-600 -rotate-90 group-hover:text-slate-300 transition-colors" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-slate-600 text-xs text-center">
              Make sure your wallet is on{" "}
              <span className="text-slate-400">Preprod Testnet</span>
            </p>
          </>
        )}

        {/* ── VERIFYING ─────────────────────────────── */}
        {modalState === "verifying" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-base">
                Confirm Connection
              </h2>
              <button
                onClick={handleConfirm}
                aria-label="Close"
                className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium capitalize">
                  {connectedName} Connected
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Verify this is the correct account before proceeding
                </p>
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1.5">
                Connected Address
              </p>
              <p className="text-slate-200 font-mono text-xs break-all leading-relaxed">
                {verifyAddress || "Fetching address..."}
              </p>
              {verifyAddress && (
                <p className="text-slate-500 text-xs mt-2">
                  Short:{" "}
                  <span className="text-slate-300">
                    {shortenAddr(verifyAddress)}
                  </span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(59,130,246,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <CheckCircle className="w-4 h-4" />
                This is the correct account
              </button>
              <button
                onClick={handleDisconnectAndRetry}
                className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm border border-white/[0.06] hover:border-white/[0.14] py-2.5 rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Use a different wallet
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
