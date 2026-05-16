import type { TransactionSummary } from "@/types";
import { getScholarsByWalletAddresses } from "@/lib/firebase/scholars";

function maskName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length < 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

export async function enrichTransactionsWithScholarData(
  transactions: TransactionSummary[]
): Promise<TransactionSummary[]> {
  const addresses = [...new Set(transactions.map(tx => tx.recipientAddress).filter(Boolean))];
  if (addresses.length === 0) return transactions;

  const scholars = await getScholarsByWalletAddresses(addresses);
  const addressMap = new Map(scholars.map(s => [s.walletAddress, s]));

  return transactions.map(tx => {
    const scholar = addressMap.get(tx.recipientAddress);
    return {
      ...tx,
      scholarName: scholar ? maskName(scholar.name) : undefined,
      scholarId: scholar?.id,
    };
  });
}
