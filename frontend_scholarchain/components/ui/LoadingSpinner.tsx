export default function LoadingSpinner({
  message = "Processing transaction...",
}: {
  message?: string;
}) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-10 w-full flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-0 m-2 rounded-full bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.3)]" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-slate-300 text-sm font-medium animate-pulse">{message}</p>
        <p className="text-slate-600 text-xs">This may take ~20 seconds on Preprod</p>
      </div>
    </div>
  );
}
