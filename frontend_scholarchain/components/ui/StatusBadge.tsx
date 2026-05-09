type Status = "Pending" | "Approved" | "Rejected" | "Paid";

const statusStyles: Record<Status, string> = {
  Pending:  "bg-yellow-900 text-yellow-300 border border-yellow-700",
  Approved: "bg-green-900 text-green-300 border border-green-700",
  Rejected: "bg-red-900 text-red-300 border border-red-700",
  Paid:     "bg-blue-900 text-blue-300 border border-blue-700",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
