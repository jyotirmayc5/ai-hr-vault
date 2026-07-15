import OverviewCard from "./OverviewCard";
import InfoItem from "./info-item";

import type { EmployeeOverviewData } from "@/app/dashboard/employees/services/employee-overview.service";

interface EmployeeOverviewGridProps {
  overview: EmployeeOverviewData;
}

export default function EmployeeOverviewGrid({
  overview,
}: EmployeeOverviewGridProps) {
  const { employee } = overview;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <OverviewCard
        title="Employment"
        description="Current employment information"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <InfoItem
            label="Employee Number"
            value={employee.employee_number ?? "-"}
          />

          <InfoItem
            label="Status"
            value={employee.employment_status ?? "-"}
          />

          <InfoItem
            label="Employment Type"
            value={employee.employment_type ?? "-"}
          />

          <InfoItem
            label="Job Title"
            value={employee.job_title ?? "-"}
          />

          <InfoItem
            label="Department"
            value={employee.department?.name ?? "-"}
          />

          <InfoItem
            label="Location"
            value={employee.location?.name ?? "-"}
          />

          <InfoItem
            label="Manager"
            value={
              employee.manager
                ? `${employee.manager.first_name} ${employee.manager.last_name}`
                : "-"
            }
          />

          <InfoItem
            label="Start Date"
            value={employee.start_date ?? "-"}
          />
        </div>
      </OverviewCard>

      <OverviewCard
        title="Contact"
        description="Employee contact information"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <InfoItem
            label="Work Email"
            value={employee.email ?? "-"}
          />

          <InfoItem
            label="Phone"
            value={employee.phone ?? "-"}
          />

          <InfoItem
            label="Termination Date"
            value={employee.termination_date ?? "-"}
          />
        </div>
      </OverviewCard>
    </div>
  );
}