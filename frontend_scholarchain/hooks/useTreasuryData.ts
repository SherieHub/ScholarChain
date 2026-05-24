"use client";
import { useState, useEffect, useCallback } from "react";
import { getTotalPledgedADA } from "@/lib/firebase/sponsors";
import { getTotalTokensDistributed } from "@/lib/firebase/scholars";

interface TreasuryData {
  totalPledgedADA: number;
  liveBalanceADA: number;
  totalPaidOutADA: number;
  discrepancyADA: number;
  isAccountable: boolean;
  totalTokensDistributed: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

async function safeFetch(url: string): Promise<Response> {
  const res = await fetch(url);
  if (res.status === 429) throw new Error("Rate limited — please wait a moment and refresh.");
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res;
}

export function useTreasuryData(): TreasuryData {
  const [tick, setTick] = useState(0);
  const [data, setData] = useState<Omit<TreasuryData, "refetch">>({
    totalPledgedADA: 0,
    liveBalanceADA: 0,
    totalPaidOutADA: 0,
    discrepancyADA: 0,
    isAccountable: true,
    totalTokensDistributed: 0,
    loading: true,
    error: null,
  });

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    const load = async () => {
      try {
        const [pledged, treasuryRes, txRes, tokens] = await Promise.all([
          getTotalPledgedADA(),
          safeFetch("/api/treasury").then(r => r.json()),
          safeFetch("/api/transactions").then(r => r.json()),
          getTotalTokensDistributed(),
        ]);

        const liveBalanceADA: number = treasuryRes.adaBalance ?? 0;
        const totalPaidOutADA: number = txRes.totalPaidOutADA ?? 0;
        const discrepancyADA = Math.max(0, pledged - (liveBalanceADA + totalPaidOutADA));

        setData({
          totalPledgedADA: pledged,
          liveBalanceADA,
          totalPaidOutADA,
          discrepancyADA,
          isAccountable: discrepancyADA <= 0,
          totalTokensDistributed: tokens,
          loading: false,
          error: null,
        });
      } catch (err: unknown) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load treasury data.",
        }));
      }
    };

    load();
  }, [tick]);

  return { ...data, refetch };
}
