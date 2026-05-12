import BackButton from "@/components/ui/BackButton";
import SponsorEntryForm from "@/components/forms/SponsorEntryForm";

export default function SponsorEntryPage() {
  return (
    <main className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <BackButton href="/" />
        <div>
          <h1 className="text-3xl font-bold mb-1">Sponsor Registration</h1>
          <p className="text-slate-400 text-sm">Register your pledge to support scholars on-chain.</p>
        </div>
        <SponsorEntryForm />
      </div>
    </main>
  );
}
