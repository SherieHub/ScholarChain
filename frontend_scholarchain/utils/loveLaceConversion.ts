/**
 * Converts a human-readable ADA amount (float) to an integer Lovelace string.
 * Cardano protocol requires integer Lovelaces — no decimals are accepted.
 *
 * @param ada - Human-readable ADA value entered by the Admin (e.g., 50)
 * @returns Lovelace string suitable for MeshJS Transaction (e.g., "50000000")
 * @throws Error if input is not a valid positive number
 */
export function adaToLovelace(ada: string | number): string {
  const parsed = Number(ada);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid ADA amount: "${ada}". Must be a positive number.`);
  }
  return String(Math.round(parsed * 1_000_000));
}

/**
 * Converts a raw Lovelace integer (from Blockfrost/MeshJS) to a readable ADA string.
 * @param lovelace - Raw Lovelace value (e.g., 50000000)
 * @returns Formatted ADA string (e.g., "50.00")
 */
export function lovelaceToAda(lovelace: number | string): string {
  return (Number(lovelace) / 1_000_000).toFixed(2);
}