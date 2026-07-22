import DataTable from "@/components/ui/DataTable.old";

const training = [
  { course: "Security Awareness", category: "Compliance", status: "Completed", dueDate: "Jan 31, 2026" },
  { course: "Workplace Safety", category: "Safety", status: "In Progress", dueDate: "Apr 15, 2026" },
];

const columns = [
  { header: "Course", accessor: "course" },
  { header: "Category", accessor: "category" },
  { header: "Status", accessor: "status" },
  { header: "Due Date", accessor: "dueDate" },
] as const;

export default function TrainingTable() {
  return (
    <DataTable
      title="Training"
      columns={columns}
      data={training}
      searchPlaceholder="Search training..."
      actionLabel="Assign Training"
    />
  );
}