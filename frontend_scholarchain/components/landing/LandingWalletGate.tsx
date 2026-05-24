"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@meshsdk/react";
import Link from "next/link";
import { LayoutDashboard, GraduationCap, Handshake, BarChart3, Shield } from "lucide-react";
import { useMeshReady } from "@/app/providers";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";
import { getUniversityConfig } from "@/lib/firebase/config-store";
import { getWalletAddressBech32 } from "@/lib/utils/addressUtils";
import type { ElementType } from "react";

type Role = "admin" | "scholar" | "sponsor";
type WalletKind = "idle" | "validating" | "is-admin" | "is-user";

interface CardDef {
  href: string;
  icon: ElementType;
  title: string;
  desc: string;
  color: string;
}

const ROLE_CARDS: Record<Role, CardDef[]> = {
  admin: [
    { href: "/admin",        icon: LayoutDashboard, title: "Admin Portal",           desc: "Manage scholarship payments and scholars.",          color: "blue"   },
    { href: "/transparency", icon: BarChart3,        title: "Transparency Dashboard", desc: "Live on-chain treasury data — no wallet required.", color: "cyan"   },
  ],
  scholar: [
    { href: "/apply",         icon: GraduationCap, title: "Apply for Scholarship", desc: "Submit your application with your Cardano wallet.",    color: "indigo" },
    { href: "/scholar-portal",icon: Shield,        title: "Scholar Portal",        desc: "Verify your NFT badge and submit grade achievements.", color: "green"  },
    { href: "/transparency",  icon: BarChart3,     title: "Transparency Dashboard",desc: "Live on-chain treasury data — no wallet required.",   color: "cyan"   },
  ],
  sponsor: [
    { href: "/sponsor-entry",icon: Handshake, title: "Sponsor Portal",           desc: "Register your pledge and send tADA to the treasury.", color: "violet" },
    { href: "/transparency", icon: BarChart3,  title: "Transparency Dashboard",  desc: "Live on-chain treasury data — no wallet required.",   color: "cyan"   },
  ],
};

const C: Record<string, { bg: string; hover: string; icon: string; glow: string }> = {
  blue:   { bg: "bg-blue-500/10 border-blue-500/20",   hover: "group-hover:bg-blue-500/25",   icon: "text-blue-400",   glow: "group-hover:shadow-[0_0_16px_rgba(59,130,246,0.3)]"  },
  indigo: { bg: "bg-indigo-500/10 border-indigo-500/20",hover: "group-hover:bg-indigo-500/25", icon: "text-indigo-400", glow: "group-hover:shadow-[0_0_16px_rgba(99,102,241,0.3)]"  },
  violet: { bg: "bg-violet-500/10 border-violet-500/20",hover: "group-hover:bg-violet-500/25", icon: "text-violet-400", glow: "group-hover:shadow-[0_0_16px_rgba(139,92,246,0.3)]" },
  green:  { bg: "bg-green-500/10 border-green-500/20",  hover: "group-hover:bg-green-500/25",  icon: "text-green-400",  glow: "group-hover:shadow-[0_0_16px_rgba(34,197,94,0.3)]"   },
  cyan:   { bg: "bg-cyan-500/10 border-cyan-500/20",    hover: "group-hover:bg-cyan-500/25",    icon: "text-cyan-400",   glow: "group-hover:shadow-[0_0_16px_rgba(6,182,212,0.3)]"   },
};

