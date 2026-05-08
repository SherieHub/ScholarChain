"use client";

import dynamic from "next/dynamic";

const [processingId, setProcessingId] = useState<string | null>(null);
const [rowResults, setRowResults] = useState<Record<string, { txHash?: string; error?: string }>>({});
const { scholars, loading, error, refresh } = useScholarData("Approved");

const handleSendToScholar = async (scholar: Scholar) => {
  if (!wallet || !scholar.id) return;
  setProcessingId(scholar.id);
  try {
    // Amount is fixed at a demo value (e.g., 5 ADA) for Increment 2
    // In Increment 4, this will be dynamic
    const txHash = await sendADA(wallet, scholar.walletAddress, "5");
    await markScholarAsPaid(scholar.id, txHash);
    setRowResults(prev => ({ ...prev, [scholar.id!]: { txHash } }));
    refresh(); // Re-fetch scholars to show updated LastPaidTxHash
  } catch (err: any) {
    setRowResults(prev => ({ ...prev, [scholar.id!]: { error: parseTxError(err) } }));
  } finally {
    setProcessingId(null);
  }
};

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