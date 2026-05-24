"use client";

import { useState, useEffect, useCallback } from "react";
import { useScholarData } from "@/hooks/useScholarData";
import ScholarTable, { SkeletonRow } from "@/components/dashboard/ScholarTable";
import ScholarAchievementsReviewTable from "@/components/dashboard/ScholarAchievementsReviewTable";
import SponsorTable from "@/components/dashboard/SponsorTable";
import TreasuryMintPanel from "@/components/dashboard/TreasuryMintPanel";
import BackButton from "@/components/ui/BackButton";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { sendADA } from "@/lib/mesh/sendAda";
import { updateScholarPolicyId } from "@/lib/firebase/scholars";
import { getAllPendingAchievements, updateAchievementStatus, markAchievementRewarded } from "@/lib/firebase/scholarAchievements";

import { getScholarshipsByCurrentSemester, approveScholarship, markScholarshipPaid, expireStaleScholarships } from "@/lib/firebase/scholarships";
import { getAllSponsors } from "@/lib/firebase/sponsors";
import { parseTxError } from "@/lib/mesh/errorHandler";
import { getUniversityConfig, updateNftPolicyId } from "@/lib/firebase/config-store";
import { mintScholarNFT } from "@/lib/mesh/mintNFT";
import { sendTokenReward } from "@/lib/mesh/sendMultiAsset";
import WalletStatus from "@/components/wallet/WalletStatus";
import WalletGate from "@/components/wallet/WalletGate";
import TxHashLink from "@/components/transparency/TxHashLink";
import type { Scholar, Scholarship, Sponsor } from "@/types";
import type { ScholarAchievement } from "@/types/scholarAchievement";
import { getCurrentSemester } from "@/lib/utils/semesterUtils";

const SCHOLARSHIP_AMOUNT_ADA = "5";

type ActiveTab = "table" | "rewards" | "sponsors" | "treasury";

