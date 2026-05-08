interface ScholarTableProps {
  scholars: Scholar[];
  onSend: (scholar: Scholar) => void;
  processingId: string | null; // Scholar ID currently processing a transaction
}