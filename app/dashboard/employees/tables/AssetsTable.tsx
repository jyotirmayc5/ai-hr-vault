import DataTable from "@/components/ui/DataTable.old";

const assets = [
  { asset: "Laptop", serialNumber: "LAP-1001", assignedDate: "Jan 10, 2026", status: "Assigned" },
  { asset: "Access Badge", serialNumber: "BADGE-204", assignedDate: "Jan 10, 2026", status: "Active" },
];

const columns = [
  { header: "Asset", accessor: "asset" },
  { header: "Serial Number", accessor: "serialNumber" },
  { header: "Assigned Date", accessor: "assignedDate" },
  { header: "Status", accessor: "status" },
] as const;

export default function AssetsTable() {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Assets</h2>
      <DataTable columns={columns} data={assets} />
    </div>
  );
}