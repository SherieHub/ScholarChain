"use client";

import { useWallet } from "@meshsdk/react";
import { useMeshReady } from "@/app/providers";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";

type WalletRole = "admin" | "scholar" | "applicant" | "sponsor";

const ROLE_CONFIG: Record<WalletRole, { icon: string; heading: string; tag: string; tagColor: string }> = {
  admin: {
    icon: "🔐",
    heading: "Admin Access Required",
    tag: "Admin",
    tagColor: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
  scholar: {
    icon: "🎖️",
    heading: "Scholar Verification",
    tag: "Scholar",
    tagColor: "bg-green-500/10 border-green-500/20 text-green-400",
  },
  applicant: {
    icon: "📝",
    heading: "Wallet Required to Apply",
    tag: "Applicant",
    tagColor: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  },
  sponsor: {
    icon: "🤝",
    heading: "Sponsor Portal",
    tag: "Sponsor",
    tagColor: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  },
};

interface WalletGateProps {
  children: React.ReactNode;
  message?: string;
  role?: WalletRole;
}

export default function WalletGate({
  children,
  message = "Connect your Cardano wallet to continue.",
  role,
}: WalletGateProps) {
  const meshReady = useMeshReady();
  const { connected } = useWallet();

  if (!meshReady) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
        <div className="h-4 w-48 bg-white/[0.07] rounded-lg" />
        <div className="h-4 w-64 bg-white/[0.05] rounded-lg" />
        <div className="h-10 w-40 bg-white/[0.07] rounded-xl" />
      </div>
    );
  }

  if (!connected) {
    const cfg = role ? ROLE_CONFIG[role] : null;

    return (
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex flex-col items-center gap-5 text-center">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-2xl">
          {cfg ? cfg.icon : "🔒"}
        </div>

        <div className="flex flex-col items-center gap-2">
          {cfg && (
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.tagColor}`}>
              {cfg.tag}
            </span>
          )}
          <p className="text-white font-medium text-sm">{cfg ? cfg.heading : "Wallet Required"}</p>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{message}</p>
        </div>

        <WalletConnectButton />
      </div>
    );
  }

  return <>{children}</>;
}
