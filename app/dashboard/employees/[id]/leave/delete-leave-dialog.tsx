"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";

import type { EmployeeLeaveRequest } from "@/app/dashboard/employees/services/employee-leave.service";

import { deleteLeaveRequest } from "./leave-actions";

interface DeleteLeaveDialogProps {
  employeeId: string;
  request: EmployeeLeaveRequest;
}

export default function DeleteLeaveDialog({
  employeeId,
  request,
}: DeleteLeaveDialogProps) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen(): void {
    setErrorMessage(null);
    setOpen(true);
  }

  function handleClose(): void {
    if (isPending) {
      return;
    }

    setErrorMessage(null);
    setOpen(false);
  }

  function handleDelete(): void {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await deleteLeaveRequest(request.id, employeeId);

      if (!result.success) {
        setErrorMessage(
          result.validationErrors?.general?.[0] ??
            result.message ??
            "Unable to delete the leave request.",
        );

        return;
      }

      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-red-200 px-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="presentation"
          onMouseDown={handleClose}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-leave-title-${request.id}`}
            aria-describedby={`delete-leave-description-${request.id}`}
            className="w-full max-w-md rounded-lg border bg-white p-6 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                aria-label="Close delete confirmation"
                className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <h2
                id={`delete-leave-title-${request.id}`}
                className="text-lg font-semibold text-gray-900"
              >
                Delete leave request?
              </h2>

              <p
                id={`delete-leave-description-${request.id}`}
                className="mt-2 text-sm leading-6 text-gray-600"
              >
                This will permanently delete the{" "}
                <span className="font-medium text-gray-900">
                  {request.leave_type}
                </span>{" "}
                leave request from{" "}
                <span className="font-medium text-gray-900">
                  {formatDate(request.start_date)}
                </span>{" "}
                through{" "}
                <span className="font-medium text-gray-900">
                  {formatDate(request.end_date)}
                </span>
                . This action cannot be undone.
              </p>
            </div>

            <div className="mt-4 rounded-md border bg-gray-50 p-3">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                <dt className="text-gray-500">Leave type</dt>
                <dd className="text-right font-medium text-gray-900">
                  {request.leave_type}
                </dd>

                <dt className="text-gray-500">Dates</dt>
                <dd className="text-right font-medium text-gray-900">
                  {formatDate(request.start_date)} –{" "}
                  {formatDate(request.end_date)}
                </dd>

                <dt className="text-gray-500">Status</dt>
                <dd className="text-right font-medium capitalize text-gray-900">
                  {request.status}
                </dd>

                <dt className="text-gray-500">Total days</dt>
                <dd className="text-right font-medium text-gray-900">
                  {request.total_days}
                </dd>
              </dl>
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex h-9 min-w-32 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />

                {isPending ? "Deleting..." : "Delete request"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}