import BackButton from "@/components/ui/BackButton";

export default function SponsorEntryPage() {
  return (
    <main className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <BackButton href="/" />
        <div>
          <h1 className="text-3xl font-bold mb-2">Sponsor Registration</h1>
          <p className="text-slate-400 text-sm">Coming in Increment 2.</p>
        </div>
      </div>
    </main>
  );
}
