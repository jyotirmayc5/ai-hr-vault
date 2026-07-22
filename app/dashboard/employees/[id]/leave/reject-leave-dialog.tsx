"use client";

import { useActionState, useEffect, useState } from "react";
import { Ban, X } from "lucide-react";

import type { EmployeeLeaveRequest } from "@/app/dashboard/employees/services/employee-leave.service";

import {
  rejectLeaveRequest,
  type LeaveActionState,
} from "./leave-actions";

interface RejectLeaveDialogProps {
  employeeId: string;
  request: EmployeeLeaveRequest;
}

const initialState: LeaveActionState = {
  success: false,
  message: "",
};

export default function RejectLeaveDialog({
  employeeId,
  request,
}: RejectLeaveDialogProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(
    rejectLeaveRequest,
    initialState,
  );

  function handleOpen(): void {
    setOpen(true);
  }

  function handleClose(): void {
    if (isPending) {
      return;
    }

    setOpen(false);
  }

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={request.status !== "pending"}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-amber-200 px-3 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Ban className="h-3.5 w-3.5" />
        Reject
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="presentation"
          onMouseDown={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`reject-leave-title-${request.id}`}
            aria-describedby={`reject-leave-description-${request.id}`}
            className="w-full max-w-md rounded-lg border bg-white p-6 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <Ban className="h-5 w-5 text-amber-700" />
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                aria-label="Close reject dialog"
                className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <h2
                id={`reject-leave-title-${request.id}`}
                className="text-lg font-semibold text-gray-900"
              >
                Reject leave request
              </h2>

              <p
                id={`reject-leave-description-${request.id}`}
                className="mt-2 text-sm leading-6 text-gray-600"
              >
                Reject the{" "}
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
                .
              </p>
            </div>

            <form action={formAction} className="mt-5 space-y-4">
              <input
                type="hidden"
                name="leave_request_id"
                value={request.id}
              />

              <input
                type="hidden"
                name="employee_id"
                value={employeeId}
              />

              <div className="space-y-2">
                <label
                  htmlFor={`rejection-reason-${request.id}`}
                  className="text-sm font-medium text-gray-900"
                >
                  Rejection reason
                </label>

                <textarea
                  id={`rejection-reason-${request.id}`}
                  name="rejection_reason"
                  rows={4}
                  maxLength={1000}
                  required
                  disabled={isPending}
                  placeholder="Explain why this leave request is being rejected."
                  className="min-h-28 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {state.validationErrors?.rejection_reason?.map(
                  (error) => (
                    <p
                      key={error}
                      className="text-sm text-red-600"
                    >
                      {error}
                    </p>
                  ),
                )}

                <p className="text-xs text-gray-500">
                  This reason will be stored with the rejected request.
                </p>
              </div>

              {!state.success && state.message ? (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {state.validationErrors?.general?.[0] ??
                    state.message}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-9 min-w-32 items-center justify-center gap-2 rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Ban className="h-4 w-4" />

                  {isPending ? "Rejecting..." : "Reject request"}
                </button>
              </div>
            </form>
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