"use client";

import dynamic from "next/dynamic";
import BackButton from "@/components/ui/BackButton";

const ScholarPortalContent = dynamic(() => import("./_content"), {
  ssr: false,
  loading: () => (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-4 w-48 bg-white/[0.07] rounded-lg" />
      <div className="h-4 w-64 bg-white/[0.05] rounded-lg" />
      <div className="h-10 w-40 bg-white/[0.07] rounded-xl" />
    </div>
  ),
});

export default function ScholarPortalPage() {
  return (
    <main className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <BackButton href="/" />
        <ScholarPortalContent />
      </div>
    </main>
  );
}
