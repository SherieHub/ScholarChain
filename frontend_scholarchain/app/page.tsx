"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

type Role = "admin" | "scholar" | "sponsor";

// Dynamically imported — avoids MeshJS SSR issues
const LandingWalletGate = dynamic(
  () => import("@/components/landing/LandingWalletGate"),
  { ssr: false, loading: () => null }
);

export default function Home() {
  const [showName, setShowName] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [gateVisible, setGateVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowName(true), 1100);
    const t2 = setTimeout(() => setShowRoles(true), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleRoleSelect = (role: Role) => {
    setGateVisible(false);
    setSelectedRole(role);
    setTimeout(() => setGateVisible(true), 80);
  };

  return (
    <main className="relative flex flex-col items-center justify-center flex-1 px-6 py-16 text-center overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-blue-600/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-600/[0.07] blur-3xl" />

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center gap-10">

        {/* ── Phase 1: Logo plays entrance keyframe immediately ── */}
        <div
          className="relative"
          style={{ animation: "logo-entrance 1.2s cubic-bezier(0.22, 1, 0.36, 1) both" }}
        >
          <div
            className="absolute -inset-4 rounded-[2rem] blur-2xl"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(59,130,246,0.2) 50%, transparent 70%)" }}
          />
          <Image
            src="/logo.png"
            alt="ScholarChain"
            width={108}
            height={108}
            className="relative rounded-3xl shadow-2xl shadow-blue-900/60 ring-1 ring-white/10"
            priority
          />
        </div>

        {/* ── Phase 2: Name fades in after logo settles ── */}
        {showName && (
          <div style={{ animation: "fade-slide-up 0.7s ease-out both" }}>
            <h1 className="text-5xl font-bold tracking-tight text-gradient-animated leading-tight">
              ScholarChain
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm mt-2 mx-auto">
              Transparent, blockchain-verified scholarship management on Cardano.
            </p>
          </div>
        )}

        {/* ── Phase 3: Role selector ── */}
        {showRoles && (
          <div
            className="w-full flex flex-col items-center gap-7"
            style={{ animation: "fade-slide-up 0.6s ease-out both" }}
          >
            <p className="text-slate-500 text-xs uppercase tracking-[0.2em]">I am a</p>

            <div className="flex gap-3 flex-wrap justify-center">
              {(["admin", "scholar", "sponsor"] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`px-7 py-3 rounded-xl font-semibold text-sm capitalize transition-all duration-200 border ${
                    selectedRole === role
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50 scale-105"
                      : "bg-white/[0.04] border-white/[0.10] text-slate-300 hover:bg-white/[0.08] hover:border-white/[0.2] hover:text-white hover:scale-105"
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>

            {/* ── Phase 4: Wallet gate for selected role ── */}
            {selectedRole && gateVisible && (
              <div
                className="w-full"
                style={{ animation: "fade-slide-up 0.45s ease-out both" }}
              >
                {/* key forces remount + re-validation when role switches */}
                <LandingWalletGate key={selectedRole} role={selectedRole} />
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
