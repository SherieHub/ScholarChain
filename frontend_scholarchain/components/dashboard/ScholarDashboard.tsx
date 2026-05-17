import type { Scholar } from "@/types";
import { shortenAddress } from "@/lib/utils/addressUtils";
import TxHashLink from "@/components/transparency/TxHashLink";
import AchievementSubmitForm from "@/components/forms/AchievementSubmitForm";
import AchievementStatusCard from "@/components/ui/AchievementStatusCard";

function ipfsToGateway(uri: string): string {
  if (uri.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  return uri;
}

interface ScholarDashboardProps {
  scholar: Scholar;
  walletBalance: string;
  badgeImageUri?: string;
  onDisconnect: () => void;
  onSubmitAchievement?: (data: { subject: string; grade: string; proofLink: string }) => Promise<void>;
  isSubmittingAchievement?: boolean;
}

export default function ScholarDashboard({
  scholar,
  walletBalance,
  badgeImageUri,
  onDisconnect,
  onSubmitAchievement,
  isSubmittingAchievement = false,
}: ScholarDashboardProps) {
  const badgeGatewayUrl = badgeImageUri ? ipfsToGateway(badgeImageUri) : null;
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{scholar.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/25">
              ✓ Verified Scholar
            </span>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="text-sm text-slate-400 hover:text-white underline transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Scholar Info Card */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Scholar Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Course</p>
            <p className="text-sm text-white font-medium">{scholar.course}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Status</p>
            <p className="text-sm text-green-400 font-medium">{scholar.status}</p>
          </div>
          {scholar.scholarTokenId && (
            <div className="col-span-2">
              <p className="text-xs text-slate-500 mb-0.5">NFT Asset Name</p>
              <p className="font-mono text-xs text-slate-300 break-all">{scholar.scholarTokenId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Wallet</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Balance</span>
          <span className="text-lg font-bold text-white">
            {walletBalance} <span className="text-slate-400 text-sm font-normal">tADA</span>
          </span>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Address</p>
          <p className="font-mono text-xs text-slate-300">{shortenAddress(scholar.walletAddress)}</p>
        </div>
        {scholar.lastPaidTxHash && (
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Last Payment</p>
            <TxHashLink txHash={scholar.lastPaidTxHash} label="View on Cardanoscan" />
          </div>
        )}
      </div>

      {/* NFT Badge Card */}
      {scholar.policyId && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Scholar Badge NFT</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/20 flex items-center justify-center overflow-hidden text-2xl shrink-0">
              {badgeGatewayUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={badgeGatewayUrl}
                  alt="Scholar Badge NFT"
                  className="w-full h-full object-cover"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                  }}
                />
              ) : null}
              <span style={{ display: badgeGatewayUrl ? "none" : "flex" }}>🎖️</span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">{scholar.name} — Scholar Badge</p>
              <p className="font-mono text-xs text-slate-500 mt-0.5">{scholar.policyId.slice(0, 20)}...</p>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Section */}
      {scholar.achievement ? (
        <AchievementStatusCard achievement={scholar.achievement} />
      ) : null}

      {onSubmitAchievement && scholar.id && (
        <AchievementSubmitForm
          scholarId={scholar.id}
          onSubmit={onSubmitAchievement}
          isSubmitting={isSubmittingAchievement}
          currentAchievement={scholar.achievement}
        />
      )}
    </div>
  );
}
