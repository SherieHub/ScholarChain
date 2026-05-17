// Cardano metadata strings must be ≤ 64 bytes. CIP-25 allows splitting into
// an array of chunks — wallets and explorers reassemble them when rendering.
function chunkMetadataString(value: string): string | string[] {
  if (value.length <= 64) return value;
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += 64) {
    chunks.push(value.slice(i, i + 64));
  }
  return chunks;
}

// Returns the inner NFT properties only — the caller is responsible for
// wrapping these inside the CIP-25 { 721: { version:1, policyId: { assetName: ... } } } structure.
export function buildScholarBadgeMetadata(
  scholarName: string,
  course: string,
  ipfsUri: string
): object {
  const description = `Verified scholar badge for ${scholarName}, enrolled in ${course}.`;
  return {
    name: chunkMetadataString(`Scholar Badge — ${scholarName}`),
    image: chunkMetadataString(ipfsUri),
    mediaType: "image/png",
    description: chunkMetadataString(description),
    course: chunkMetadataString(course),
    scholarName: chunkMetadataString(scholarName),
  };
}

export function generateAssetName(scholarName: string): string {
  // Cardano asset names are limited to 32 bytes on-chain.
  // "ScholarBadge" = 12, suffix = 4 → 16 bytes left for the scholar name segment.
  const base = scholarName
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 16);
  const suffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `ScholarBadge${base}${suffix}`;
}
