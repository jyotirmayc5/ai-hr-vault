import type { EmployeeLeaveRequest } from "@/app/dashboard/employees/services/employee-leave.service";

import LeaveRow from "./leave-request-row";

interface LeaveTableProps {
  employeeId: string;
  requests: EmployeeLeaveRequest[];
}

export default function LeaveTable({
  employeeId,
  requests,
}: LeaveTableProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-background p-10 text-center">
        <h2 className="text-base font-semibold">
          No leave requests
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          This employee does not have any leave requests yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Leave type
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Start date
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                End date
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Days
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>

              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Reason
              </th>

              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {requests.map((request) => (
              <LeaveRow
                key={request.id}
                employeeId={employeeId}
                request={request}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}