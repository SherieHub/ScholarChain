"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { toHex } from "@meshsdk/core";
import { verifyScholarBadge } from "@/lib/mesh/verifyNFTOwnership";
import { getScholarByWalletAddress } from "@/lib/firebase/scholars";
import type { Scholar } from "@/types";

export type PortalState = "disconnected" | "signing" | "scanning" | "authorized" | "denied";

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

    const run = async () => {
      setPortalState("signing");
      setError(null);
      try {
        const usedAddresses = await wallet.getUsedAddresses();
        const address = usedAddresses[0] || (await wallet.getChangeAddress());
        if (cancelled) return;

        await wallet.signData(address, toHex("ScholarChain portal authentication"));
        if (cancelled) return;

        setPortalState("scanning");

        const { isAuthorized } = await verifyScholarBadge(wallet);
        if (cancelled) return;

        if (!isAuthorized) {
          setPortalState("denied");
          return;
        }

        const scholarData = await getScholarByWalletAddress(address);
        if (cancelled) return;

        setScholar(scholarData);
        setPortalState("authorized");
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Verification failed.";
        if (
          msg.toLowerCase().includes("user declined") ||
          msg.toLowerCase().includes("cancelled") ||
          msg.toLowerCase().includes("rejected")
        ) {
          setError("You must sign the authentication challenge to access the portal.");
        } else {
          setError(msg);
        }
        setPortalState("denied");
      }
    };

    run();

    return () => { cancelled = true; };
  }, [connected, wallet]);

  const reset = () => {
    setPortalState("disconnected");
    setScholar(null);
    setError(null);
  };

  return { portalState, scholar, error, reset };
}
