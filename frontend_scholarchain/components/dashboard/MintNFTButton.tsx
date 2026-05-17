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
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-purple-400 text-xs">Minting NFT...</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => onMint(scholar)}
      disabled={disabled}
      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
    >
      Mint Scholar ID 🎖️
    </button>
  );
}
