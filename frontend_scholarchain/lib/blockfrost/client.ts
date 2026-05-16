/**
 * @server-only — never import this module in client components or pages.
 * The Blockfrost API key must only be accessed in app/api/ route handlers.
 */

export interface BlockfrostAddressInfo {
  amount: Array<{ unit: string; quantity: string }>;
}

export interface BlockfrostTransaction {
  tx_hash: string;
  block_time: number;
  block_height: number;
}

export interface BlockfrostUtxo {
  tx_hash: string;
  output_index: number;
  amount: Array<{ unit: string; quantity: string }>;
  address: string;
}

let _baseUrl: string | null = null;
let _projectId: string | null = null;

function getConfig() {
  if (!_projectId) {
    _projectId = process.env.BLOCKFROST_PROJECT_ID ?? "";
    if (!_projectId) throw new Error("BLOCKFROST_PROJECT_ID environment variable is not set.");
    _baseUrl = "https://cardano-preprod.blockfrost.io/api/v0";
  }
  return { baseUrl: _baseUrl!, projectId: _projectId };
}

async function blockfrostFetch<T>(path: string): Promise<T> {
  const { baseUrl, projectId } = getConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { project_id: projectId },
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Blockfrost ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getAddressInfo(address: string): Promise<BlockfrostAddressInfo> {
  return blockfrostFetch<BlockfrostAddressInfo>(`/addresses/${address}`);
}

export async function getAddressTransactions(address: string, count = 20): Promise<BlockfrostTransaction[]> {
  return blockfrostFetch<BlockfrostTransaction[]>(
    `/addresses/${address}/transactions?count=${count}&order=desc`
  );
}

export async function getTransactionUtxos(txHash: string): Promise<{ outputs: BlockfrostUtxo[] }> {
  return blockfrostFetch<{ outputs: BlockfrostUtxo[] }>(`/txs/${txHash}/utxos`);
}
