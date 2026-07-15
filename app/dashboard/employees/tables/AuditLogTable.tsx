import DataTable from "@/components/ui/DataTable";

const auditLogs = [
  { action: "Updated compensation", user: "Admin User", date: "Jan 14, 2026", status: "Completed" },
  { action: "Uploaded document", user: "HR Manager", date: "Jan 15, 2026", status: "Completed" },
];

const columns = [
  { header: "Action", accessor: "action" },
  { header: "User", accessor: "user" },
  { header: "Date", accessor: "date" },
  { header: "Status", accessor: "status" },
] as const;

export default function AuditLogTable() {
  return (
    <DataTable
      title="Audit Log"
      columns={columns}
      data={auditLogs}
      searchPlaceholder="Search audit logs..."
    />
  );
}