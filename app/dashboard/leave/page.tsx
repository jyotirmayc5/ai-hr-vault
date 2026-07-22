import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import DepartmentLeaveTable from "./department-leave-table";
import LeaveOverviewCards from "./leave-overview-cards";
import LeaveStatusChart from "./leave-status-chart";
import LeaveTypeChart from "./leave-type-chart";
import UpcomingLeaveTable from "./upcoming-leave-table";
import { getLeaveDashboard } from "./services/leave-dashboard.service";
import EmployeesOutToday from "./employees-out-today";

export const dynamic = "force-dynamic";

export default async function LeaveDashboardPage() {
  const dashboard =
    await getLeaveDashboard();

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Leave Dashboard
          </h1>

          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Monitor company-wide leave requests,
            approvals, upcoming absences, and
            department usage.
          </p>
        </div>

        <Link
          href="/dashboard/leave/calendar"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <CalendarDays className="h-4 w-4" />
          Company calendar
        </Link>
      </header>

      <section
        aria-label="Leave calendar"
        className="overflow-hidden rounded-2xl border bg-card shadow-sm"
      >
        <Link
          href="/dashboard/leave/calendar"
          className="group flex flex-col gap-4 p-5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <CalendarDays className="h-6 w-6" />
            </div>

            <div>
              <h2 className="font-semibold">
                Company Leave Calendar
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                View approved leave, company
                holidays, and employees who are
                scheduled to be out across the
                organization.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            Open calendar

            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </section>

      <LeaveOverviewCards
        summary={dashboard.summary}
      />
      <EmployeesOutToday
    employees={dashboard.employeesOutToday}
    />

      <section
        aria-label="Leave analytics"
        className="grid gap-6 xl:grid-cols-2"
      >
        <LeaveStatusChart
          data={dashboard.statusCounts}
        />

        <LeaveTypeChart
          data={dashboard.typeCounts}
        />
      </section>

      <UpcomingLeaveTable
        leave={dashboard.upcomingLeave}
      />

      <DepartmentLeaveTable
        departments={
          dashboard.departmentLeave
        }
      />
    </main>
  );
}