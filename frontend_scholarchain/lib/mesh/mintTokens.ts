import { Transaction, ForgeScript, resolveScriptHash } from "@meshsdk/core";
import type { Mint } from "@meshsdk/core";
import { getWalletAddressBech32 } from "@/lib/utils/addressUtils";
import { submitTransaction } from "@/lib/mesh/submitTx";
import { filterPendingSpent, markUtxosSpent } from "@/lib/mesh/pendingUtxos";

const TOKEN_NAME = "SCHOLAR";

export async function mintTokenSupply(
  wallet: any,
  supplyAmount: number
): Promise<{ txHash: string; policyId: string; tokenName: string; supplyMinted: number }> {
  if (!wallet) throw new Error("Wallet not connected.");
  if (!supplyAmount || supplyAmount <= 0)
    throw new Error("Token supply amount must be greater than zero.");

  // Use change address for the ForgeScript — same pattern as mintNFT.ts.
  // This ensures the ForgeScript's pubkey hash matches the key Eternl signs with.
  const address: string =
    typeof wallet.getChangeAddressBech32 === "function"
      ? await wallet.getChangeAddressBech32()
      : await getWalletAddressBech32(wallet);
  if (!address) throw new Error("Could not resolve wallet address.");

  const forgingScript = ForgeScript.withOneSignature(address);
  const policyId = resolveScriptHash(forgingScript);

  const asset: Mint = {
    assetName: TOKEN_NAME,
    assetQuantity: String(supplyAmount),
    metadata: {
      [policyId]: {
        [TOKEN_NAME]: {
          name: "SCHOLAR Token",
          description: "ScholarChain incentive token awarded for academic achievements.",
          ticker: "SCHOLAR",
          decimals: 0,
        },
      },
    },
    label: "20",
    recipient: address,
  };

  const tx = new Transaction({ initiator: wallet });
  tx.mintAsset(forgingScript, asset);

  // ── MeshJS beta workaround ─────────────────────────────────────────────────
  // Pre-set change address and UTxOs before build() to bypass broken
  // Address.fromString and getChangeAddress calls in this beta version.
  // See mintNFT.ts for the full explanation.
  tx.setChangeAddress(address);

  let utxos: any[] = [];
  try {
    const raw: any[] =
      typeof wallet.getUtxosMesh === "function"
        ? await wallet.getUtxosMesh()
        : (await wallet.getUtxos()) ?? [];
    utxos = filterPendingSpent(
      raw
        .filter(
          (u: any) =>
            u != null &&
            u.input != null &&
            u.input.txHash != null &&
            u.output != null &&
            u.output.address
        )
        .map((u: any) => ({
          ...u,
          input: { ...u.input, txHash: String(u.input.txHash) },
        }))
    );
  } catch {
    throw new Error(
      "Failed to read wallet UTxOs. Ensure your wallet is connected and has tADA on Preprod Testnet."
    );
  }
  if (utxos.length === 0) {
    throw new Error(
      "No spendable UTxOs found. Please ensure you have tADA in your Preprod wallet before minting."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tx as any).txBuilder.meshTxBuilderBody.extraInputs = utxos;
  // ──────────────────────────────────────────────────────────────────────────

  const unsignedTx = await tx.build();
  const witnessSet = await wallet.signTx(unsignedTx);
  const txHash = await submitTransaction(unsignedTx, witnessSet);
  markUtxosSpent(utxos);

  return { txHash, policyId, tokenName: TOKEN_NAME, supplyMinted: supplyAmount };
}
