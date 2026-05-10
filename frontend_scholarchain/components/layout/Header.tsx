"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";

const navLinks = [
  { href: "/admin", label: "Admin" },
  { href: "/apply", label: "Apply" },
  { href: "/sponsor-entry", label: "Sponsor" },
  { href: "/transparency", label: "Transparency" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between gap-4">

        <Link
          href="/"
          className="text-lg font-bold text-gradient-animated shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
        >
          ScholarChain
        </Link>

        {/* Desktop nav */}
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

        <div className="flex items-center gap-3">
          <WalletConnectButton />

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-white/[0.06] bg-slate-950/95 backdrop-blur-md">
          <ul className="flex flex-col px-6 py-3 gap-1">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block w-full py-2 text-sm transition-colors duration-200 ${
                    pathname === href
                      ? "text-white font-medium"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
