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
      {/* Background radial glows */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 w-[480px] h-[480px] rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/3 w-[360px] h-[360px] rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center gap-10">

        {/* Gradient header */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">
            ScholarChain
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Transparent, blockchain-verified scholarship management on Cardano.
          </p>
        </div>

        {/* Glassmorphism nav cards */}
        <div className="grid sm:grid-cols-3 gap-4 w-full">
          {cards.map(({ href, icon: Icon, title, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-start gap-3 bg-white/[0.02] backdrop-blur-md border border-white/[0.06] hover:border-blue-500/40 hover:bg-white/[0.05] rounded-2xl p-5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300
                  ${color === "blue"   ? "bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20"   : ""}
                  ${color === "indigo" ? "bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20" : ""}
                  ${color === "violet" ? "bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500/20" : ""}
                `}
              >
                <Icon
                  className={`w-5 h-5
                    ${color === "blue"   ? "text-blue-400"   : ""}
                    ${color === "indigo" ? "text-indigo-400" : ""}
                    ${color === "violet" ? "text-violet-400" : ""}
                  `}
                  aria-hidden="true"
                />
              </div>
              <span className="text-white font-semibold">{title}</span>
              <span className="text-slate-400 text-sm">{desc}</span>
            </Link>
          ))}
        </div>

        {/* How It Works — glowing step badges */}
        <div className="border-t border-white/[0.06] pt-8 w-full">
          <h2 className="text-slate-300 font-semibold mb-6 tracking-wide uppercase text-xs">
            How It Works
          </h2>
          <ol className="flex flex-col sm:flex-row gap-6 text-sm text-slate-400">
            {steps.map(({ n, label, desc }) => (
              <li key={n} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.25)]">
                  <span className="text-blue-400 font-bold text-sm">{n}</span>
                </div>
                <span className="font-medium text-slate-200">{label}</span>
                <span className="text-center leading-relaxed">{desc}</span>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </main>
  );
}
