import { formatDate } from "@/app/dashboard/employees/utils";

import type { EmployeeLeaveRequest } from "@/app/dashboard/employees/services/employee-leave.service";

import LeaveRequestDialog from "./leave-request-dialog";

interface LeaveRowProps {
  employeeId: string;
  request: EmployeeLeaveRequest;
}

function formatLeaveType(
  value: string | null | undefined,
): string {
  if (!value) {
    return "N/A";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatStatus(
  value: string | null | undefined,
): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getStatusClasses(
  status: string | null | undefined,
): string {
  switch (status?.toLowerCase()) {
    case "approved":
      return "border-green-200 bg-green-50 text-green-700";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "rejected":
    case "denied":
      return "border-red-200 bg-red-50 text-red-700";

    case "cancelled":
    case "canceled":
      return "border-slate-200 bg-slate-50 text-slate-600";

    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function calculateLeaveDays(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): number | null {
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(`${startDate.slice(0, 10)}T00:00:00`);
  const end = new Date(`${endDate.slice(0, 10)}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return null;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return (
    Math.floor(
      (end.getTime() - start.getTime()) /
        millisecondsPerDay,
    ) + 1
  );
}

export default function LeaveRow({
  employeeId,
  request,
}: LeaveRowProps) {
  const numberOfDays = calculateLeaveDays(
    request.start_date,
    request.end_date,
  );

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-4 py-4 font-medium">
        {formatLeaveType(request.leave_type)}
      </td>

      <td className="whitespace-nowrap px-4 py-4">
        {formatDate(request.start_date)}
      </td>

      <td className="whitespace-nowrap px-4 py-4">
        {formatDate(request.end_date)}
      </td>

      <td className="whitespace-nowrap px-4 py-4">
        {numberOfDays ?? "N/A"}
      </td>

      <td className="px-4 py-4">
        <span
          className={[
            "inline-flex rounded-full border px-2.5 py-1",
            "text-xs font-medium",
            getStatusClasses(request.status),
          ].join(" ")}
        >
          {formatStatus(request.status)}
        </span>
      </td>

      <td className="max-w-[320px] px-4 py-4 text-muted-foreground">
        <p
          className="truncate"
          title={request.reason ?? undefined}
        >
          {request.reason || "No reason provided"}
        </p>
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-right">
        <LeaveRequestDialog
          employeeId={employeeId}
          request={request}
        />
      </td>
    </tr>
  );
}