import { notFound } from "next/navigation";
import { getEmployeeProfile } from "@/app/dashboard/employees/services/employee-profile.service";
import InfoItem from "../components/info-item";
import { getManagerName } from "../utils";

export default async function EmployeeTrainingPage({
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Employee Profile</p>
        <h1 className="text-2xl font-semibold">Training</h1>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Training Summary</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem label="Employee Number" value={data.employee_number} />
          <InfoItem label="Job Title" value={data.job_title} />
          <InfoItem label="Department" value={data.department?.name} />
          <InfoItem label="Manager" value={getManagerName(data.manager)} />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Training Details</h2>
        <p className="text-sm text-muted-foreground">
          Training records, certifications, required courses, completion dates,
          and renewal reminders are not connected yet.
        </p>
      </div>
    </div>
  );
}