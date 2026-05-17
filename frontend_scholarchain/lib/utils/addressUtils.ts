/**
 * Validates that an address string is a well-formed Cardano Preprod testnet address.
 * Preprod addresses begin with "addr_test1".
 * This is a format check only — not a full cryptographic validation.
 *
 * @param address - Wallet address string to validate
 * @returns true if the address appears to be a valid Preprod address
 */
export function isValidPreprodAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  return address.startsWith("addr_test1") && address.length >= 50;
}

/**
 * Returns a shortened display version of a wallet address.
 * e.g., "addr_test1qpz...a7b8"
 */
export function shortenAddress(address: string, start = 14, end = 6): string {
  if (!address || address.length < start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// ── Bech32 encoding constants (Cardano uses standard Bech32, not Bech32m) ────
const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function bech32Polymod(values: number[]): number {
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk ^= GENERATOR[i];
    }
  }
  return chk;
}

function hrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (const c of hrp) ret.push(c.charCodeAt(0) >> 5);
  ret.push(0);
  for (const c of hrp) ret.push(c.charCodeAt(0) & 31);
  return ret;
}

function bech32Checksum(hrp: string, data: number[]): number[] {
  const values = [...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0];
  const mod = bech32Polymod(values) ^ 1;
  return Array.from({ length: 6 }, (_, i) => (mod >> (5 * (5 - i))) & 31);
}

function convertBits8to5(bytes: Uint8Array): number[] {
  let acc = 0, bits = 0;
  const result: number[] = [];
  for (const v of bytes) {
    acc = (acc << 8) | v;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) result.push((acc << (5 - bits)) & 31);
  return result;
}

/**
 * Ensures a Cardano wallet address is in Bech32 format (addr_test1… or addr1…).
 * If the address is already Bech32, it is returned unchanged.
 * If it is raw hex (as returned by CIP-30 wallet APIs before MeshJS converts it),
 * it is encoded to Bech32 using the network byte in the address header.
 * This handles scholars whose walletAddress was stored in Firestore before the
 * getWalletAddressBech32 fix was applied.
 */
export function normalizeToB32(address: string): string {
  if (!address) throw new Error("Wallet address is empty.");

  // Already Bech32 — pass through unchanged
  if (address.startsWith("addr")) return address;

  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(address) || address.length < 4) {
    throw new Error(
      `Wallet address format is invalid. Expected addr_test1… but got: ${address.slice(0, 20)}`
    );
  }

  const bytes = new Uint8Array(
    address.match(/.{2}/g)!.map(h => parseInt(h, 16))
  );

  // Lower nibble of the header byte: 0 = testnet/preprod, 1 = mainnet
  const network = bytes[0] & 0x0f;
  const hrp = network === 1 ? "addr" : "addr_test";

  const data5bit = convertBits8to5(bytes);
  const checksum = bech32Checksum(hrp, data5bit);

  return hrp + "1" + [...data5bit, ...checksum]
    .map(d => BECH32_CHARSET[d])
    .join("");
}

/**
 * Fetches the primary address from a connected wallet as a Bech32 string.
 *
 * The wallet object from useWallet() is MeshCardanoBrowserWallet, whose
 * getUsedAddresses() returns raw hex (CIP-30 spec). The Bech32-specific
 * methods getUsedAddressesBech32() / getChangeAddressBech32() must be used
 * instead. BrowserWallet (from BrowserWallet.enable()) already converts
 * internally, so we fall back to the standard methods for that path.
 */
export async function getWalletAddressBech32(wallet: any): Promise<string> {
  try {
    // Always prefer the change address — it is the wallet's current active signing key.
    // getUsedAddressesBech32()[0] is a historical receive address whose key may not be
    // the one the wallet extension signs with, causing native-script witness mismatches.
    if (typeof wallet.getChangeAddressBech32 === "function") {
      return await wallet.getChangeAddressBech32();
    }
    if (typeof wallet.getChangeAddress === "function") {
      return await wallet.getChangeAddress();
    }
    // Last-resort fallbacks
    if (typeof wallet.getUsedAddressesBech32 === "function") {
      const addrs: string[] = await wallet.getUsedAddressesBech32();
      if (addrs.length > 0) return addrs[0];
    }
    const addrs: string[] = await wallet.getUsedAddresses();
    return addrs[0] ?? "";
  } catch {
    return "";
  }
}
