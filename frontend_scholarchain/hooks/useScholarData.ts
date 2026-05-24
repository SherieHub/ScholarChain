"use client";
import { useState, useEffect, useCallback } from "react";
import { getScholarsByStatus, getAllScholars } from "@/lib/firebase/scholars";
import type { Scholar, ScholarStatus } from "@/types";

export function useScholarData(status: ScholarStatus | "all" = "Approved") {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        status === "all"
          ? await getAllScholars()
          : await getScholarsByStatus(status);
      setScholars(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load scholars");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { refresh(); }, [refresh]);

  return { scholars, loading, error, refresh };
}
