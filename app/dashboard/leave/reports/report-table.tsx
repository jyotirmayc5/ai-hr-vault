"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { EmployeeLeaveHistoryRow } from "./services/leave-report.service";

export type LeaveReportTableMode =
  | "employee-history"
  | "monthly";

type ReportTableProps = {
  rows: EmployeeLeaveHistoryRow[];
  mode?: LeaveReportTableMode;
  title?: string;
  description?: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  manager_approved: "Manager Approved",
  approved: "Approved",
  hr_approved: "HR Approved",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const STATUS_CLASSES: Record<string, string> = {
  pending:
    "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",

  manager_approved:
    "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",

  approved:
    "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",

  hr_approved:
    "border-indigo-200 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",

  completed:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",

  rejected:
    "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",

  cancelled:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatStatus(value: string): string {
  return (
    STATUS_LABELS[value] ??
    value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase(),
      )
  );
}

function getDefaultTitle(
  mode: LeaveReportTableMode,
): string {
  if (mode === "monthly") {
    return "Monthly Leave Report";
  }

  return "Employee Leave History";
}

function getDefaultDescription(
  mode: LeaveReportTableMode,
): string {
  if (mode === "monthly") {
    return "Leave requests that overlap the selected month.";
  }

  return "Review employee leave requests, approvals, dates, and status.";
}

export default function ReportTable({
  rows,
  mode = "employee-history",
  title,
  description,
}: ReportTableProps) {
  const showApprovalColumns =
    mode === "employee-history";

  const columnCount = showApprovalColumns
    ? 10
    : 8;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title ?? getDefaultTitle(mode)}
        </CardTitle>

        <CardDescription>
          {description ??
            getDefaultDescription(mode)}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                  Employee
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                  Department
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                  Leave Type
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                  Start Date
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                  End Date
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                  Days
                </th>

                <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                  Status
                </th>

                {showApprovalColumns && (
                  <>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                      Manager Approval
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left font-medium">
                      HR Approval
                    </th>
                  </>
                )}

                <th className="min-w-64 px-4 py-3 text-left font-medium">
                  Reason
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No leave records found for the
                    selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium">
                        {row.employeeName}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {row.employeeNumber ??
                          "No employee number"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {row.departmentName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {formatLeaveType(
                        row.leaveType,
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(row.startDate)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(row.endDate)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {row.totalDays}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          STATUS_CLASSES[
                            row.status
                          ] ?? ""
                        }
                      >
                        {formatStatus(row.status)}
                      </Badge>
                    </td>

                    {showApprovalColumns && (
                      <>
                        <td className="whitespace-nowrap px-4 py-3">
                          {formatDate(
                            row.managerApprovedAt,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          {formatDate(
                            row.hrApprovedAt,
                          )}
                        </td>
                      </>
                    )}

                    <td className="max-w-64 px-4 py-3">
                      <div
                        className="truncate"
                        title={row.reason ?? undefined}
                      >
                        {row.reason || "—"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}