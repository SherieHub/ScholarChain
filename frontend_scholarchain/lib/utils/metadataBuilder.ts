export function buildScholarBadgeMetadata(
  policyId: string,
  assetName: string,
  scholarName: string,
  course: string,
  ipfsUri: string
): object {
  return {
    "721": {
      [policyId]: {
        [assetName]: {
          name: `Scholar Badge — ${scholarName}`,
          image: ipfsUri,
          mediaType: "image/png",
          description: `Verified scholar badge for ${scholarName}, enrolled in ${course}.`,
          course,
          scholarName,
        },
      },
      version: 1,
    },
  };
}

export function generateAssetName(scholarName: string): string {
  const base = scholarName
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 28);
  const suffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `ScholarBadge${base}${suffix}`;
}
