import { notFound } from "next/navigation";
import { getEmployeeProfile } from "@/app/dashboard/employees/services/employee-profile.service";
import InfoItem from "../components/info-item";

export default async function EmployeePersonalPage({
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
        <h1 className="text-2xl font-semibold">Personal Information</h1>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Basic Details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem label="First Name" value={data.first_name} />
          <InfoItem label="Last Name" value={data.last_name} />
          <InfoItem label="Email" value={data.email} />
          <InfoItem label="Phone" value={data.phone} />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Employee Details</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem label="Employee Number" value={data.employee_number} />
          <InfoItem label="Job Title" value={data.job_title} />
          <InfoItem label="Employment Status" value={data.employment_status} />
          <InfoItem label="Start Date" value={data.start_date} />
        </div>
      </div>
    </div>
  );
}