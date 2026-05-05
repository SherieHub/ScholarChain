"use client";

interface SuccessMessageProps {
  txHash: string;
  onReset: () => void;
}

export default function SuccessMessage({ txHash, onReset }: SuccessMessageProps) {
  const cardanoscanUrl = "https://preprod.cardanoscan.io/transaction/" + txHash;

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
  };

  return (
    <div className="bg-gray-900 border border-green-700 rounded-2xl p-6 max-w-lg w-full mx-auto text-center">
      <p className="text-green-400 text-2xl mb-2">Success</p>
      <h2 className="text-white font-semibold text-lg mb-1">
        Scholarship Sent Successfully!
      </h2>

      <div className="bg-gray-800 rounded-lg p-3 mt-4 mb-3 text-left">
        <p className="text-gray-400 text-xs mb-1">Transaction Hash</p>
        <a
          href={cardanoscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline font-mono text-sm break-all"
        >
          {txHash}
        </a>
      </div>

      <button
        onClick={handleCopy}
        aria-label="Copy transaction hash to clipboard"
        className="text-xs text-gray-400 hover:text-white underline mb-4"
      >
        Copy full TxHash
      </button>

      <br />

      <button
        onClick={onReset}
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-5 rounded-lg transition"
      >
        Send Another
      </button>
    </div>
  );
}
