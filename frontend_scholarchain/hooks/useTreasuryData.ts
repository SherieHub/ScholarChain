"use client";
import { useState, useEffect } from "react";
import { getTotalPledgedADA } from "@/lib/firebase/sponsors";

interface TreasuryData {
  totalPledgedADA: number;
  liveBalanceADA: number;
  totalPaidOutADA: number;
  discrepancyADA: number;
  isAccountable: boolean;
  loading: boolean;
  error: string | null;
}

export function useTreasuryData(): TreasuryData {
  const [data, setData] = useState<TreasuryData>({
    totalPledgedADA: 0,
    liveBalanceADA: 0,
    totalPaidOutADA: 0,
    discrepancyADA: 0,
    isAccountable: true,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [pledged, treasuryRes, txRes] = await Promise.all([
          getTotalPledgedADA(),
          fetch("/api/treasury").then(r => r.json()),
          fetch("/api/transactions").then(r => r.json()),
        ]);

        const liveBalanceADA: number = treasuryRes.adaBalance ?? 0;
        const totalPaidOutADA: number = txRes.totalPaidOutADA ?? 0;
        const discrepancyADA = Math.max(0, pledged - (liveBalanceADA + totalPaidOutADA));
        const isAccountable = discrepancyADA <= 0;

        setData({
          totalPledgedADA: pledged,
          liveBalanceADA,
          totalPaidOutADA,
          discrepancyADA,
          isAccountable,
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
  }, []);

  return data;
}
