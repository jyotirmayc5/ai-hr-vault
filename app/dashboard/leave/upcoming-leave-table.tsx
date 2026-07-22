import Link from "next/link";

import { CalendarDays } from "lucide-react";

import type {
  LeaveDashboardStatus,
  UpcomingLeaveItem,
} from "./services/leave-dashboard.service";

interface UpcomingLeaveTableProps {
  leave: UpcomingLeaveItem[];
}

const STATUS_LABELS: Record<LeaveDashboardStatus, string> = {
  pending: "Pending",
  manager_approved: "Manager Approved",
  approved: "Approved",
  hr_approved: "HR Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_STYLES: Record<LeaveDashboardStatus, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",

  manager_approved:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",

  approved:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",

  hr_approved:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",

  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",

  cancelled:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",

  completed:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
};

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLeaveType(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDays(value: number): string {
  const formattedValue = Number.isInteger(value)
    ? value.toString()
    : value.toFixed(1);

  return `${formattedValue} ${value === 1 ? "day" : "days"}`;
}

function StatusBadge({
  status,
}: {
  status: LeaveDashboardStatus;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
        STATUS_STYLES[status]
      }`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function UpcomingLeaveTable({
  leave,
}: UpcomingLeaveTableProps) {
  return (
    <section
      aria-labelledby="upcoming-leave-heading"
      className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <div className="border-b px-5 py-4">
        <h2
          id="upcoming-leave-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Upcoming Leave
        </h2>

        <p className="text-sm text-muted-foreground">
          Approved employee leave beginning today or later.
        </p>
      </div>

      {leave.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center px-6 py-12">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-4 text-sm font-medium">
              No upcoming leave
            </p>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Approved future leave requests will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b text-left">
                <th className="px-5 py-3 font-medium text-muted-foreground">
                  Employee
                </th>

                <th className="px-5 py-3 font-medium text-muted-foreground">
                  Department
                </th>

                <th className="px-5 py-3 font-medium text-muted-foreground">
                  Leave Type
                </th>

                <th className="px-5 py-3 font-medium text-muted-foreground">
                  Start
                </th>

                <th className="px-5 py-3 font-medium text-muted-foreground">
                  End
                </th>

                <th className="px-5 py-3 font-medium text-muted-foreground">
                  Duration
                </th>

                <th className="px-5 py-3 font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {leave.map((item) => (
                <tr
                  key={item.id}
                  className="border-b transition-colors last:border-b-0 hover:bg-muted/40"
                >
                  <td className="px-5 py-4 align-middle">
                    <div className="flex flex-col">
                      <Link
                        href={`/dashboard/employees/${item.employeeId}/leave`}
                        className="font-medium hover:underline"
                      >
                        {item.employeeName}
                      </Link>

                      {item.employeeNumber ? (
                        <span className="text-xs text-muted-foreground">
                          {item.employeeNumber}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-5 py-4 align-middle text-muted-foreground">
                    {item.departmentName}
                  </td>

                  <td className="px-5 py-4 align-middle">
                    {formatLeaveType(item.leaveType)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 align-middle text-muted-foreground">
                    {formatDate(item.startDate)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 align-middle text-muted-foreground">
                    {formatDate(item.endDate)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 align-middle">
                    {formatDays(item.totalDays)}
                  </td>

                  <td className="px-5 py-4 align-middle">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}