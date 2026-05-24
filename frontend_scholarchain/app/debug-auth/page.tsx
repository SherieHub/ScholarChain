"use client";

import dynamic from "next/dynamic";

const DebugAuthContent = dynamic(() => import("./_content"), {
  ssr: false,
  loading: () => (
    <div className="p-10 font-mono text-sm bg-gray-900 text-green-400 min-h-screen">
      Loading diagnostic tool...
    </div>
  ),
});

export default function DebugAuthPage() {
  return <DebugAuthContent />;
}
