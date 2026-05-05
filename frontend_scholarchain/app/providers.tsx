"use client";

import { useEffect, useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [MeshProvider, setMeshProvider] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null);

  useEffect(() => {
    setMounted(true);
    import("@meshsdk/react").then((mod) => {
      setMeshProvider(() => mod.MeshProvider);
    });
  }, []);

  if (!mounted || MeshProvider === null) {
    return <>{children}</>;
  }

  return <MeshProvider>{children}</MeshProvider>;
}