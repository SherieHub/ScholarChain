"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <Link
          href="/"
          className="text-lg font-bold text-gradient-animated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
        >
          ScholarChain
        </Link>
      </div>
    </header>
  );
}
