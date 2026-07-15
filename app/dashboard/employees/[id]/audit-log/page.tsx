import { notFound } from "next/navigation";
import { getEmployeeProfile } from "@/app/dashboard/employees/services/employee-profile.service";
import InfoItem from "../components/info-item";

export default async function EmployeeAuditLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id === "undefined") {
    notFound();
  }

  const employee = await getEmployeeProfile(id);

  if (!employee) {
    notFound();
  }

  const data = employee.employee;

  const employeeName = [data.first_name, data.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Employee Profile</p>
        <h1 className="text-2xl font-semibold">Audit Log</h1>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Employee Summary</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem label="Employee Number" value={data.employee_number} />
          <InfoItem label="Employee Name" value={employeeName} />
          <InfoItem label="Department" value={data.department?.name} />
          <InfoItem label="Employment Status" value={data.employment_status} />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Profile Activity</h2>
        <p className="text-sm text-muted-foreground">
          Employee profile changes, document uploads, compensation updates,
          access events, and admin actions are not connected yet.
        </p>
      </div>
    </div>
  );
}