import Link from "next/link";
import type { EmployeeDocument } from "@/types/employee";

export default function DocumentsTable({
  documents,
  employeeId,
}: {
  documents: EmployeeDocument[];
  employeeId: string;
}) {
  if (!documents.length) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No documents have been uploaded for this employee yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Uploaded employee documents, review status, expiration dates, and OCR confidence.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4 font-medium">Document</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Expiration</th>
              <th className="p-4 font-medium">Confidence</th>
              <th className="p-4 font-medium">Uploaded</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-t">
                <td className="p-4">{doc.file_name ?? "Untitled"}</td>
                <td className="p-4">{doc.document_type?.name ?? "—"}</td>
                <td className="p-4">{doc.extraction_status ?? "Pending"}</td>
                <td className="p-4">{doc.expiration_date ?? "—"}</td>
                <td className="p-4">
                  {doc.confidence_score != null
                    ? `${doc.confidence_score}%`
                    : "—"}
                </td>
                <td className="p-4">
                  {doc.created_at
                    ? new Date(doc.created_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-4">
                  <Link
                    href={`/dashboard/employees/${employeeId}/documents/${doc.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}