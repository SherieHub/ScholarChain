"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";

const navLinks = [
  { href: "/admin", label: "Admin" },
  { href: "/apply", label: "Apply" },
  { href: "/sponsor-entry", label: "Sponsor" },
  { href: "/transparency", label: "Transparency" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-4">

        <Link
          href="/"
          className="text-lg font-bold text-gradient-animated shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
        >
          ScholarChain
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors duration-200 ${
                pathname === href
                  ? "text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <WalletConnectButton />
      </div>
    </header>
  );
}
