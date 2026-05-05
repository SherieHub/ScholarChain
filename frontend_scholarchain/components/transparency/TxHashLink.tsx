interface TxHashLinkProps {
  txHash: string;
  label?: string;
  short?: boolean;
}

export default function TxHashLink({
  txHash,
  label,
  short = true,
}: TxHashLinkProps) {
  const shortened = txHash.slice(0, 10) + "..." + txHash.slice(-6);
  const display = short ? shortened : txHash;
  const url = "https://preprod.cardanoscan.io/transaction/" + txHash;
  const linkText = label !== undefined ? label : display;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="txhash-link"
      className="text-blue-400 hover:text-blue-300 underline font-mono text-sm break-all"
    >
      {linkText}
    </a>
  );
}