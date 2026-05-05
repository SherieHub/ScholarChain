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