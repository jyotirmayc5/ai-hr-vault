import DataTable from "@/components/ui/DataTable.old";

interface LeaveTableProps {
  leave: {
    type: string;
    startDate: string;
    endDate: string;
    status: string;
  }[];
}

const columns = [
  {
    header: "Leave Type",
    accessor: "type",
  },
  {
    header: "Start Date",
    accessor: "startDate",
  },
  {
    header: "End Date",
    accessor: "endDate",
  },
  {
    header: "Status",
    accessor: "status",
  },
] as const;

export default function LeaveTable({
  leave,
}: LeaveTableProps) {
  return (
    <DataTable
      title="Leave Requests"
      columns={columns}
      data={leave}
    />
  );
}