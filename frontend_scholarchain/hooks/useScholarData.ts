"use client";
import { useState, useEffect, useCallback } from "react";
import { getScholarsByStatus } from "@/lib/firebase/scholars";
import type { Scholar, ScholarStatus } from "@/types";

export function useScholarData(status: ScholarStatus = "Approved") {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getScholarsByStatus(status);
      setScholars(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load scholars";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { refresh(); }, [refresh]);

  return { scholars, loading, error, refresh };
}
