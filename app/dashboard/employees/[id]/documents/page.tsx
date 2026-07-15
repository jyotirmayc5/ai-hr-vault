import { notFound } from "next/navigation";
import { getEmployeeProfile } from "@/app/dashboard/employees/services/employee-profile.service";
import { getEmployeeDocuments } from "@/app/dashboard/employees/services/employee-document.service";
import DocumentsTable from "./documents-table";

export default async function EmployeeDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id === "undefined") {
    notFound();
  }

  const employee = await getEmployeeProfile(id);
  const documents = await getEmployeeDocuments(id);

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Employee Documents</p>
        <h1 className="text-2xl font-semibold">
          {employee.employee.first_name} {employee.employee.last_name}
        </h1>
      </div>

      <DocumentsTable documents={documents} employeeId={id} />
    </div>
  );
}