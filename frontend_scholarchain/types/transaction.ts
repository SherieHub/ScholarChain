export interface TransactionSummary {
  txHash: string;
  blockTime: number;
  blockTimeISO: string;
  adaAmount: number;
  lovelaceAmount: number;
  recipientAddress: string;
  scholarName?: string;
  scholarId?: string;
}
