"use client";

import { useState, useEffect } from "react";
import { useWallet, useLovelace } from "@meshsdk/react";

export const useWalletConnection = () => {
  const { wallet, connected, connecting, name, disconnect, error } = useWallet();
  const balance = useLovelace(); // reactive lovelace balance from MeshJS
  const [address, setAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!connected || !wallet) {
        setAddress(undefined);
        return;
      }
      try {
        // getUsedAddresses() returns empty for brand-new wallets with no txs;
        // fall back to getChangeAddress() which always returns an address.
        const used = await wallet.getUsedAddresses();
        const addr =
          used.length > 0 ? used[0] : await wallet.getChangeAddress();
        setAddress(addr);
      } catch {
        setAddress(undefined);
      }
    };
    fetchAddress();
  }, [connected, wallet]);

  return {
    wallet,
    connected,
    connecting,
    address,
    balance,
    name,
    disconnect,
    error,
  };
};
