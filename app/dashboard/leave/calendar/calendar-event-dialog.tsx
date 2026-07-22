"use client";

import Link from "next/link";
import {
  Building2,
  CalendarDays,
  CircleUserRound,
  Clock3,
  ExternalLink,
  FileText,
  Hash,
  X,
} from "lucide-react";

import type {
  CompanyLeaveCalendarEvent,
} from "./company-calendar.service";

type CalendarEventDialogProps = {
  event: CompanyLeaveCalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatLeaveType(
  leaveType: string,
): string {
  return leaveType
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatStatus(
  status: string,
): string {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(
  value: string,
): string {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function getDateRangeLabel(
  startDate: string,
  endDate: string,
): string {
  if (startDate === endDate) {
    return formatDate(startDate);
  }

  return `${formatDate(
    startDate,
  )} – ${formatDate(endDate)}`;
}

function getLeaveTypeClasses(
  leaveType: string,
): string {
  const normalizedType =
    leaveType.toLowerCase();

  if (
    normalizedType === "vacation" ||
    normalizedType === "annual"
  ) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300";
  }

  if (normalizedType === "sick") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300";
  }

  if (normalizedType === "personal") {
    return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/50 dark:text-purple-300";
  }

  if (
    normalizedType === "maternity" ||
    normalizedType === "paternity" ||
    normalizedType === "parental"
  ) {
    return "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900/60 dark:bg-pink-950/50 dark:text-pink-300";
  }

  if (
    normalizedType === "bereavement"
  ) {
    return "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }

  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300";
}

function getStatusClasses(
  status: string,
): string {
  if (
    status === "approved" ||
    status === "hr_approved" ||
    status === "completed"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300";
  }

  if (
    status === "manager_approved"
  ) {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-300";
  }

  return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
}

export default function CalendarEventDialog({
  event,
  open,
  onOpenChange,
}: CalendarEventDialogProps) {
  if (!open || !event) {
    return null;
  }

  function closeDialog() {
    onOpenChange(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-event-dialog-title"
    >
      <button
        type="button"
        aria-label="Close leave details"
        onClick={closeDialog}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2
                id="calendar-event-dialog-title"
                className="truncate text-lg font-semibold"
              >
                Leave details
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Company leave calendar event
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close dialog"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-background">
                <CircleUserRound className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {event.employeeName}
                </p>

                <p className="truncate text-sm text-muted-foreground">
                  {event.departmentName ??
                    "No department assigned"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={[
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                  getLeaveTypeClasses(
                    event.leaveType,
                  ),
                ].join(" ")}
              >
                {formatLeaveType(
                  event.leaveType,
                )}
              </span>

              <span
                className={[
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                  getStatusClasses(
                    event.status,
                  ),
                ].join(" ")}
              >
                {formatStatus(
                  event.status,
                )}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              icon={
                <CalendarDays className="h-4 w-4" />
              }
              label="Leave dates"
              value={getDateRangeLabel(
                event.startDate,
                event.endDate,
              )}
            />

            <DetailItem
              icon={
                <Clock3 className="h-4 w-4" />
              }
              label="Total days"
              value={`${event.totalDays} day${
                event.totalDays === 1
                  ? ""
                  : "s"
              }`}
            />

            <DetailItem
              icon={
                <Building2 className="h-4 w-4" />
              }
              label="Department"
              value={
                event.departmentName ??
                "Not assigned"
              }
            />

            <DetailItem
              icon={
                <Hash className="h-4 w-4" />
              }
              label="Employee number"
              value={
                event.employeeNumber ??
                "Not assigned"
              }
            />
          </div>

          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />

              <h3 className="text-sm font-medium">
                Reason
              </h3>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {event.reason?.trim() ||
                "No reason was provided for this leave request."}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t bg-muted/20 p-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={closeDialog}
            className="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          >
            Close
          </button>

          <Link
            href={`/dashboard/employees/${event.employeeId}/leave`}
            onClick={closeDialog}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            View employee leave
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

type DetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function DetailItem({
  icon,
  label,
  value,
}: DetailItemProps) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}

        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="text-sm font-medium">
        {value}
      </p>
    </div>
  );
}