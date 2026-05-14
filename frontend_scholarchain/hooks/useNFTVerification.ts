"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { verifyScholarBadge } from "@/lib/mesh/verifyNFTOwnership";
import { getScholarByWalletAddress } from "@/lib/firebase/scholars";
import type { Scholar } from "@/types";

export type PortalState = "disconnected" | "scanning" | "authorized" | "denied";

export function useNFTVerification() {
  const { wallet, connected } = useWallet();
  const [portalState, setPortalState] = useState<PortalState>("disconnected");
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !wallet) {
      setPortalState("disconnected");
      setScholar(null);
      return;
    }

    let cancelled = false;

    const scan = async () => {
      setPortalState("scanning");
      setError(null);
      try {
        const { isAuthorized } = await verifyScholarBadge(wallet);
        if (cancelled) return;

        if (!isAuthorized) {
          setPortalState("denied");
          return;
        }

        const usedAddresses = await wallet.getUsedAddresses();
        const address = usedAddresses[0] || (await wallet.getChangeAddress());
        if (cancelled) return;

        const scholarData = await getScholarByWalletAddress(address);
        if (cancelled) return;

        setScholar(scholarData);
        setPortalState("authorized");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Verification failed.");
        setPortalState("denied");
      }
    };

    scan();

    return () => { cancelled = true; };
  }, [connected, wallet]);

  const reset = () => {
    setPortalState("disconnected");
    setScholar(null);
    setError(null);
  };

  return { portalState, scholar, error, reset };
}
