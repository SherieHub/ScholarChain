import { NextResponse } from "next/server";

// Increment 5 — Blockfrost treasury balance endpoint (server-side, keeps API key secret)
export async function GET() {
  return NextResponse.json({ message: "Coming in Increment 5." }, { status: 501 });
}
