"use client";

import {
  useActionState,
  useEffect,
  useId,
  useState,
} from "react";
import {
  CalendarPlus,
  Loader2,
  Pencil,
  X,
} from "lucide-react";

import {
  createLeaveRequest,
  updateLeaveRequest,
  type LeaveRequestActionState,
} from "./leave-actions";

import type { EmployeeLeaveRequest } from "@/app/dashboard/employees/services/employee-leave.service";

interface LeaveRequestDialogProps {
  employeeId: string;
  request?: EmployeeLeaveRequest | null;
  buttonLabel?: string;
}

const initialState: LeaveRequestActionState = {
  success: false,
  message: null,
  validationErrors: undefined,
};

function toInputDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function getFieldError(
  errors: string[] | undefined,
): string | null {
  return errors?.[0] ?? null;
}

export default function LeaveRequestDialog({
  employeeId,
  request = null,
  buttonLabel,
}: LeaveRequestDialogProps) {
  const [open, setOpen] = useState(false);

  const dialogTitleId = useId();
  const dialogDescriptionId = useId();

  const isEditing = request !== null;

  async function submitLeaveRequest(
    previousState: LeaveRequestActionState,
    formData: FormData,
  ): Promise<LeaveRequestActionState> {
    if (request) {
      return updateLeaveRequest(
        employeeId,
        request.id,
        previousState,
        formData,
      );
    }

    return createLeaveRequest(
      employeeId,
      previousState,
      formData,
    );
  }

  const [state, formAction, isPending] = useActionState<
    LeaveRequestActionState,
    FormData
  >(submitLeaveRequest, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [open, isPending]);

  function handleClose() {
    if (!isPending) {
      setOpen(false);
    }
  }

  const triggerLabel =
    buttonLabel ??
    (isEditing ? "Edit" : "New leave request");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={
          isEditing
            ? `Edit ${request?.leave_type ?? ""} leave request`
            : "Create a new leave request"
        }
        className={
          isEditing
            ? [
                "inline-flex h-9 items-center justify-center",
                "gap-2 rounded-md border bg-background px-3",
                "text-sm font-medium transition-colors",
                "hover:bg-muted focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2",
              ].join(" ")
            : [
                "inline-flex h-10 items-center justify-center",
                "gap-2 rounded-md bg-primary px-4",
                "text-sm font-medium text-primary-foreground",
                "transition-colors hover:bg-primary/90",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2",
              ].join(" ")
        }
      >
        {isEditing ? (
          <Pencil className="h-4 w-4" />
        ) : (
          <CalendarPlus className="h-4 w-4" />
        )}

        {triggerLabel}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
          aria-describedby={dialogDescriptionId}
        >
          <button
            type="button"
            aria-label="Close leave request dialog"
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b px-6 py-5">
              <div>
                <h2
                  id={dialogTitleId}
                  className="text-lg font-semibold"
                >
                  {isEditing
                    ? "Edit leave request"
                    : "Create leave request"}
                </h2>

                <p
                  id={dialogDescriptionId}
                  className="mt-1 text-sm text-muted-foreground"
                >
                  {isEditing
                    ? "Update the leave type, dates, reason, or request status."
                    : "Add a new leave request for this employee."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                aria-label="Close dialog"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction}>
              <input
                type="hidden"
                name="employee_id"
                value={employeeId}
              />

              {request ? (
                <input
                  type="hidden"
                  name="leave_request_id"
                  value={request.id}
                />
              ) : null}

              <div className="space-y-5 px-6 py-6">
                {state.message && !state.success ? (
                  <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {state.message}
                  </div>
                ) : null}

                {state.validationErrors?.general?.length ? (
                  <div
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {state.validationErrors.general[0]}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label
                    htmlFor={`leave_type-${request?.id ?? "new"}`}
                    className="text-sm font-medium"
                  >
                    Leave type
                  </label>

                  <select
                    id={`leave_type-${request?.id ?? "new"}`}
                    name="leave_type"
                    defaultValue={request?.leave_type ?? ""}
                    disabled={isPending}
                    required
                    aria-invalid={
                      Boolean(
                        state.validationErrors?.leave_type
                          ?.length,
                      )
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select leave type
                    </option>
                    <option value="vacation">
                      Vacation
                    </option>
                    <option value="sick">
                      Sick leave
                    </option>
                    <option value="personal">
                      Personal leave
                    </option>
                    <option value="bereavement">
                      Bereavement
                    </option>
                    <option value="parental">
                      Parental leave
                    </option>
                    <option value="medical">
                      Medical leave
                    </option>
                    <option value="jury_duty">
                      Jury duty
                    </option>
                    <option value="unpaid">
                      Unpaid leave
                    </option>
                    <option value="other">
                      Other
                    </option>
                  </select>

                  {getFieldError(
                    state.validationErrors?.leave_type,
                  ) ? (
                    <p className="text-sm text-red-600">
                      {getFieldError(
                        state.validationErrors?.leave_type,
                      )}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor={`start_date-${request?.id ?? "new"}`}
                      className="text-sm font-medium"
                    >
                      Start date
                    </label>

                    <input
                      id={`start_date-${request?.id ?? "new"}`}
                      name="start_date"
                      type="date"
                      defaultValue={toInputDate(
                        request?.start_date,
                      )}
                      disabled={isPending}
                      required
                      aria-invalid={
                        Boolean(
                          state.validationErrors?.start_date
                            ?.length,
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {getFieldError(
                      state.validationErrors?.start_date,
                    ) ? (
                      <p className="text-sm text-red-600">
                        {getFieldError(
                          state.validationErrors?.start_date,
                        )}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`end_date-${request?.id ?? "new"}`}
                      className="text-sm font-medium"
                    >
                      End date
                    </label>

                    <input
                      id={`end_date-${request?.id ?? "new"}`}
                      name="end_date"
                      type="date"
                      defaultValue={toInputDate(
                        request?.end_date,
                      )}
                      disabled={isPending}
                      required
                      aria-invalid={
                        Boolean(
                          state.validationErrors?.end_date
                            ?.length,
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {getFieldError(
                      state.validationErrors?.end_date,
                    ) ? (
                      <p className="text-sm text-red-600">
                        {getFieldError(
                          state.validationErrors?.end_date,
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor={`reason-${request?.id ?? "new"}`}
                    className="text-sm font-medium"
                  >
                    Reason
                  </label>

                  <textarea
                    id={`reason-${request?.id ?? "new"}`}
                    name="reason"
                    rows={4}
                    maxLength={1000}
                    defaultValue={request?.reason ?? ""}
                    disabled={isPending}
                    placeholder="Optional reason or additional details"
                    className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {getFieldError(
                    state.validationErrors?.reason,
                  ) ? (
                    <p className="text-sm text-red-600">
                      {getFieldError(
                        state.validationErrors?.reason,
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Maximum 1,000 characters.
                    </p>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <label
                      htmlFor={`status-${request.id}`}
                      className="text-sm font-medium"
                    >
                      Status
                    </label>

                    <select
                      id={`status-${request.id}`}
                      name="status"
                      defaultValue={
                        request.status ?? "pending"
                      }
                      disabled={isPending}
                      aria-invalid={
                        Boolean(
                          state.validationErrors?.status
                            ?.length,
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="pending">
                        Pending
                      </option>
                      <option value="approved">
                        Approved
                      </option>
                      <option value="rejected">
                        Rejected
                      </option>
                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>

                    {getFieldError(
                      state.validationErrors?.status,
                    ) ? (
                      <p className="text-sm text-red-600">
                        {getFieldError(
                          state.validationErrors?.status,
                        )}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {isEditing ? (
                  <div className="space-y-2">
                    <label
                      htmlFor={`rejection_reason-${request.id}`}
                      className="text-sm font-medium"
                    >
                      Rejection reason
                    </label>

                    <textarea
                      id={`rejection_reason-${request.id}`}
                      name="rejection_reason"
                      rows={3}
                      defaultValue={
                        request.rejection_reason ?? ""
                      }
                      disabled={isPending}
                      placeholder="Required when rejecting a request"
                      className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {getFieldError(
                      state.validationErrors
                        ?.rejection_reason,
                    ) ? (
                      <p className="text-sm text-red-600">
                        {getFieldError(
                          state.validationErrors
                            ?.rejection_reason,
                        )}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Complete this field when setting the
                        status to rejected.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : isEditing ? (
                    "Save changes"
                  ) : (
                    "Create request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}