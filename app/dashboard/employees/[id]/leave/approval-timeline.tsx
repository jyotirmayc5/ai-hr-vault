import {
  Ban,
  Check,
  Circle,
  Clock3,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import type { EmployeeLeaveRequest } from "@/app/dashboard/employees/services/employee-leave.service";

type ApprovalTimelineProps = {
  request: EmployeeLeaveRequest;
};

type TimelineStepState = "completed" | "current" | "upcoming" | "rejected";

type TimelineStep = {
  key: string;
  title: string;
  description: string;
  date: string | null;
  state: TimelineStepState;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

const STATUS_ORDER: Record<EmployeeLeaveRequest["status"], number> = {
  pending: 1,
  manager_approved: 2,
  approved: 3,
  hr_approved: 3,
  completed: 4,
  rejected: -1,
  cancelled: -2,
};

function formatTimelineDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getStepState(
  stepOrder: number,
  requestStatus: EmployeeLeaveRequest["status"],
): TimelineStepState {
  const currentOrder = STATUS_ORDER[requestStatus];

  if (requestStatus === "rejected") {
    return stepOrder === 1 ? "completed" : "upcoming";
  }

  if (requestStatus === "cancelled") {
    return stepOrder === 1 ? "completed" : "upcoming";
  }

  if (currentOrder > stepOrder) {
    return "completed";
  }

  if (currentOrder === stepOrder) {
    return requestStatus === "completed" ? "completed" : "current";
  }

  return "upcoming";
}

function TimelineIcon({
  state,
  icon: Icon,
}: {
  state: TimelineStepState;
  icon: TimelineStep["icon"];
}) {
  const className =
    state === "completed"
      ? "border-emerald-600 bg-emerald-600 text-white"
      : state === "current"
        ? "border-blue-600 bg-blue-600 text-white"
        : state === "rejected"
          ? "border-red-600 bg-red-600 text-white"
          : "border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500";

  return (
    <div
      className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 ${className}`}
    >
      <Icon className="size-4" />
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
  const connectorClassName =
    step.state === "completed"
      ? "bg-emerald-600"
      : "bg-slate-200 dark:bg-slate-800";

  return (
    <li className="relative flex gap-3">
      {!isLast && (
        <div
          className={`absolute left-[17px] top-9 h-[calc(100%-12px)] w-0.5 ${connectorClassName}`}
        />
      )}

      <TimelineIcon state={step.state} icon={step.icon} />

      <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-6"}`}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p
              className={`text-sm font-medium ${
                step.state === "upcoming"
                  ? "text-slate-500 dark:text-slate-400"
                  : "text-slate-950 dark:text-white"
              }`}
            >
              {step.title}
            </p>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {step.description}
            </p>
          </div>

          {step.date && (
            <time className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
              {step.date}
            </time>
          )}
        </div>

        {step.state === "current" && (
          <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            Current step
          </span>
        )}
      </div>
    </li>
  );
}

export default function ApprovalTimeline({
  request,
}: ApprovalTimelineProps) {
  const submittedDate = formatTimelineDate(request.created_at);
  const managerApprovedDate = formatTimelineDate(
    request.manager_approved_at,
  );
  const hrApprovedDate = formatTimelineDate(request.hr_approved_at);
  const completedDate = formatTimelineDate(request.updated_at);

  const steps: TimelineStep[] = [
    {
      key: "submitted",
      title: "Request submitted",
      description: "The employee submitted the leave request.",
      date: submittedDate,
      state: getStepState(1, request.status),
      icon: Clock3,
    },
    {
      key: "manager",
      title: "Manager approval",
      description:
        request.status === "pending"
          ? "Waiting for the employee's manager to review the request."
          : "The manager review has been completed.",
      date: managerApprovedDate,
      state: getStepState(2, request.status),
      icon: UserCheck,
    },
    {
      key: "hr",
      title: "HR approval",
      description:
        request.status === "manager_approved"
          ? "Waiting for HR to review the request."
          : "The HR review has been completed.",
      date: hrApprovedDate,
      state: getStepState(3, request.status),
      icon: Users,
    },
    {
      key: "completed",
      title: "Leave completed",
      description:
        request.status === "completed"
          ? "The leave workflow has been completed."
          : "The request will be completed after the leave period ends.",
      date: request.status === "completed" ? completedDate : null,
      state: getStepState(4, request.status),
      icon: Check,
    },
  ];

  if (request.status === "rejected") {
    steps.push({
      key: "rejected",
      title: "Request rejected",
      description:
        request.rejection_reason?.trim() ||
        "The leave request was rejected.",
      date: formatTimelineDate(request.rejected_at),
      state: "rejected",
      icon: X,
    });
  }

  if (request.status === "cancelled") {
    steps.push({
      key: "cancelled",
      title: "Request cancelled",
      description: "The leave request was cancelled.",
      date: formatTimelineDate(request.updated_at),
      state: "rejected",
      icon: Ban,
    });
  }

  return (
    <div className="rounded-lg border bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="mb-4 flex items-center gap-2">
        <Circle className="size-4 text-slate-500" />

        <h4 className="text-sm font-semibold text-slate-950 dark:text-white">
          Approval timeline
        </h4>
      </div>

      <ol>
        {steps.map((step, index) => (
          <TimelineItem
            key={step.key}
            step={step}
            isLast={index === steps.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}