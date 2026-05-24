"use client";
import { useEffect, useState } from "react";
import { useWallet, useLovelace } from "@meshsdk/react";
import { useNFTVerification } from "@/hooks/useNFTVerification";
import ScholarDashboard from "@/components/dashboard/ScholarDashboard";
import AccessDenied from "@/components/wallet/AccessDenied";
import NFTScanningState from "@/components/wallet/NFTScanningState";
import WalletGate from "@/components/wallet/WalletGate";
import { submitAchievement, getScholarByWalletAddress } from "@/lib/firebase/scholars";
import { getCurrentScholarship } from "@/lib/firebase/scholarships";
import { getUniversityConfig } from "@/lib/firebase/config-store";
import { getWalletAddressBech32 } from "@/lib/utils/addressUtils";
import type { Scholar, Scholarship } from "@/types";
import ScholarshipStatusCard from "@/components/ui/ScholarshipStatusCard";
import ReEnrollForm from "@/components/forms/ReEnrollForm";
import AchievementsPanel from "@/components/achievements/AchievementsPanel";

// ── Step progress indicator ───────────────────────────────────────────────────
type Step = 1 | 2 | 3;

function PortalSteps({ active }: { active: Step }) {
  const steps = [
    { n: 1, label: "Connect" },
    { n: 2, label: "Sign" },
    { n: 3, label: "Verify" },
  ];

  return (
    <div className="flex items-center gap-0 w-full mb-2">
      {steps.map(({ n, label }, i) => {
        const done = n < active;
        const current = n === active;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  done
                    ? "bg-green-500/20 border-green-500/50 text-green-400"
                    : current
                    ? "bg-blue-500/20  border-blue-500/60  text-blue-300"
                    : "bg-white/[0.03] border-white/[0.10] text-slate-600"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={`text-xs ${
                  current ? "text-white" : done ? "text-green-400" : "text-slate-600"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 mb-4 ${
                  done ? "bg-green-500/40" : "bg-white/[0.08]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main portal content (rendered only when wallet is connected) ──────────────
function PortalContent() {
  const { connected, wallet, disconnect } = useWallet();
  const lovelace = useLovelace();
  const { portalState, scholar: hookScholar, error, reset, retry } = useNFTVerification();
  // localScholar overrides hookScholar after achievement submission so the
  // dashboard reflects the updated Firestore data without a full re-verification.
  const [localScholar, setLocalScholar] = useState<Scholar | null>(null);
  const scholar = localScholar ?? hookScholar;
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [badgeImageUri, setBadgeImageUri] = useState<string | undefined>(undefined);
  const [isSubmittingAchievement, setIsSubmittingAchievement] = useState(false);
  const [scholarship, setScholarship] = useState<Scholarship | null | undefined>(undefined);
  const [scholarshipLoading, setScholarshipLoading] = useState(false);

  useEffect(() => {
    if (!connected || !wallet) {
      setWalletAddress("");
      return;
    }
    getWalletAddressBech32(wallet).then((addr) => {
      if (addr) setWalletAddress(addr);
    });
  }, [connected, wallet]);

  // Fetch badge URI + current semester scholarship once authorised
  useEffect(() => {
    if (portalState !== "authorized" || !walletAddress) return;

    getUniversityConfig()
      .then((config) => setBadgeImageUri(config.badgeIPFSUri || undefined))
      .catch(() => setBadgeImageUri(undefined));

    setScholarshipLoading(true);
    getCurrentScholarship(walletAddress)
      .then(setScholarship)
      .catch(() => setScholarship(null))
      .finally(() => setScholarshipLoading(false));
  }, [portalState, walletAddress]);

  const adaBalance = lovelace ? (Number(lovelace) / 1_000_000).toFixed(2) : "—";

  const handleDisconnect = () => {
    disconnect();
    reset();
    setBadgeImageUri(undefined);
  };

  const handleSubmitAchievement = async (data: { proofLink: string }) => {
    if (!scholar?.id) return;
    setIsSubmittingAchievement(true);
    try {
      await submitAchievement(scholar.id, { subject: "", grade: "", proofLink: data.proofLink });
      // Refresh scholar so dashboard immediately shows "Under Review" status
      if (walletAddress) {
        const updated = await getScholarByWalletAddress(walletAddress);
        if (updated) setLocalScholar(updated);
      }
    } finally {
      setIsSubmittingAchievement(false);
    }
  };

  // ── Step 2: waiting for wallet signature ──────────────────────────────────
  if (portalState === "signing") {
    return (
      <>
        <PortalSteps active={2} />
        <div className="flex flex-col items-center gap-6 py-10 px-4 text-center bg-white/[0.03] border border-white/[0.08] rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl">
            ✍️
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Signature Required</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your wallet will ask you to sign a short message to prove ownership. No tADA is spent
              — this is a read-only authentication step.
            </p>
          </div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm">
            <div className="h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            Waiting for signature...
          </div>
          <button
            onClick={handleDisconnect}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 bg-red-500/5 hover:bg-red-500/10 rounded-xl px-5 py-2 transition-all duration-150"
          >
            Cancel and disconnect
          </button>
        </div>
      </>
    );
  }

  // ── Step 2 recovery: user rejected the signature ───────────────────────────
  if (portalState === "cancelled") {
    return (
      <>
        <PortalSteps active={2} />
        <div className="flex flex-col items-center gap-6 py-10 px-4 text-center bg-white/[0.03] border border-white/[0.08] rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Authentication Cancelled</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              You closed the signing window before approving. Sign the message to continue — no tADA
              is spent.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={retry}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full inline-flex items-center justify-center text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 bg-red-500/5 hover:bg-red-500/10 rounded-xl py-2.5 transition-all duration-150"
            >
              Disconnect and use a different wallet
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Step 3: scanning wallet for NFT ───────────────────────────────────────
  if (portalState === "scanning") {
    return (
      <>
        <PortalSteps active={3} />
        <NFTScanningState />
      </>
    );
  }

  // ── Step 3 recovery: scan timed out ───────────────────────────────────────
  if (portalState === "timeout") {
    return (
      <>
        <PortalSteps active={3} />
        <div className="flex flex-col items-center gap-6 py-10 px-4 text-center bg-white/[0.03] border border-white/[0.08] rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-2xl">
            ⏱️
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Scan Timed Out</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              The wallet asset scan took too long. The Cardano Preprod network may be congested.
              Your badge is not affected — please try again.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={retry}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full inline-flex items-center justify-center text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 bg-red-500/5 hover:bg-red-500/10 rounded-xl py-2.5 transition-all duration-150"
            >
              Disconnect
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Authorised: scholar dashboard ─────────────────────────────────────────
  if (portalState === "authorized" && scholar) {
    const canReEnroll =
      !scholarshipLoading &&
      (scholarship === null ||
        scholarship?.status === "Expired" ||
        scholarship?.status === "Rejected");

    return (
      <div className="flex flex-col gap-6">
        <ScholarDashboard
          scholar={scholar}
          walletBalance={adaBalance}
          badgeImageUri={badgeImageUri}
          onDisconnect={handleDisconnect}
          onSubmitAchievement={handleSubmitAchievement}
          isSubmittingAchievement={isSubmittingAchievement}
        />

        {/* Semester scholarship status */}
        {scholarshipLoading ? (
          <div className="h-20 bg-white/[0.03] border border-white/[0.08] rounded-2xl animate-pulse" />
        ) : scholarship && !canReEnroll ? (
          <ScholarshipStatusCard scholarship={scholarship} />
        ) : canReEnroll ? (
          <ReEnrollForm
            scholar={scholar}
            onSuccess={() =>
              getCurrentScholarship(scholar.walletAddress).then(setScholarship)
            }
          />
        ) : null}

        {/* Achievements module */}
        <AchievementsPanel scholarId={scholar.id!} />
      </div>
    );
  }

  // ── Authorised but no Firestore record ────────────────────────────────────
  if (portalState === "authorized" && !scholar) {
    return (
      <div className="flex flex-col items-center gap-6 py-10 px-4 text-center bg-white/[0.03] border border-white/[0.08] rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Scholar Record Not Found</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Your wallet holds a valid Scholar Badge, but no application record was found for this
            address. Please contact your scholarship administrator.
          </p>
        </div>
        {walletAddress && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 w-full text-left">
            <p className="text-xs text-slate-500 mb-1">Connected Wallet</p>
            <p className="font-mono text-xs text-slate-300 break-all">{walletAddress}</p>
          </div>
        )}
        <button
          onClick={handleDisconnect}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 bg-red-500/5 hover:bg-red-500/10 rounded-xl px-5 py-2.5 transition-all duration-150"
        >
          Disconnect and try another wallet
        </button>
      </div>
    );
  }

  // ── Denied: no matching NFT ───────────────────────────────────────────────
  if (portalState === "denied") {
    return (
      <div className="flex flex-col gap-4">
        <AccessDenied walletAddress={walletAddress} onDisconnect={handleDisconnect} />
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      </div>
    );
  }

  return null;
}

// ── Page shell ────────────────────────────────────────────────────────────────
export default function ScholarPortalContent() {
  return (
    <WalletGate
      role="scholar"
      message="Connect your Cardano wallet to begin. You will be asked to sign an authentication challenge."
    >
      <div>
        <h1 className="text-3xl font-bold mb-1">Scholar Portal</h1>
        <p className="text-slate-400 text-sm">
          Verify your Scholar Badge NFT and access your profile.
        </p>
      </div>
      <PortalContent />
    </WalletGate>
  );
}
