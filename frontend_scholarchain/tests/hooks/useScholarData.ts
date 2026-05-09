"use client";
import { useState, useEffect } from "react";
import { getScholarsByStatus } from "@/lib/firebase/scholars";
import type { Scholar } from "@/types";

export function useScholarData(status: import("@/types").ScholarStatus = "Approved") {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getScholarsByStatus(status);
      setScholars(data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load scholars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [status]);

  return { scholars, loading, error, refresh };
}