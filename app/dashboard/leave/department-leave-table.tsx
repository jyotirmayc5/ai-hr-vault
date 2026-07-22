import { Building2 } from "lucide-react";

import type { DepartmentLeaveItem } from "./services/leave-dashboard.service";

interface DepartmentLeaveTableProps {
  departments: DepartmentLeaveItem[];
}

function formatDays(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export default function DepartmentLeaveTable({
  departments,
}: DepartmentLeaveTableProps) {
  const totalEmployees = departments.reduce(
    (total, department) => total + department.employeeCount,
    0,
  );

  const totalRequests = departments.reduce(
    (total, department) => total + department.requestCount,
    0,
  );

  const totalDays = departments.reduce(
    (total, department) => total + department.totalDays,
    0,
  );

  return (
    <section
      aria-labelledby="department-leave-heading"
      className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <div className="flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="department-leave-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Leave by Department
          </h2>

          <p className="text-sm text-muted-foreground">
            Approved leave activity grouped by employee department.
          </p>
        </div>

        {departments.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">
              {departments.length.toLocaleString()}{" "}
              {departments.length === 1 ? "department" : "departments"}
            </span>

            <span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">
              {totalRequests.toLocaleString()}{" "}
              {totalRequests === 1 ? "request" : "requests"}
            </span>

            <span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">
              {formatDays(totalDays)} days
            </span>
          </div>
        ) : null}
      </div>

      {departments.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center px-6 py-12">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">
              No department leave data
            </p>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Approved leave requests will be grouped by department here.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">
                  Department
                </th>

                <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                  Employees
                </th>

                <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                  Requests
                </th>

                <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                  Days Used
                </th>

                <th className="px-5 py-3 text-right font-medium text-muted-foreground">
                  Avg. Days
                </th>
              </tr>
            </thead>

            <tbody>
              {departments.map((department) => {
                const averageDays =
                  department.requestCount > 0
                    ? department.totalDays / department.requestCount
                    : 0;

                return (
                  <tr
                    key={department.departmentId ?? department.departmentName}
                    className="border-b transition-colors last:border-b-0 hover:bg-muted/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div>
                          <p className="font-medium">
                            {department.departmentName}
                          </p>

                          {!department.departmentId ? (
                            <p className="text-xs text-muted-foreground">
                              Employees without an assigned department
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right tabular-nums">
                      {department.employeeCount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right tabular-nums">
                      {department.requestCount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right font-medium tabular-nums">
                      {formatDays(department.totalDays)}
                    </td>

                    <td className="px-5 py-4 text-right text-muted-foreground tabular-nums">
                      {formatDays(averageDays)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot className="border-t bg-muted/30">
              <tr>
                <td className="px-5 py-4 font-semibold">
                  Total
                </td>

                <td className="px-5 py-4 text-right font-semibold tabular-nums">
                  {totalEmployees.toLocaleString()}
                </td>

                <td className="px-5 py-4 text-right font-semibold tabular-nums">
                  {totalRequests.toLocaleString()}
                </td>

                <td className="px-5 py-4 text-right font-semibold tabular-nums">
                  {formatDays(totalDays)}
                </td>

                <td className="px-5 py-4 text-right font-semibold tabular-nums">
                  {formatDays(
                    totalRequests > 0 ? totalDays / totalRequests : 0,
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}