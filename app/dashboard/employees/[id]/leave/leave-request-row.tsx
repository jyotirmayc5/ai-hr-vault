"use client";

import { Fragment, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  History,
  Pencil,
} from "lucide-react";

import type { EmployeeLeaveRequest } from "@/app/dashboard/employees/services/employee-leave.service";

import ApprovalTimeline from "./approval-timeline";
import DeleteLeaveDialog from "./delete-leave-dialog";
import LeaveRequestDialog from "./leave-request-dialog";
import LeaveReviewDialog from "./leave-review-dialog";

export type LeaveUserRole =
  | "employee"
  | "manager"
  | "hr"
  | "admin";

interface LeaveRequestRowProps {
  employeeId: string;
  companyId: string;
  request: EmployeeLeaveRequest;
  currentUserRole: LeaveUserRole;
}

export default function LeaveRequestRow({
  employeeId,
  companyId,
  request,
  currentUserRole,
}: LeaveRequestRowProps) {
  const [timelineOpen, setTimelineOpen] =
    useState(false);

  const canEditRequest =
    request.status === "pending" &&
    (currentUserRole === "employee" ||
      currentUserRole === "manager" ||
      currentUserRole === "hr" ||
      currentUserRole === "admin");

  const canDeleteRequest =
    request.status === "pending" &&
    (currentUserRole === "employee" ||
      currentUserRole === "admin");

  const timelineId = `leave-timeline-${request.id}`;

  return (
    <Fragment>
      <tr className="border-b hover:bg-muted/30">
        <td className="px-4 py-4 align-top">
          <div className="font-medium text-foreground">
            {formatLeaveType(request.leave_type)}
          </div>

          {request.reason ? (
            <p
              className="mt-1 max-w-xs truncate text-xs text-muted-foreground"
              title={request.reason}
            >
              {request.reason}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              No reason provided
            </p>
          )}
        </td>

        <td className="whitespace-nowrap px-4 py-4 align-top text-sm">
          {formatDate(request.start_date)}
        </td>

        <td className="whitespace-nowrap px-4 py-4 align-top text-sm">
          {formatDate(request.end_date)}
        </td>

        <td className="whitespace-nowrap px-4 py-4 align-top text-sm">
          {formatTotalDays(request.total_days)}
        </td>

        <td className="px-4 py-4 align-top">
          <LeaveStatusBadge
            status={request.status}
          />

          <p className="mt-2 max-w-sm text-xs text-muted-foreground">
            {getStatusDescription(request)}
          </p>
        </td>

        <td className="px-4 py-4 align-top">
          <div className="flex min-w-max flex-wrap items-center gap-2">
            <LeaveReviewDialog
              employeeId={employeeId}
              request={request}
              currentUserRole={currentUserRole}
            />

            <button
              type="button"
              onClick={() =>
                setTimelineOpen(
                  (currentValue) => !currentValue,
                )
              }
              aria-expanded={timelineOpen}
              aria-controls={timelineId}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <History className="h-3.5 w-3.5" />

              {timelineOpen
                ? "Hide timeline"
                : "View timeline"}

              {timelineOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {canEditRequest ? (
              <LeaveRequestDialog
                employeeId={employeeId}
                companyId={
                  request.company_id ?? companyId
                }
                request={request}
                trigger={
                  <button
                    type="button"
                    className="inline-flex h-8 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                }
              />
            ) : null}

            {canDeleteRequest ? (
              <DeleteLeaveDialog
                employeeId={employeeId}
                request={request}
              />
            ) : null}
          </div>
        </td>
      </tr>

      {timelineOpen ? (
        <tr
          id={timelineId}
          className="border-b bg-muted/10"
        >
          <td
            colSpan={6}
            className="px-4 pb-5 pt-1"
          >
            <div className="ml-auto w-full max-w-3xl">
              <ApprovalTimeline
                request={request}
              />
            </div>
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}

function LeaveStatusBadge({
  status,
}: {
  status: EmployeeLeaveRequest["status"];
}) {
  const styles: Record<
    EmployeeLeaveRequest["status"],
    string
  > = {
    pending:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",

    manager_approved:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",

    approved:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",

    hr_approved:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",

    completed:
      "border-gray-200 bg-gray-100 text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",

    rejected:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",

    cancelled:
      "border-gray-200 bg-gray-50 text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
  };

  const labels: Record<
    EmployeeLeaveRequest["status"],
    string
  > = {
    pending: "Pending manager review",
    manager_approved: "Awaiting HR approval",
    approved: "Approved",
    hr_approved: "Approved",
    completed: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function getStatusDescription(
  request: EmployeeLeaveRequest,
): string {
  switch (request.status) {
    case "pending":
      return "This request is waiting for manager review.";

    case "manager_approved":
      return request.manager_approved_at
        ? `Manager approved ${formatDateTime(
            request.manager_approved_at,
          )}. HR review is required.`
        : "Manager approval is complete. HR review is required.";

    case "approved":
      return request.approved_at
        ? `Approved ${formatDateTime(
            request.approved_at,
          )}.`
        : "This request has been approved.";

    case "hr_approved":
      return request.hr_approved_at
        ? `HR approved ${formatDateTime(
            request.hr_approved_at,
          )}.`
        : "This request has received final approval.";

    case "completed":
      return request.completed_at
        ? `Completed ${formatDateTime(
            request.completed_at,
          )}.`
        : "The leave workflow is complete.";

    case "rejected":
      return request.rejection_reason
        ? `Rejected: ${request.rejection_reason}`
        : "This request was rejected.";

    case "cancelled":
      return "This request was cancelled.";

    default:
      return "";
  }
}

function formatLeaveType(
  value: string,
): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(value: string): string {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(
    new Date(year, month - 1, day),
  );
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatTotalDays(
  totalDays: number | null,
): string {
  if (totalDays === null) {
    return "—";
  }

  if (totalDays === 1) {
    return "1 day";
  }

  return `${totalDays} days`;
}