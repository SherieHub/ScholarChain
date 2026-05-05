"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Shared signal: true only after MeshProvider is mounted and ready.
// WalletConnectButton reads this before rendering CardanoWallet.
const MeshReadyContext = createContext(false);
export const useMeshReady = () => useContext(MeshReadyContext);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [MeshProvider, setMeshProvider] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null);

  useEffect(() => {
    const initMesh = async () => {
      // libsodium WASM must be fully initialized before any MeshJS module
      // loads, because @cardano-sdk/crypto calls sodium functions at module level.
      const sodium = await import("libsodium-wrappers");
      await sodium.ready;
      const mod = await import("@meshsdk/react");
      setMeshProvider(() => mod.MeshProvider);
    };
    initMesh();
  }, []);

  if (MeshProvider === null) {
    return (
      <MeshReadyContext.Provider value={false}>
        {children}
      </MeshReadyContext.Provider>
    );
  }

  return (
    <MeshReadyContext.Provider value={true}>
      <MeshProvider>{children}</MeshProvider>
    </MeshReadyContext.Provider>
  );
}
