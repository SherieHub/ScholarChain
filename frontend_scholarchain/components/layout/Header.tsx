"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
