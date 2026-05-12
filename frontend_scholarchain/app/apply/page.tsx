import BackButton from "@/components/ui/BackButton";
import ScholarApplicationForm from "@/components/forms/ScholarApplicationForm";

export default function ApplyPage() {
  return (
    <main className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold mb-1">Apply for Scholarship</h1>
          <p className="text-slate-400 text-sm">Submit your application below. No wallet connection required.</p>
        </div>
        <ScholarApplicationForm />
      </div>
    </main>
  );
}
