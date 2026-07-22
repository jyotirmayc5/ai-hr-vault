import {
  Check,
  Circle,
  CircleCheckBig,
  Clock3,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";

import type { EmployeeLeaveRequest } from "@/app/dashboard/employees/services/employee-leave.service";

interface LeaveApprovalTimelineProps {
  request: EmployeeLeaveRequest;
}

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  date: string | null;
  state: "completed" | "current" | "upcoming" | "rejected";
  icon: typeof Circle;
}

export default function LeaveApprovalTimeline({
  request,
}: LeaveApprovalTimelineProps) {
  const steps = buildTimelineSteps(request);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Approval Timeline
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Current progress for this leave request.
        </p>
      </div>

      <ol className="space-y-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLastStep = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className="relative flex gap-3"
            >
              {!isLastStep ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-[15px] top-8 h-[calc(100%-0.25rem)] w-px ${
                    step.state === "completed"
                      ? "bg-green-300"
                      : step.state === "rejected"
                        ? "bg-red-300"
                        : "bg-border"
                  }`}
                />
              ) : null}

              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${getStepIconStyles(
                  step.state,
                )}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p
                    className={`text-sm font-medium ${getStepTextStyles(
                      step.state,
                    )}`}
                  >
                    {step.label}
                  </p>

                  {step.date ? (
                    <time className="text-xs text-muted-foreground">
                      {formatDateTime(step.date)}
                    </time>
                  ) : null}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function buildTimelineSteps(
  request: EmployeeLeaveRequest,
): TimelineStep[] {
  const isRejected = request.status === "rejected";
  const isCancelled = request.status === "cancelled";

  const managerCompleted = Boolean(
    request.manager_approved_at ||
      request.status === "manager_approved" ||
      request.status === "hr_approved" ||
      request.status === "completed",
  );

  const hrCompleted = Boolean(
    request.hr_approved_at ||
      request.status === "hr_approved" ||
      request.status === "completed",
  );

  const leaveCompleted = Boolean(
    request.completed_at ||
      request.status === "completed",
  );

  const submittedState: TimelineStep["state"] = "completed";

  let managerState: TimelineStep["state"] = "upcoming";
  let hrState: TimelineStep["state"] = "upcoming";
  let completedState: TimelineStep["state"] = "upcoming";

  if (managerCompleted) {
    managerState = "completed";
  } else if (request.status === "pending") {
    managerState = "current";
  }

  if (hrCompleted) {
    hrState = "completed";
  } else if (request.status === "manager_approved") {
    hrState = "current";
  }

  if (leaveCompleted) {
    completedState = "completed";
  } else if (request.status === "hr_approved") {
    completedState = "current";
  }

  if (isRejected || isCancelled) {
    if (!managerCompleted) {
      managerState = isRejected ? "rejected" : "upcoming";
    } else if (!hrCompleted) {
      hrState = isRejected ? "rejected" : "upcoming";
    } else if (!leaveCompleted) {
      completedState = isRejected ? "rejected" : "upcoming";
    }
  }

  const steps: TimelineStep[] = [
    {
      id: "submitted",
      label: "Submitted",
      description: "The employee submitted the leave request.",
      date: request.created_at,
      state: submittedState,
      icon: Check,
    },
    {
      id: "manager-approval",
      label:
        managerState === "rejected"
          ? "Manager Review Rejected"
          : "Manager Approval",
      description: getManagerDescription(
        managerState,
        request.status,
      ),
      date: request.manager_approved_at,
      state: managerState,
      icon:
        managerState === "rejected"
          ? XCircle
          : UserCheck,
    },
    {
      id: "hr-approval",
      label:
        hrState === "rejected"
          ? "HR Review Rejected"
          : "HR Approval",
      description: getHrDescription(
        hrState,
        request.status,
      ),
      date: request.hr_approved_at,
      state: hrState,
      icon:
        hrState === "rejected"
          ? XCircle
          : ShieldCheck,
    },
    {
      id: "completed",
      label:
        completedState === "rejected"
          ? "Completion Stopped"
          : "Completed",
      description: getCompletionDescription(
        completedState,
        request.status,
      ),
      date: request.completed_at,
      state: completedState,
      icon:
        completedState === "completed"
          ? CircleCheckBig
          : completedState === "rejected"
            ? XCircle
            : Clock3,
    },
  ];

  if (isRejected) {
    steps.push({
      id: "rejected",
      label: "Request Rejected",
      description:
        request.rejection_reason?.trim() ||
        "The leave request was rejected.",
      date: request.updated_at,
      state: "rejected",
      icon: XCircle,
    });
  }

  if (isCancelled) {
    steps.push({
      id: "cancelled",
      label: "Request Cancelled",
      description: "The leave request was cancelled.",
      date: request.updated_at,
      state: "rejected",
      icon: XCircle,
    });
  }

  return steps;
}

function getManagerDescription(
  state: TimelineStep["state"],
  status: EmployeeLeaveRequest["status"],
): string {
  if (state === "completed") {
    return "The employee’s manager approved this request.";
  }

  if (state === "current") {
    return "Waiting for the employee’s manager to review the request.";
  }

  if (state === "rejected") {
    return "The request was rejected before manager approval was completed.";
  }

  if (status === "cancelled") {
    return "Manager approval is no longer required.";
  }

  return "Manager review has not started.";
}

function getHrDescription(
  state: TimelineStep["state"],
  status: EmployeeLeaveRequest["status"],
): string {
  if (state === "completed") {
    return "Human Resources approved this request.";
  }

  if (state === "current") {
    return "Waiting for Human Resources to review the request.";
  }

  if (state === "rejected") {
    return "The request was rejected during HR review.";
  }

  if (
    status === "rejected" ||
    status === "cancelled"
  ) {
    return "HR approval is no longer required.";
  }

  return "HR review begins after manager approval.";
}

function getCompletionDescription(
  state: TimelineStep["state"],
  status: EmployeeLeaveRequest["status"],
): string {
  if (state === "completed") {
    return "The approval workflow has been completed.";
  }

  if (state === "current") {
    return "The request is approved and ready to be completed.";
  }

  if (state === "rejected") {
    return "The workflow cannot be completed because the request was rejected.";
  }

  if (
    status === "rejected" ||
    status === "cancelled"
  ) {
    return "The workflow will not continue.";
  }

  return "Completion occurs after manager and HR approval.";
}

function getStepIconStyles(
  state: TimelineStep["state"],
): string {
  switch (state) {
    case "completed":
      return "border-green-200 bg-green-50 text-green-700";

    case "current":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "rejected":
      return "border-red-200 bg-red-50 text-red-700";

    case "upcoming":
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function getStepTextStyles(
  state: TimelineStep["state"],
): string {
  switch (state) {
    case "completed":
      return "text-green-700";

    case "current":
      return "text-blue-700";

    case "rejected":
      return "text-red-700";

    case "upcoming":
    default:
      return "text-muted-foreground";
  }
}

function formatDateTime(value: string): string {
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