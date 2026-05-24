import type { Scholar } from "@/types";

interface MintNFTButtonProps {
  scholar: Scholar;
  onMint: (scholar: Scholar) => void;
  disabled?: boolean;
  isMinting?: boolean;
}

export default function MintNFTButton({
  scholar,
  onMint,
  disabled = false,
  isMinting = false,
}: MintNFTButtonProps) {
  if (isMinting) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-950/60 border border-violet-500/30 rounded-lg">
        <div className="h-3.5 w-3.5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-violet-300 text-xs font-medium tracking-wide">Minting...</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => onMint(scholar)}
      disabled={disabled}
      className={[
        "group relative inline-flex items-center gap-1.5 px-3 py-1.5",
        "bg-gradient-to-r from-violet-600 to-purple-600",
        "hover:from-violet-500 hover:to-purple-500",
        "disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed",
        "text-white text-xs font-semibold rounded-lg",
        "shadow-md shadow-violet-900/50 hover:shadow-violet-600/50",
        "hover:-translate-y-px active:translate-y-0",
        "ring-1 ring-white/10 hover:ring-violet-400/30",
        "transition-all duration-150",
        "disabled:shadow-none disabled:translate-y-0 disabled:ring-white/5",
      ].join(" ")}
    >
      {/* Subtle inner shimmer on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150
                   bg-gradient-to-b from-white/10 to-transparent"
      />
      <span className="relative text-violet-200 group-hover:text-white transition-colors text-[11px]">
        ✦
      </span>
      <span className="relative">Mint Scholar ID</span>
    </button>
  );
}
