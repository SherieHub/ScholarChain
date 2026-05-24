import { NextResponse } from "next/server";
import { getAddressTransactions, getTransactionUtxos } from "@/lib/blockfrost/client";
import { enrichTransactionsWithScholarData } from "@/lib/blockfrost/enrichTransactions";
import { getUniversityConfig } from "@/lib/firebase/config-store";
import type { TransactionSummary } from "@/types";

async function resolveAdminAddress(): Promise<string | null> {
  try {
    const config = await getUniversityConfig();
    const addr = config.adminWalletAddresses?.[0]?.trim();
    if (addr) return addr;
  } catch { /* fall through to env fallback */ }
  return process.env.ADMIN_WALLET_ADDRESS ?? null;
}

export async function GET() {
  const adminAddress = await resolveAdminAddress();
  if (!adminAddress) {
    return NextResponse.json({ error: "Admin wallet address not configured in Firestore or ADMIN_WALLET_ADDRESS env." }, { status: 500 });
  }

  try {
    const txList = await getAddressTransactions(adminAddress, 50);
    const summaries: TransactionSummary[] = [];

    for (const tx of txList) {
      try {
        const { outputs } = await getTransactionUtxos(tx.tx_hash);
        const outgoing = outputs.filter(o => o.address !== adminAddress);
        for (const output of outgoing) {
          const lovelaceEntry = output.amount.find(a => a.unit === "lovelace");
          const lovelaceAmount = lovelaceEntry ? Number(lovelaceEntry.quantity) : 0;
          if (lovelaceAmount === 0) continue;
          summaries.push({
            txHash: tx.tx_hash,
            blockTime: tx.block_time,
            blockTimeISO: new Date(tx.block_time * 1000).toISOString(),
            adaAmount: lovelaceAmount / 1_000_000,
            lovelaceAmount,
            recipientAddress: output.address,
          });
        }
      } catch {
        // Skip individual tx errors; continue processing the rest
      }
    }

    const enriched = await enrichTransactionsWithScholarData(summaries);
    const totalPaidOutADA = enriched.reduce((sum, tx) => sum + tx.adaAmount, 0);

    return NextResponse.json({ transactions: enriched, count: enriched.length, totalPaidOutADA });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch transactions.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
