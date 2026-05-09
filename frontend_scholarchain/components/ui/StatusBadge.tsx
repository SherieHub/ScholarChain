import React from 'react';

// Define the exact literal types allowed for the status
export type Status = "Pending" | "Approved" | "Rejected" | "Paid";

// Map each status to its specific Tailwind CSS color scheme
const statusStyles: Record<Status, string> = {
  Pending:  "bg-yellow-900 text-yellow-300 border border-yellow-700",
  Approved: "bg-green-900 text-green-300 border border-green-700",
  Rejected: "bg-red-900 text-red-300 border border-red-700",
  Paid:     "bg-blue-900 text-blue-300 border border-blue-700",
};

export default function StatusBadge({ status }: { status: Status }) {
  // Fallback in case an invalid status accidentally gets passed in
  const safeStyle = statusStyles[status] || "bg-gray-800 text-gray-300 border border-gray-600";
  const safeText = statusStyles[status] ? status : "Unknown";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${safeStyle}`}>
      {safeText}
    </span>
  );
}