function PortalCards({ cards }: { cards: CardDef[] }) {
  return (
    <div className={`grid gap-4 ${cards.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {cards.map(({ href, icon: Icon, title, desc, color }) => {
        const c = C[color];
        return (
          <Link
            key={href}
            href={href}
            className="group relative flex flex-col items-start gap-3 bg-white/[0.02] backdrop-blur-md border border-white/[0.06] hover:border-blue-500/40 hover:bg-white/[0.05] rounded-2xl p-5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)", animation: "shimmer-sweep 1.8s ease-in-out infinite" }}
            />
            <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${c.bg} ${c.hover} ${c.glow}`}>
              <Icon className={`w-5 h-5 ${c.icon}`} aria-hidden="true" />
            </div>
            <span className="relative z-10 text-white font-semibold text-sm">{title}</span>
            <span className="relative z-10 text-slate-400 text-sm leading-relaxed">{desc}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function LandingWalletGate({ role }: { role: Role }) {
  const meshReady = useMeshReady();
  const { connected, wallet, disconnect } = useWallet();
  const [kind, setKind] = useState<WalletKind>("idle");

  useEffect(() => {
    if (!connected || !wallet) {
      setKind("idle");
      return;
    }
    setKind("validating");

    const validate = async () => {
      try {
        const address = await getWalletAddressBech32(wallet);
        const config = await getUniversityConfig().catch(() => null);
        const admins = (config?.adminWalletAddresses ?? []).map((a: string) => a.trim());
        const isAdmin = admins.length > 0 && admins.includes(address.trim());
        setKind(isAdmin ? "is-admin" : "is-user");
      } catch {
        setKind("is-user"); // allow through on error
      }
    };

    validate();
  }, [connected, wallet, role]);

  // ── Not connected ──────────────────────────────────────────────────────────
  if (!meshReady || !connected || kind === "idle") {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 py-2" style={{ animation: "fade-slide-up 0.5s ease-out both" }}>
        <WalletConnectButton />
        <p className="text-xs text-slate-600">Connect your Cardano preprod wallet to continue</p>
      </div>
    );
  }

  // ── Validating ─────────────────────────────────────────────────────────────
  if (kind === "validating") {
    return (
      <div className="w-full flex items-center justify-center gap-2 text-slate-400 text-sm py-4">
        <div className="h-3.5 w-3.5 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin" />
        Verifying wallet…
      </div>
    );
  }

  // ── Admin wallet trying scholar / sponsor ──────────────────────────────────
  if (kind === "is-admin" && role !== "admin") {
    return (
      <div className="flex flex-col items-center gap-4 text-center max-w-sm mx-auto" style={{ animation: "fade-slide-up 0.5s ease-out both" }}>
        <div className="bg-red-900/20 border border-red-700/40 rounded-2xl p-5 flex flex-col items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-lg">🚫</div>
          <div>
            <p className="text-red-300 font-semibold text-sm">Admin Wallet Detected</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Admin wallets cannot access the {role} portal. Please disconnect and connect a {role} wallet.
            </p>
          </div>
          <button
            onClick={disconnect}
            className="text-xs text-red-300 hover:text-white border border-red-700/50 hover:border-red-400/60 rounded-lg px-4 py-2 transition-colors"
          >
            Disconnect &amp; Switch Wallet
          </button>
        </div>
      </div>
    );
  }

  // ── Non-admin wallet trying admin ──────────────────────────────────────────
  if (kind === "is-user" && role === "admin") {
    return (
      <div className="flex flex-col items-center gap-4 text-center max-w-sm mx-auto" style={{ animation: "fade-slide-up 0.5s ease-out both" }}>
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-5 flex flex-col items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg">⚠️</div>
          <div>
            <p className="text-amber-300 font-semibold text-sm">Not Authorized</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              This wallet is not registered as an admin. Connect the designated admin wallet to proceed.
            </p>
          </div>
          <button
            onClick={disconnect}
            className="text-xs text-amber-300 hover:text-white border border-amber-700/50 hover:border-amber-400/60 rounded-lg px-4 py-2 transition-colors"
          >
            Disconnect &amp; Try Another Wallet
          </button>
        </div>
      </div>
    );
  }

  // ── Verified ───────────────────────────────────────────────────────────────
  const cards = ROLE_CARDS[role];

  return (
    <div className="flex flex-col gap-5 w-full" style={{ animation: "fade-slide-up 0.5s ease-out both" }}>
      {/* Admin verified banner */}
      {role === "admin" && (
        <div className="flex items-center justify-center gap-2.5 bg-green-900/20 border border-green-700/30 rounded-xl px-4 py-2.5 mx-auto">
          <span className="text-green-400 font-bold text-base">✓</span>
          <p className="text-green-300 text-sm font-semibold">Verified Admin — Welcome back</p>
        </div>
      )}

      {/* Portal cards */}
      <PortalCards cards={cards} />

      {/* Wallet status + disconnect (no header on landing) */}
      <div className="flex justify-center">
        <WalletConnectButton />
      </div>
    </div>
  );
}
