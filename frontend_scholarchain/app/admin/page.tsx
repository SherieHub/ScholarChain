"use client";

import dynamic from "next/dynamic";

// Next.js dynamic import ensures this only runs in the browser
const AdminDashboard = dynamic(
  () => import("@/components/dashboard/AdminDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading Admin Dashboard...</p>
      </div>
    ),
  }
);

export default function AdminPage() {
  // No props needed! Just render the dashboard.
  return <AdminDashboard />;
}