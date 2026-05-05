"use client";

import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [MeshProvider, setMeshProvider] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted || MeshProvider === null) {
    return <>{children}</>;
  }

  return <MeshProvider>{children}</MeshProvider>;
}