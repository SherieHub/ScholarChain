"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
}

export default function BackButton({ href }: BackButtonProps) {
  const router = useRouter();

  const className =
    "inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg px-1 py-0.5";

  const content = (
    <>
      <ArrowLeft
        className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      Back
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={() => router.back()} className={className}>
      {content}
    </button>
  );
}
