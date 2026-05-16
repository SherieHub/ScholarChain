"use client";
import { useState, useEffect } from "react";
import type { TransactionSummary } from "@/types";

interface TransactionHistoryResult {
  transactions: TransactionSummary[];
  totalPaidOutADA: number;
  loading: boolean;
  error: string | null;
}

export function useTransactionHistory(): TransactionHistoryResult {
  const [result, setResult] = useState<TransactionHistoryResult>({
    transactions: [],
    totalPaidOutADA: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetch("/api/transactions")
      .then(r => r.json())
      .then(data => {
        setResult({
          transactions: data.transactions ?? [],
          totalPaidOutADA: data.totalPaidOutADA ?? 0,
          loading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        setResult(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load transaction history.",
        }));
      });
  }, []);

  return result;
}
