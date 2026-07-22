"use client";

import {
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  Ban,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Loader2,
  X,
} from "lucide-react";

import type {
  EmployeeLeaveRequest,
  LeaveRequestStatus,
} from "@/app/dashboard/employees/services/employee-leave.service";

import {
  approveByHR,
  approveByManager,
  completeLeave,
} from "./leave-approval-actions";
import {
  rejectLeaveRequest,
  type LeaveActionState,
} from "./leave-actions";

export type LeaveUserRole =
  | "employee"
  | "manager"
  | "hr"
  | "admin";

interface LeaveReviewDialogProps {
  employeeId: string;
  request: EmployeeLeaveRequest;
  currentUserRole: LeaveUserRole;
}

interface TimelineStep {
  key: string;
  title: string;
  description: string;
  complete: boolean;
  current: boolean;
  stopped?: boolean;
}

const initialRejectState: LeaveActionState = {
  success: false,
  message: "",
};

export default function LeaveReviewDialog({
  employeeId,
  request,
  currentUserRole,
}: LeaveReviewDialogProps) {
  const [open, setOpen] = useState(false);

  const [
    showRejectionForm,
    setShowRejectionForm,
  ] = useState(false);

  const [actionError, setActionError] =
    useState("");

  const [actionMessage, setActionMessage] =
    useState("");

  const [
    isActionPending,
    startTransition,
  ] = useTransition();

  const [
    rejectState,
    rejectFormAction,
    isRejectPending,
  ] = useActionState(
    rejectLeaveRequest,
    initialRejectState,
  );

  const isPending =
    isActionPending || isRejectPending;

  /*
   * Employee:
   * - Can review the request and timeline.
   * - Cannot approve, reject, or complete.
   *
   * Manager:
   * - Can approve or reject pending requests.
   *
   * HR:
   * - Can approve or reject manager-approved requests.
   * - Can complete approved requests.
   *
   * Admin:
   * - Can perform every workflow action.
   */

  const canManagerApprove =
    request.status === "pending" &&
    (currentUserRole === "manager" ||
      currentUserRole === "admin");

  const canHRApprove =
    request.status ===
      "manager_approved" &&
    (currentUserRole === "hr" ||
      currentUserRole === "admin");

  const canComplete =
    (request.status === "approved" ||
      request.status === "hr_approved") &&
    (currentUserRole === "hr" ||
      currentUserRole === "admin");

  const canRejectAtManagerStage =
    request.status === "pending" &&
    (currentUserRole === "manager" ||
      currentUserRole === "admin");

  const canRejectAtHRStage =
    request.status ===
      "manager_approved" &&
    (currentUserRole === "hr" ||
      currentUserRole === "admin");

  const canReject =
    canRejectAtManagerStage ||
    canRejectAtHRStage;

  const hasAvailableAction =
    canManagerApprove ||
    canHRApprove ||
    canComplete ||
    canReject;

  const timeline =
    getTimelineSteps(request);

  function handleOpen(): void {
    setActionError("");
    setActionMessage("");
    setShowRejectionForm(false);
    setOpen(true);
  }

  function handleClose(): void {
    if (isPending) {
      return;
    }

    setOpen(false);
    setShowRejectionForm(false);
    setActionError("");
    setActionMessage("");
  }

  function runApprovalAction(
    action: (
      leaveRequestId: string,
      employeeId: string,
    ) => Promise<unknown>,
    pendingMessage: string,
  ): void {
    setActionError("");
    setActionMessage(pendingMessage);

    startTransition(async () => {
      try {
        await action(
          request.id,
          employeeId,
        );

        setOpen(false);
      } catch (error) {
        setActionMessage("");

        setActionError(
          error instanceof Error
            ? error.message
            : "The leave request could not be updated.",
        );
      }
    });
  }

  useEffect(() => {
    if (rejectState.success) {
      setOpen(false);
      setShowRejectionForm(false);
    }
  }, [rejectState.success]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        Review request

        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          role="presentation"
          onMouseDown={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`leave-review-title-${request.id}`}
            aria-describedby={`leave-review-description-${request.id}`}
            className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl border bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between gap-4 border-b px-6 py-5 dark:border-slate-700">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  Leave request
                </p>

                <h2
                  id={`leave-review-title-${request.id}`}
                  className="mt-1 text-xl font-semibold text-gray-900 dark:text-white"
                >
                  Review request
                </h2>

                <p
                  id={`leave-review-description-${request.id}`}
                  className="mt-1 text-sm text-gray-600 dark:text-slate-400"
                >
                  Review the request details,
                  approval progress, and available
                  actions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                aria-label="Close review dialog"
                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              <RequestSummary
                request={request}
              />

              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Approval timeline
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                      {getStatusText(
                        request.status,
                      )}
                    </p>
                  </div>

                  <StatusBadge
                    status={request.status}
                  />
                </div>

                <div className="rounded-lg border p-4 dark:border-slate-700">
                  <div className="space-y-0">
                    {timeline.map(
                      (step, index) => (
                        <TimelineItem
                          key={step.key}
                          step={step}
                          isLast={
                            index ===
                            timeline.length - 1
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              </section>

              {request.status ===
                "rejected" ? (
                <section className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
                    Request rejected
                  </h3>

                  {request.rejected_at ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {formatDateTime(
                        request.rejected_at,
                      )}
                    </p>
                  ) : null}

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-700 dark:text-red-300">
                    {request.rejection_reason
                      ?.trim() ||
                      "No rejection reason was provided."}
                  </p>
                </section>
              ) : null}

              {request.status ===
                "cancelled" ? (
                <section className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-200">
                    Request cancelled
                  </h3>

                  <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                    This request is closed and no
                    further workflow actions are
                    available.
                  </p>
                </section>
              ) : null}

              {showRejectionForm ? (
                <form
                  action={rejectFormAction}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Reject leave request
                      </h3>

                      <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
                        Enter a reason before
                        rejecting this request.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowRejectionForm(
                          false,
                        )
                      }
                      disabled={isRejectPending}
                      aria-label="Close rejection form"
                      className="rounded-md p-1 text-gray-500 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-amber-900/40"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

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

                  <div className="mt-4 space-y-2">
                    <label
                      htmlFor={`review-rejection-reason-${request.id}`}
                      className="text-sm font-medium text-gray-900 dark:text-slate-200"
                    >
                      Rejection reason
                    </label>

                    <textarea
                      id={`review-rejection-reason-${request.id}`}
                      name="rejection_reason"
                      rows={4}
                      maxLength={1000}
                      required
                      disabled={isRejectPending}
                      placeholder="Explain why this leave request is being rejected."
                      className="min-h-28 w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-800"
                    />

                    {rejectState
                      .validationErrors
                      ?.rejection_reason?.map(
                        (error) => (
                          <p
                            key={error}
                            className="text-sm text-red-600 dark:text-red-400"
                          >
                            {error}
                          </p>
                        ),
                      )}

                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      The rejection reason will be
                      stored with the request.
                    </p>
                  </div>

                  {!rejectState.success &&
                  rejectState.message ? (
                    <div
                      role="alert"
                      className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                    >
                      {rejectState
                        .validationErrors
                        ?.general?.[0] ??
                        rejectState.message}
                    </div>
                  ) : null}

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setShowRejectionForm(
                          false,
                        )
                      }
                      disabled={isRejectPending}
                      className="inline-flex h-9 items-center justify-center rounded-md border bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isRejectPending}
                      className="inline-flex h-9 min-w-32 items-center justify-center gap-2 rounded-md bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRejectPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}

                      {isRejectPending
                        ? "Rejecting..."
                        : "Reject request"}
                    </button>
                  </div>
                </form>
              ) : null}

              {actionError ? (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  {actionError}
                </div>
              ) : null}

              {isActionPending &&
              actionMessage ? (
                <div className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Loader2 className="h-4 w-4 animate-spin" />

                  {actionMessage}
                </div>
              ) : null}
            </div>

            {!showRejectionForm ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-gray-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-950/40">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="inline-flex h-9 items-center justify-center rounded-md border bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Close
                </button>

                <div className="flex flex-wrap justify-end gap-2">
                  {canReject ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActionError("");
                        setActionMessage("");

                        setShowRejectionForm(
                          true,
                        );
                      }}
                      disabled={isPending}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-amber-300 bg-white px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-amber-950/30"
                    >
                      <Ban className="h-4 w-4" />
                      Reject
                    </button>
                  ) : null}

                  {canManagerApprove ? (
                    <button
                      type="button"
                      onClick={() =>
                        runApprovalAction(
                          approveByManager,
                          "Recording manager approval...",
                        )
                      }
                      disabled={isPending}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isActionPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}

                      Manager approve
                    </button>
                  ) : null}

                  {canHRApprove ? (
                    <button
                      type="button"
                      onClick={() =>
                        runApprovalAction(
                          approveByHR,
                          "Recording HR approval...",
                        )
                      }
                      disabled={isPending}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isActionPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}

                      HR approve
                    </button>
                  ) : null}

                  {canComplete ? (
                    <button
                      type="button"
                      onClick={() =>
                        runApprovalAction(
                          completeLeave,
                          "Completing leave request...",
                        )
                      }
                      disabled={isPending}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      {isActionPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}

                      Mark completed
                    </button>
                  ) : null}

                  {!hasAvailableAction ? (
                    <p className="self-center text-sm text-gray-500 dark:text-slate-400">
                      {getNoActionMessage(
                        request.status,
                        currentUserRole,
                      )}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function RequestSummary({
  request,
}: {
  request: EmployeeLeaveRequest;
}) {
  return (
    <section>
      <h3 className="font-semibold text-gray-900 dark:text-white">
        Request details
      </h3>

      <div className="mt-3 grid gap-4 rounded-lg border p-4 sm:grid-cols-2 dark:border-slate-700">
        <SummaryItem
          label="Leave type"
          value={formatLeaveType(
            request.leave_type,
          )}
        />

        <SummaryItem
          label="Dates"
          value={`${formatDate(
            request.start_date,
          )} – ${formatDate(
            request.end_date,
          )}`}
        />

        <SummaryItem
          label="Total days"
          value={formatTotalDays(
            request.total_days,
          )}
        />

        <SummaryItem
          label="Submitted"
          value={
            request.created_at
              ? formatDateTime(
                  request.created_at,
                )
              : "—"
          }
        />

        <div className="sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Reason
          </p>

          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-900 dark:text-slate-200">
            {request.reason?.trim() ||
              "No reason provided."}
          </p>
        </div>
      </div>
    </section>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function TimelineItem({
  step,
  isLast,
}: {
  step: TimelineStep;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      {!isLast ? (
        <div
          className={`absolute left-[11px] top-6 h-[calc(100%-4px)] w-px ${
            step.complete
              ? "bg-emerald-300 dark:bg-emerald-800"
              : step.stopped
                ? "bg-red-200 dark:bg-red-900"
                : "bg-gray-200 dark:bg-slate-700"
          }`}
        />
      ) : null}

      <div className="relative z-10 mt-0.5 shrink-0 bg-white dark:bg-slate-900">
        {step.complete ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        ) : step.current ? (
          <Clock3 className="h-6 w-6 text-blue-600" />
        ) : step.stopped ? (
          <X className="h-6 w-6 rounded-full border border-red-300 p-1 text-red-600 dark:border-red-800" />
        ) : (
          <Circle className="h-6 w-6 text-gray-300 dark:text-slate-600" />
        )}
      </div>

      <div
        className={
          isLast ? "pb-0" : "pb-6"
        }
      >
        <p
          className={`text-sm font-medium ${
            step.current
              ? "text-blue-700 dark:text-blue-300"
              : step.stopped
                ? "text-red-700 dark:text-red-300"
                : "text-gray-900 dark:text-slate-200"
          }`}
        >
          {step.title}
        </p>

        <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
          {step.description}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: LeaveRequestStatus;
}) {
  const classes: Record<
    LeaveRequestStatus,
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

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classes[status]}`}
    >
      {getStatusText(status)}
    </span>
  );
}

function getTimelineSteps(
  request: EmployeeLeaveRequest,
): TimelineStep[] {
  const status = request.status;

  const workflowStopped =
    status === "rejected" ||
    status === "cancelled";

  const managerCompleted =
    Boolean(
      request.manager_approved_at,
    ) ||
    status === "manager_approved" ||
    status === "approved" ||
    status === "hr_approved" ||
    status === "completed";

  const hrCompleted =
    Boolean(request.hr_approved_at) ||
    status === "approved" ||
    status === "hr_approved" ||
    status === "completed";

  const approved =
    status === "approved" ||
    status === "hr_approved" ||
    status === "completed";

  const steps: TimelineStep[] = [
    {
      key: "submitted",
      title: "Request submitted",
      description: request.created_at
        ? formatDateTime(
            request.created_at,
          )
        : "Leave request submitted",
      complete: true,
      current: false,
    },

    {
      key: "manager",
      title: "Manager review",
      description:
        request.manager_approved_at
          ? `Approved ${formatDateTime(
              request.manager_approved_at,
            )}`
          : workflowStopped
            ? "Approval process stopped"
            : "Pending manager review",
      complete: managerCompleted,
      current: status === "pending",
      stopped:
        workflowStopped &&
        !managerCompleted,
    },

    {
      key: "hr",
      title: "HR approval",
      description:
        request.hr_approved_at
          ? `Approved ${formatDateTime(
              request.hr_approved_at,
            )}`
          : workflowStopped
            ? "Approval process stopped"
            : status ===
                "manager_approved"
              ? "Awaiting HR approval"
              : "Waiting for manager approval",
      complete: hrCompleted,
      current:
        status ===
        "manager_approved",
      stopped:
        workflowStopped &&
        !hrCompleted,
    },

    {
      key: "approved",
      title: "Approved",
      description: approved
        ? request.approved_at
          ? `Approved ${formatDateTime(
              request.approved_at,
            )}`
          : "Leave request approved"
        : workflowStopped
          ? "Request was not approved"
          : "Waiting for required approvals",
      complete: approved,
      current:
        status === "approved" ||
        status === "hr_approved",
      stopped:
        workflowStopped && !approved,
    },

    {
      key: "completed",
      title: "Completed",
      description:
        status === "completed"
          ? request.completed_at
            ? `Completed ${formatDateTime(
                request.completed_at,
              )}`
            : "Leave workflow completed"
          : workflowStopped
            ? "Workflow closed"
            : "Leave has not been completed",
      complete: status === "completed",
      current: false,
      stopped: workflowStopped,
    },
  ];

  if (status === "rejected") {
    steps.push({
      key: "rejected",
      title: "Rejected",
      description:
        request.rejected_at
          ? `Rejected ${formatDateTime(
              request.rejected_at,
            )}`
          : "The request was rejected.",
      complete: false,
      current: false,
      stopped: true,
    });
  }

  if (status === "cancelled") {
    steps.push({
      key: "cancelled",
      title: "Cancelled",
      description:
        request.updated_at
          ? `Cancelled or updated ${formatDateTime(
              request.updated_at,
            )}`
          : "The request was cancelled.",
      complete: false,
      current: false,
      stopped: true,
    });
  }

  return steps;
}

function getStatusText(
  status: LeaveRequestStatus,
): string {
  const labels: Record<
    LeaveRequestStatus,
    string
  > = {
    pending:
      "Pending manager review",

    manager_approved:
      "Awaiting HR approval",

    approved: "Approved",

    hr_approved: "Approved",

    completed: "Completed",

    rejected: "Rejected",

    cancelled: "Cancelled",
  };

  return labels[status];
}

function getNoActionMessage(
  status: LeaveRequestStatus,
  role: LeaveUserRole,
): string {
  if (role === "employee") {
    return "You can view this request, but approval actions are restricted.";
  }

  if (
    status === "completed" ||
    status === "rejected" ||
    status === "cancelled"
  ) {
    return "This workflow is closed.";
  }

  if (
    status === "pending" &&
    role === "hr"
  ) {
    return "Manager approval is required before HR review.";
  }

  if (
    status === "manager_approved" &&
    role === "manager"
  ) {
    return "The request is waiting for HR review.";
  }

  if (
    (status === "approved" ||
      status === "hr_approved") &&
    role === "manager"
  ) {
    return "HR or an administrator can complete this request.";
  }

  return "No action is currently required.";
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

function formatDate(
  value: string,
): string {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(year, month - 1, day),
  );
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
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