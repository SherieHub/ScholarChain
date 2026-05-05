import { NextResponse } from "next/server";

// Increment 5 — Blockfrost transaction history endpoint
export async function GET() {
  return NextResponse.json({ message: "Coming in Increment 5." }, { status: 501 });
}
