import DataTable from "@/components/ui/DataTable";

type DocumentRow = {
  id: string;
  file_name: string;
  extraction_status: string | null;
  expiration_date: string | null;
  confidence_score: number | null;
  created_at: string;
  document_type: {
    name: string;
  } | null;
};

export default function DocumentsTable({
  documents,
}: {
  documents: DocumentRow[];
}) {
  const rows = documents.map((doc) => ({
    name: doc.file_name,
    type: doc.document_type?.name ?? "—",
    status: doc.extraction_status ?? "—",
    confidence:
      doc.confidence_score != null ? `${doc.confidence_score}%` : "—",
    expiration: doc.expiration_date ?? "—",
  }));

  const columns = [
    { header: "Document", accessor: "name" },
    { header: "Type", accessor: "type" },
    { header: "Status", accessor: "status" },
    { header: "Confidence", accessor: "confidence" },
    { header: "Expiration", accessor: "expiration" },
  ] as const;

  return (
    <DataTable
      title="Documents"
      columns={columns}
      data={rows}
      searchPlaceholder="Search documents..."
      actionLabel="Upload Document"
    />
  );
}