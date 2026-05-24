import { ExternalLink } from "lucide-react";

interface TxHashLinkProps {
  txHash: string;
  label?: string;
  short?: boolean;
}

export default function TxHashLink({ txHash, label, short = true }: TxHashLinkProps) {
  const shortened = txHash.slice(0, 10) + "…" + txHash.slice(-6);
  const display = short ? shortened : txHash;
  const linkText = label !== undefined ? label : display;
  const url = "https://preprod.cardanoscan.io/transaction/" + txHash;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="txhash-link"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-400/40 rounded-lg px-3 py-1.5 transition-all duration-150"
    >
      {linkText}
      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" aria-hidden="true" />
    </a>
  );
}
