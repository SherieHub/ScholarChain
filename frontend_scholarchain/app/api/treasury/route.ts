import { NextResponse } from "next/server";
import { getAddressInfo } from "@/lib/blockfrost/client";
import { getUniversityConfig } from "@/lib/firebase/config-store";

async function resolveAdminAddress(): Promise<string | null> {
  try {
    const config = await getUniversityConfig();
    const addr = config.adminWalletAddresses?.[0]?.trim();
    if (addr) return addr;
  } catch { /* fall through to env fallback */ }
  return process.env.ADMIN_WALLET_ADDRESS ?? null;
}

export async function GET() {
  const address = await resolveAdminAddress();
  if (!address) {
    return NextResponse.json(
      { error: "Admin wallet address not configured in Firestore or ADMIN_WALLET_ADDRESS env." },
      { status: 500 }
    );
  }
  try {
    const info = await getAddressInfo(address);
    const lovelaceEntry = info.amount.find(a => a.unit === "lovelace");
    const lovelaceBalance = lovelaceEntry ? Number(lovelaceEntry.quantity) : 0;
    const adaBalance = lovelaceBalance / 1_000_000;
    return NextResponse.json({ lovelaceBalance, adaBalance, address });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch treasury balance.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
