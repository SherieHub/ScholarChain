import Link from "next/link";
import { LayoutDashboard, GraduationCap, Handshake } from "lucide-react";

const cards = [
  {
    href: "/admin",
    icon: LayoutDashboard,
    title: "Admin Portal",
    desc: "Connect your wallet to manage scholarship payments.",
    color: "blue",
  },
  {
    href: "/apply",
    icon: GraduationCap,
    title: "Apply for Scholarship",
    desc: "Students: submit your application here.",
    color: "indigo",
  },
  {
    href: "/sponsor-entry",
    icon: Handshake,
    title: "Sponsor Registration",
    desc: "Sponsors: register your pledge here.",
    color: "violet",
  },
];

const steps = [
  {
    n: "1",
    label: "Apply",
    desc: "Students submit applications with their Cardano wallet address.",
  },
  {
    n: "2",
    label: "Approve",
    desc: "Admin reviews and approves scholars via the dashboard.",
  },
  {
    n: "3",
    label: "Get Paid on Cardano",
    desc: "ADA transfers are signed on-chain — verifiable by anyone.",
  },
];

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center flex-1 px-6 py-20 text-center overflow-hidden">
      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center gap-10">

        {/* ── Animated gradient header ── */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-6xl font-bold tracking-tight text-gradient-animated">
            ScholarChain
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Transparent, blockchain-verified scholarship management on Cardano.
          </p>
        </div>

        {/* ── Glassmorphism nav cards with shimmer ── */}
        <div className="grid sm:grid-cols-3 gap-4 w-full">
          {cards.map(({ href, icon: Icon, title, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="group relative flex flex-col items-start gap-3 bg-white/[0.02] backdrop-blur-md border border-white/[0.06] hover:border-blue-500/40 hover:bg-white/[0.05] rounded-2xl p-5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand overflow-hidden"
            >
              {/* Shimmer sweep on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
                  animation: "shimmer-sweep 1.8s ease-in-out infinite",
                }}
              />

              <div
                className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${color === "blue"   ? "bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/25 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.3)]"   : ""}
                  ${color === "indigo" ? "bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/25 group-hover:shadow-[0_0_16px_rgba(99,102,241,0.3)]" : ""}
                  ${color === "violet" ? "bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/25 group-hover:shadow-[0_0_16px_rgba(139,92,246,0.3)]" : ""}
                `}
              >
                <Icon
                  className={`relative z-10 w-5 h-5
                    ${color === "blue"   ? "text-blue-400"   : ""}
                    ${color === "indigo" ? "text-indigo-400" : ""}
                    ${color === "violet" ? "text-violet-400" : ""}
                  `}
                  aria-hidden="true"
                />
              </div>
              <span className="relative z-10 text-white font-semibold">{title}</span>
              <span className="relative z-10 text-slate-400 text-sm">{desc}</span>
            </Link>
          ))}
        </div>

        {/* ── How It Works — pulsing glow badges ── */}
        <div className="border-t border-white/[0.06] pt-8 w-full">
          <h2 className="text-slate-300 font-semibold mb-6 tracking-widest uppercase text-xs">
            How It Works
          </h2>
          <ol className="flex flex-col sm:flex-row gap-6 text-sm text-slate-400">
            {steps.map(({ n, label, desc }, i) => (
              <li key={n} className="flex-1 flex flex-col items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center"
                  style={{ animation: `glow-pulse 3s ${i * 0.8}s ease-in-out infinite` }}
                >
                  <span className="text-blue-400 font-bold text-sm">{n}</span>
                </div>
                <span className="font-semibold text-slate-200">{label}</span>
                <span className="text-center leading-relaxed">{desc}</span>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </main>
  );
}
