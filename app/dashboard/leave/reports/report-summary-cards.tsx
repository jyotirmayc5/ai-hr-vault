import {
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { EmployeeLeaveHistoryRow } from "./services/leave-report.service";

type ReportSummaryCardsProps = {
  rows: EmployeeLeaveHistoryRow[];
};

type SummaryCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

const APPROVED_STATUSES = new Set([
  "approved",
  "hr_approved",
  "completed",
]);

const PENDING_STATUSES = new Set([
  "pending",
  "manager_approved",
]);

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>

        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold">
          {value}
        </div>

        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default function ReportSummaryCards({
  rows,
}: ReportSummaryCardsProps) {
  const totalRequests = rows.length;

  const approvedRequests = rows.filter(
    (row) =>
      APPROVED_STATUSES.has(row.status),
  ).length;

  const pendingRequests = rows.filter(
    (row) =>
      PENDING_STATUSES.has(row.status),
  ).length;

  const rejectedRequests = rows.filter(
    (row) => row.status === "rejected",
  ).length;

  const totalLeaveDays = rows
    .filter((row) =>
      APPROVED_STATUSES.has(row.status),
    )
    .reduce(
      (total, row) =>
        total + row.totalDays,
      0,
    );

  const formattedLeaveDays =
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(totalLeaveDays);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        title="Total Requests"
        value={totalRequests}
        description="Requests matching the filters"
        icon={FileText}
      />

      <SummaryCard
        title="Approved"
        value={approvedRequests}
        description="Approved and completed requests"
        icon={CheckCircle2}
      />

      <SummaryCard
        title="Pending"
        value={pendingRequests}
        description="Awaiting manager or HR action"
        icon={Clock3}
      />

      <SummaryCard
        title="Rejected"
        value={rejectedRequests}
        description="Rejected leave requests"
        icon={XCircle}
      />

      <SummaryCard
        title="Approved Days"
        value={formattedLeaveDays}
        description="Total approved leave days"
        icon={CheckCircle2}
      />
    </div>
  );
}