export default function AdminDashboard() {
  const { wallet, address, connected, disconnect } = useWalletConnection();
  const { scholars, loading, error, refresh } = useScholarData("all");

  const [wrongWallet, setWrongWallet] = useState<string | null>(null);
  // Prevents a flash of dashboard content before the wallet check resolves
  const [walletChecked, setWalletChecked] = useState(false);

  // Validate connected wallet against the stored admin address in Firestore config
  useEffect(() => {
    if (!connected || !address) {
      setWrongWallet(null);
      setWalletChecked(false);
      return;
    }
    setWalletChecked(false);
    getUniversityConfig()
      .then(config => {
        const admins = config.adminWalletAddresses ?? [];
        if (admins.length > 0 && !admins.map(a => a.trim()).includes(address.trim())) {
          setWrongWallet(admins[0]);
        } else {
          setWrongWallet(null);
        }
      })
      .catch(() => setWrongWallet(null)) // config missing → allow through
      .finally(() => setWalletChecked(true));
  }, [connected, address]);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [mintSuccesses, setMintSuccesses] = useState<Record<string, string>>({});
  const [sendSuccesses, setSendSuccesses] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<ActiveTab>("table");
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [pendingAchievements, setPendingAchievements] = useState<ScholarAchievement[]>([]);
  const [achievementProcessingId, setAchievementProcessingId] = useState<string | null>(null);
  const [achievementRewardSuccesses, setAchievementRewardSuccesses] = useState<Record<string, { txHash: string; tokens: number }>>({});
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);
  const [scholarshipMap, setScholarshipMap] = useState<Map<string, Scholarship>>(new Map());

  const loadScholarships = useCallback(async () => {
    try {
      await expireStaleScholarships();
      const list = await getScholarshipsByCurrentSemester();
      setScholarshipMap(new Map(list.map(s => [s.scholarId, s])));
    } catch {
      setScholarshipMap(new Map());
    }
  }, []);

  const loadSponsors = useCallback(async () => {
    setSponsorsLoading(true);
    try {
      const data = await getAllSponsors();
      setSponsors(data);
    } catch {
      setSponsors([]);
    } finally {
      setSponsorsLoading(false);
    }
  }, []);

  const loadPendingRewards = useCallback(async () => {
    setRewardsLoading(true);
    try {
      const achievements = await getAllPendingAchievements();
      setPendingAchievements(achievements);
    } catch (err: unknown) {
      setRowErrors((prev) => ({ ...prev, ach_load: String(err) }));
    } finally {
      setRewardsLoading(false);
    }
  }, []);

  const handleApproveAchievement = async (achievement: ScholarAchievement, tokenAmount: number) => {
    if (!wallet || !achievement.id) return;
    const scholar = scholars.find((s) => s.id === achievement.scholarId);
    if (!scholar) {
      setRowErrors((prev) => ({ ...prev, [`ach_${achievement.id}`]: "Scholar not found." }));
      return;
    }
    setAchievementProcessingId(achievement.id);
    setRowErrors((prev) => { const next = { ...prev }; delete next[`ach_${achievement.id}`]; return next; });
    try {
      const { txHash } = await sendTokenReward(wallet, scholar.walletAddress, tokenAmount);
      await markAchievementRewarded(achievement.id, txHash, tokenAmount);
      setAchievementRewardSuccesses((prev) => ({
        ...prev,
        [achievement.id!]: { txHash, tokens: tokenAmount },
      }));
      setPendingAchievements((prev) => prev.filter((a) => a.id !== achievement.id));
    } catch (err: unknown) {
      setRowErrors((prev) => ({ ...prev, [`ach_${achievement.id}`]: parseTxError(err) }));
    } finally {
      setAchievementProcessingId(null);
    }
  };

  const handleRejectAchievement = async (achievement: ScholarAchievement, note: string) => {
    if (!achievement.id) return;
    setAchievementProcessingId(achievement.id);
    try {
      await updateAchievementStatus(achievement.id, "Rejected", note);
      setPendingAchievements((prev) => prev.filter((a) => a.id !== achievement.id));
    } catch (err: unknown) {
      setRowErrors((prev) => ({ ...prev, [`ach_${achievement.id}`]: parseTxError(err) }));
    } finally {
      setAchievementProcessingId(null);
    }
  };

  // Reload scholarships whenever the scholars list refreshes
  useEffect(() => {
    if (connected) loadScholarships();
  }, [connected, loadScholarships]);

  const handleApproveScholarship = async (scholarship: Scholarship) => {
    if (!scholarship.id) return;
    try {
      await approveScholarship(scholarship.id);
      await loadScholarships();
    } catch (err: unknown) {
      setRowErrors(prev => ({ ...prev, [`approve_${scholarship.scholarId}`]: parseTxError(err) }));
    }
  };

  const handleSendToScholar = async (scholar: Scholar) => {
    if (!wallet || !scholar.id) return;

    // Semester guard — must have an Approved scholarship for the current semester
    const scholarship = scholarshipMap.get(scholar.id);
    if (!scholarship?.id || scholarship.status !== "Approved") {
      setRowErrors(prev => ({
        ...prev,
        [scholar.id!]: "No approved scholarship for " + getCurrentSemester().label + ".",
      }));
      return;
    }

    setProcessingId(scholar.id);
    setRowErrors(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    setSendSuccesses(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    try {
      const hash = await sendADA(wallet, scholar.walletAddress, SCHOLARSHIP_AMOUNT_ADA);
      await markScholarshipPaid(scholarship.id, hash);
      setSendSuccesses(prev => ({ ...prev, [scholar.id!]: hash }));
      await loadScholarships();
      refresh();
    } catch (err: unknown) {
      setRowErrors(prev => ({ ...prev, [scholar.id!]: parseTxError(err) }));
    } finally {
      setProcessingId(null);
    }
  };

  const handleMint = async (scholar: Scholar) => {
    if (!wallet || !scholar.id) return;
    setMintingId(scholar.id);
    setRowErrors(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    setMintSuccesses(prev => { const next = { ...prev }; delete next[scholar.id!]; return next; });
    try {
      const config = await getUniversityConfig();
      const { txHash: mintTxHash, policyId, assetName } = await mintScholarNFT(wallet, scholar, config.badgeIPFSUri);
      try {
        await updateScholarPolicyId(scholar.id, policyId, assetName);
        if (!config.nftPolicyId) await updateNftPolicyId(policyId);
        // Minting = admin approval of identity — auto-approve the pending scholarship
        const scholarship = scholarshipMap.get(scholar.id);
        if (scholarship?.id && scholarship.status === "Pending") {
          await approveScholarship(scholarship.id);
        }
      } catch { /* Firestore metadata update failed — mint already confirmed on-chain */ }
      setMintSuccesses(prev => ({ ...prev, [scholar.id!]: mintTxHash }));
      await loadScholarships();
      refresh();
    } catch (err: unknown) {
      setRowErrors(prev => ({ ...prev, [scholar.id!]: parseTxError(err) }));
    } finally {
      setMintingId(null);
    }
  };

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "table", label: "Scholar Table" },
    { id: "rewards", label: "Rewards" },
    { id: "sponsors", label: "Sponsors" },
    { id: "treasury", label: "Treasury" },
  ];

  return (
    <main className="relative flex flex-col items-center py-16 px-4 flex-1 overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-600/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-600/8 blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-6">
        <BackButton href="/" />

        <WalletGate role="admin" message="Connect your admin wallet to manage scholars and send scholarships.">

        <div>
          <h1 className="text-3xl font-bold text-gradient-animated mb-1">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">ScholarChain · Preprod Testnet</p>
        </div>

        <WalletStatus />

        {/* Wallet check in progress — prevent flash of dashboard content */}
        {connected && !walletChecked ? (
          <div className="flex items-center gap-3 py-10 justify-center text-slate-500 text-sm">
            <div className="h-4 w-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
            Verifying wallet…
          </div>
        ) : wrongWallet ? (
          /* Wrong wallet — full blocking screen, no dashboard content shown */
          <div className="flex flex-col items-center gap-6 py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">
              🚫
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Wrong Wallet Connected</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                This dashboard is reserved for the designated admin wallet.
                Disconnect and reconnect with the correct wallet to proceed.
              </p>
            </div>
            <div className="w-full max-w-sm flex flex-col gap-2">
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-left">
                <p className="text-xs text-slate-500 mb-1">Currently Connected</p>
                <p className="font-mono text-xs text-red-400 break-all">{address}</p>
              </div>
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-left">
                <p className="text-xs text-slate-500 mb-1">Expected Admin Wallet</p>
                <p className="font-mono text-xs text-slate-400">
                  {wrongWallet.slice(0, 20)}…
                </p>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              Disconnect &amp; Switch Wallet
            </button>
          </div>
        ) : (
          <>

        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm backdrop-blur-sm">
            Failed to load scholars: {error}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                if (id === "rewards") loadPendingRewards();
                if (id === "sponsors") loadSponsors();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "table" && (
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-sm"><tbody><SkeletonRow /><SkeletonRow /><SkeletonRow /></tbody></table>
              </div>
            ) : (
              <ScholarTable
                scholars={scholars}
                onSend={handleSendToScholar}
                onMint={handleMint}
                onApproveScholarship={handleApproveScholarship}
                processingId={processingId}
                mintingId={mintingId}
                scholarshipMap={scholarshipMap}
              />
            )}

            {/* Mint success banners */}
            {Object.entries(mintSuccesses).map(([scholarId, hash]) => (
              <div key={`mint_${scholarId}`} className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-base">✓</span>
                  <span className="text-green-300 text-sm font-semibold">Scholar ID NFT Minted</span>
                  <span className="text-green-500 text-xs">Transaction confirmed on-chain</span>
                </div>
                <TxHashLink txHash={hash} label="View Transaction" />
              </div>
            ))}

            {/* Scholarship send success banners */}
            {Object.entries(sendSuccesses).map(([scholarId, hash]) => (
              <div key={`send_${scholarId}`} className="flex items-center justify-between bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sky-400 text-base">✓</span>
                  <span className="text-sky-300 text-sm font-semibold">5 tADA Scholarship Sent</span>
                  <span className="text-sky-500 text-xs">Transaction confirmed on Cardano Preprod</span>
                </div>
                <TxHashLink txHash={hash} label="View Transaction" />
              </div>
            ))}

            {/* Transaction error banners */}
            {Object.entries(rowErrors)
              .filter(([id]) => !id.startsWith("reward_") && !id.startsWith("ach_"))
              .map(([id, msg]) => (
                <div key={id} className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  Transaction error: {msg}
                </div>
              ))}
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="flex flex-col gap-4">
            {rewardsLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <ScholarAchievementsReviewTable
                achievements={pendingAchievements}
                scholars={scholars}
                onApprove={handleApproveAchievement}
                onReject={handleRejectAchievement}
                processingId={achievementProcessingId}
              />
            )}

            {/* Achievement reward success banners */}
            {Object.entries(achievementRewardSuccesses).map(([achId, { txHash: aHash, tokens }]) => (
              <div key={`ach_ok_${achId}`} className="flex items-center justify-between bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-violet-400 text-base">✓</span>
                  <span className="text-violet-300 text-sm font-semibold">{tokens.toLocaleString()} SCHOLAR Tokens Sent</span>
                  <span className="text-violet-500 text-xs">Achievement reward confirmed on-chain</span>
                </div>
                <TxHashLink txHash={aHash} label="View Transaction" />
              </div>
            ))}

            {/* Reward error banners */}
            {Object.entries(rowErrors)
              .filter(([id]) => id.startsWith("ach_"))
              .map(([id, msg]) => (
                <div key={id} className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {msg}
                </div>
              ))}
          </div>
        )}

        {activeTab === "sponsors" && (
          <SponsorTable sponsors={sponsors} loading={sponsorsLoading} />
        )}

        {activeTab === "treasury" && <TreasuryMintPanel />}

          </> /* closes the normal-dashboard branch of the ternary */
        )} {/* closes the walletChecked / wrongWallet ternary */}

        </WalletGate>
      </div>
    </main>
  );
}
