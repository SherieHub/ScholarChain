import BackButton from "@/components/ui/BackButton";

export default function TransparencyPage() {
  return (
    <main className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold mb-2">Transparency Dashboard</h1>
          <p className="text-slate-400 text-sm">Coming in Increment 5.</p>
        </div>
      </div>
    </main>
  );
}
