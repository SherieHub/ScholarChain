interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

const friendlyErrors: Record<string, string> = {
  "User declined": "You closed the signing window. Click Try Again when ready.",
  "Insufficient funds":
    "Your wallet doesn't have enough tADA. Visit the Cardano Faucet to top up.",
};

function getFriendlyMessage(error: string): string {
  for (const key of Object.keys(friendlyErrors)) {
    if (error.includes(key)) return friendlyErrors[key];
  }
  return error;
}

export default function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  return (
    <div className="bg-gray-900 border border-red-700 rounded-2xl p-6 max-w-lg w-full mx-auto text-center">
      <p className="text-red-400 text-2xl mb-2">❌</p>
      <h2 className="text-white font-semibold text-lg mb-3">Transaction Failed</h2>

      <div className="bg-gray-800 rounded-lg p-3 text-left mb-4">
        <p className="text-gray-300 text-sm font-mono">{getFriendlyMessage(error)}</p>
      </div>

      <button
        onClick={onDismiss}
        className="bg-danger hover:opacity-80 text-white text-sm font-medium py-2 px-5 rounded-lg transition"
      >
        Try Again
      </button>
    </div>
  );
}