import { notFound } from "next/navigation";

import { getEmployeeProfile } from "@/app/dashboard/employees/services/employee-profile.service";

import {
  getEmployeeLeaveData,
  type EmployeeLeaveRequest,
} from "@/app/dashboard/employees/services/employee-leave.service";

import LeaveRequestDialog from "./leave-request-dialog";
import LeaveTable from "./leave-request-table";

interface EmployeeLeavePageProps {
  params: Promise<{
    id: string;
  }>;
}

function getLeaveRequests(
  leaveData: unknown,
): EmployeeLeaveRequest[] {
  if (!leaveData || typeof leaveData !== "object") {
    return [];
  }

  const data = leaveData as {
    requests?: EmployeeLeaveRequest[];
    leaveRequests?: EmployeeLeaveRequest[];
    leave_requests?: EmployeeLeaveRequest[];
  };

  if (Array.isArray(data.requests)) {
    return data.requests;
  }

  if (Array.isArray(data.leaveRequests)) {
    return data.leaveRequests;
  }

  if (Array.isArray(data.leave_requests)) {
    return data.leave_requests;
  }

  return [];
}

export default async function EmployeeLeavePage({
  params,
}: EmployeeLeavePageProps) {
  const { id: employeeId } = await params;

  if (!employeeId || employeeId === "undefined") {
    notFound();
  }

  const [employeeProfileResult, leaveDataResult] =
    await Promise.allSettled([
      getEmployeeProfile(employeeId),
      getEmployeeLeaveData(employeeId),
    ]);

  const employeeProfile =
    employeeProfileResult.status === "fulfilled"
      ? employeeProfileResult.value
      : null;

  const leaveData =
    leaveDataResult.status === "fulfilled"
      ? leaveDataResult.value
      : null;

  if (employeeProfileResult.status === "rejected") {
    console.error(
      "Failed to load employee profile on leave page:",
      employeeProfileResult.reason,
    );
  }

  if (leaveDataResult.status === "rejected") {
    console.error(
      "Failed to load employee leave data:",
      leaveDataResult.reason,
    );
  }

  const employee = employeeProfile?.employee ?? null;

  const employeeName = employee
    ? [employee.first_name, employee.last_name]
        .filter(Boolean)
        .join(" ")
    : "Employee Leave";

  const requests = getLeaveRequests(leaveData);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Employee leave
          </p>

          <h1 className="text-2xl font-semibold tracking-tight">
            {employeeName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View, create, and update leave requests for this
            employee.
          </p>
        </div>

        <LeaveRequestDialog employeeId={employeeId} />
      </div>

      {!employeeProfile ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          The employee profile could not be loaded, but leave
          requests are still available below. Check the server
          terminal for the profile query error.
        </div>
      ) : null}

      <LeaveTable
        employeeId={employeeId}
        requests={requests}
      />
    </div>
  );
}