import { NextResponse } from "next/server";
import { getAddressInfo } from "@/lib/blockfrost/client";

export async function GET() {
  const address = process.env.ADMIN_WALLET_ADDRESS;
  if (!address) {
    return NextResponse.json({ error: "ADMIN_WALLET_ADDRESS not configured." }, { status: 500 });
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
