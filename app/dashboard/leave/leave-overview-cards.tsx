import {
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CircleX,
  PlaneTakeoff,
  Users,
} from "lucide-react";

import type { LeaveDashboardSummary } from "./services/leave-dashboard.service";

interface LeaveOverviewCardsProps {
  summary: LeaveDashboardSummary;
}

interface OverviewCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}

function OverviewCard({
  title,
  value,
  description,
  icon: Icon,
}: OverviewCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <p className="text-3xl font-bold tracking-tight">
            {value.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-muted p-2.5">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export default function LeaveOverviewCards({
  summary,
}: LeaveOverviewCardsProps) {
  const cards: OverviewCardProps[] = [
    {
      title: "Total Requests",
      value: summary.totalRequests,
      description: "All leave requests submitted across the company.",
      icon: CalendarDays,
    },
    {
      title: "Pending Approval",
      value: summary.pendingRequests,
      description: "Requests currently waiting for review.",
      icon: CalendarClock,
    },
    {
      title: "Approved Requests",
      value: summary.approvedRequests,
      description: "Requests approved in the current dataset.",
      icon: CalendarCheck2,
    },
    {
      title: "Rejected Requests",
      value: summary.rejectedRequests,
      description: "Requests that were declined.",
      icon: CircleX,
    },
    {
      title: "Employees on Leave",
      value: summary.employeesOnLeave,
      description: "Employees with approved leave active today.",
      icon: Users,
    },
    {
      title: "Upcoming This Week",
      value: summary.upcomingThisWeek,
      description: "Employees beginning approved leave within seven days.",
      icon: PlaneTakeoff,
    },
  ];

  return (
    <section aria-labelledby="leave-overview-heading">
      <div className="mb-4">
        <h2
          id="leave-overview-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Leave Overview
        </h2>

        <p className="text-sm text-muted-foreground">
          Company-wide leave activity and approval status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <OverviewCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </div>
    </section>
  );
}