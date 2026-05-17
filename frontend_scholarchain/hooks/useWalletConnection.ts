"use client";

import { useState, useEffect } from "react";
import { useWallet, useLovelace } from "@meshsdk/react";
import { getWalletAddressBech32 } from "@/lib/utils/addressUtils";

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
        const addr = await getWalletAddressBech32(wallet);
        setAddress(addr || undefined);
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
