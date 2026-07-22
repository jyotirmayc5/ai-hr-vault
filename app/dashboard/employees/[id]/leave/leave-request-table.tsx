import type { EmployeeLeaveRequest } from "@/app/dashboard/employees/services/employee-leave.service";

import LeaveRequestRow, {
  type LeaveUserRole,
} from "./leave-request-row";

interface LeaveRequestTableProps {
  employeeId: string;
  companyId: string;
  requests: EmployeeLeaveRequest[];
  currentUserRole: LeaveUserRole;
}

export default function LeaveRequestTable({
  employeeId,
  companyId,
  requests,
  currentUserRole,
}: LeaveRequestTableProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h3 className="text-base font-semibold">
          No leave requests
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          This employee does not have any leave requests yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Leave Type
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Start Date
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                End Date
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Days
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Status
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => (
              <LeaveRequestRow
                key={request.id}
                employeeId={employeeId}
                companyId={companyId}
                request={request}
                currentUserRole={currentUserRole}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}