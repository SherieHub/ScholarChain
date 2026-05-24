"use client";
import { useState, useEffect, useCallback } from "react";
import type { TransactionSummary } from "@/types";

interface TransactionHistoryResult {
  transactions: TransactionSummary[];
  totalPaidOutADA: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTransactionHistory(): TransactionHistoryResult {
  const [tick, setTick] = useState(0);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [totalPaidOutADA, setTotalPaidOutADA] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("/api/transactions")
      .then(res => {
        if (res.status === 429) throw new Error("Rate limited — please wait a moment and refresh.");
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setTransactions(data.transactions ?? []);
        setTotalPaidOutADA(data.totalPaidOutADA ?? 0);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load transaction history.");
        setLoading(false);
      });
  }, [tick]);

  return { transactions, totalPaidOutADA, loading, error, refetch };
}
