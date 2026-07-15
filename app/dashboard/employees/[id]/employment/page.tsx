import { notFound } from "next/navigation";
import { getEmployeeProfile } from "@/app/dashboard/employees/services/employee-profile.service";
import InfoItem from "../components/info-item";
import { getManagerName } from "../utils";

export default async function EmployeeEmploymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id === "undefined") notFound();

  const employee = await getEmployeeProfile(id);

  if (!employee) notFound();

  const data = employee.employee;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Employee Profile</p>
        <h1 className="text-2xl font-semibold">Employment</h1>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Role Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem label="Job Title" value={data.job_title} />
          <InfoItem label="Department" value={data.department?.name} />
          <InfoItem label="Manager" value={getManagerName(data.manager)} />
          <InfoItem label="Location" value={data.location?.name} />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Employment Status</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem label="Employee Number" value={data.employee_number} />
          <InfoItem label="Status" value={data.employment_status} />
          <InfoItem label="Start Date" value={data.start_date} />
          <InfoItem label="Termination Date" value={data.termination_date} />
        </div>
      </div>
    </div>
  );
}