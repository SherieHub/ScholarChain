"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg px-1 py-0.5"
    >
      <ArrowLeft
        className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      Back
    </button>
  );
}
