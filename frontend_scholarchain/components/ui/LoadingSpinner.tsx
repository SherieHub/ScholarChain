export default function LoadingSpinner({
  message = "Processing transaction...",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm animate-pulse">{message}</p>
      <p className="text-xs text-gray-500">This may take ~20 seconds on Preprod</p>
    </div>
  );
}