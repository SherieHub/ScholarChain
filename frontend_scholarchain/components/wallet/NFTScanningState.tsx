export default function NFTScanningState() {
  return (
    <div className="flex flex-col items-center gap-6 py-12 px-4 text-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl">
          🎖️
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Scanning Wallet...</h2>
        <p className="text-slate-400 text-sm">Verifying Scholar Badge NFT ownership on Cardano Preprod.</p>
      </div>
    </div>
  );
}
