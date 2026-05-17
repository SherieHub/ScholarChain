"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { verifyScholarBadge } from "@/lib/mesh/verifyNFTOwnership";
import { getScholarByWalletAddress } from "@/lib/firebase/scholars";
import { getWalletAddressBech32 } from "@/lib/utils/addressUtils";
import type { Scholar } from "@/types";

// Browser-safe hex encoding — replaces the removed toHex from @meshsdk/core
function toHex(text: string): string {
  return Array.from(new TextEncoder().encode(text))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// sessionStorage key for the verification cache
const SESSION_KEY = "sc_portal_verified";

interface VerificationCache {
  address: string;
  scholarId: string | null;
}

function readCache(): VerificationCache | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as VerificationCache) : null;
  } catch {
    return null;
  }
}

function writeCache(address: string, scholarId: string | null): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ address, scholarId }));
  } catch {
    // sessionStorage unavailable (SSR or private mode) — proceed without cache
  }
}

function clearCache(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

// Wraps a promise with a timeout; rejects with the given error message if exceeded
function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

export type PortalState =
  | "disconnected"
  | "signing"
  | "scanning"
  | "authorized"
  | "denied"
  | "cancelled"   // user rejected the signature — recoverable, show Retry
  | "timeout";    // NFT scan took too long — recoverable, show Retry

export function useNFTVerification() {
  const { wallet, connected } = useWallet();
  const [portalState, setPortalState] = useState<PortalState>("disconnected");
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Incrementing this re-triggers the effect without disconnecting the wallet
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!connected || !wallet) {
      setPortalState("disconnected");
      setScholar(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setError(null);

      try {
        const address = await getWalletAddressBech32(wallet);
        if (cancelled) return;

        // ── Cache hit: skip signing + scanning ─────────────────────────────
        const cache = readCache();
        if (cache && cache.address === address) {
          if (cache.scholarId) {
            const cached = await getScholarByWalletAddress(address);
            if (cancelled) return;
            setScholar(cached);
          }
          setPortalState("authorized");
          return;
        }

        // ── Full verification flow ──────────────────────────────────────────
        setPortalState("signing");

        try {
          await wallet.signData(address, toHex("ScholarChain portal authentication"));
        } catch (sigErr) {
          if (cancelled) return;
          const msg = sigErr instanceof Error ? sigErr.message : "";
          if (
            msg.toLowerCase().includes("user declined") ||
            msg.toLowerCase().includes("cancelled") ||
            msg.toLowerCase().includes("rejected")
          ) {
            setPortalState("cancelled");
          } else {
            setError(msg || "Signature failed.");
            setPortalState("denied");
          }
          return;
        }

        if (cancelled) return;
        setPortalState("scanning");

        let isAuthorized = false;
        try {
          const result = await withTimeout(
            verifyScholarBadge(wallet),
            45_000,
            "NFT scan timed out. The network may be congested — please try again."
          );
          isAuthorized = result.isAuthorized;
        } catch (scanErr) {
          if (cancelled) return;
          const msg = scanErr instanceof Error ? scanErr.message : "";
          if (msg.includes("timed out")) {
            setPortalState("timeout");
          } else {
            setError(msg);
            setPortalState("denied");
          }
          return;
        }

        if (cancelled) return;

        if (!isAuthorized) {
          setPortalState("denied");
          return;
        }

        const scholarData = await getScholarByWalletAddress(address);
        if (cancelled) return;

        // Write cache so subsequent page visits skip signing + scanning
        writeCache(address, scholarData?.id ?? null);

        setScholar(scholarData);
        setPortalState("authorized");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Verification failed.");
        setPortalState("denied");
      }
    };

    run();
    return () => { cancelled = true; };
  }, [connected, wallet, retryCount]);

  const reset = () => {
    clearCache();
    setRetryCount(0);
    setPortalState("disconnected");
    setScholar(null);
    setError(null);
  };

  // Retry without disconnecting — increments retryCount to re-trigger the effect
  const retry = () => {
    clearCache();
    setScholar(null);
    setError(null);
    setRetryCount(n => n + 1);
  };

  return { portalState, scholar, error, reset, retry };
}
