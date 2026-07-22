import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  CircleGauge,
  FileText,
  Landmark,
} from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import ReportFilters from "./components/leave-report-filters";
import ReportTable from "./report-table";
import {
  getEmployeeLeaveHistory,
  getLeaveReportFilterOptions,
  type LeaveReportFilters,
  type LeaveReportStatus,
} from "./services/leave-report.service";

type LeaveReportsPageProps = {
  searchParams: Promise<{
    employee?: string;
    department?: string;
    leaveType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
};

function isLeaveReportStatus(
  value: string | undefined,
): value is LeaveReportStatus {
  return (
    value === "pending" ||
    value === "manager_approved" ||
    value === "approved" ||
    value === "hr_approved" ||
    value === "rejected" ||
    value === "cancelled" ||
    value === "completed"
  );
}

export default async function LeaveReportsPage({
  searchParams,
}: LeaveReportsPageProps) {
  const params = await searchParams;

  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile?.company_id
  ) {
    throw new Error(
      profileError?.message ??
        "Your account is not associated with a company.",
    );
  }

  const selectedStatus =
    isLeaveReportStatus(params.status)
      ? params.status
      : undefined;

  const filters: LeaveReportFilters = {
    employeeId:
      params.employee || undefined,
    departmentId:
      params.department || undefined,
    leaveType:
      params.leaveType || undefined,
    status: selectedStatus,
    startDate:
      params.startDate || undefined,
    endDate:
      params.endDate || undefined,
  };

  const [rows, filterOptions] =
    await Promise.all([
      getEmployeeLeaveHistory(
        profile.company_id,
        filters,
      ),
      getLeaveReportFilterOptions(
        profile.company_id,
      ),
    ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Leave management
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Leave Reports
        </h1>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Review employee leave history and open
          detailed monthly, department, annual
          utilization, or liability reports.
        </p>
      </header>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Available reports
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select a report to review leave
            activity in more detail.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/dashboard/leave/reports/monthly"
            className="group rounded-xl border bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  <CalendarDays size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Monthly Leave Report
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    View leave requests and total
                    leave days by employee for a
                    selected month.
                  </p>
                </div>
              </div>

              <ChevronRight
                size={20}
                className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>
          </Link>

          <Link
            href="/dashboard/leave/reports/department"
            className="group rounded-xl border bg-white p-6 shadow-sm transition hover:border-violet-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-violet-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                  <Building2 size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Department Leave Report
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Review approved leave usage
                    grouped by department and
                    leave type.
                  </p>
                </div>
              </div>

              <ChevronRight
                size={20}
                className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600"
              />
            </div>
          </Link>

          <Link
            href="/dashboard/leave/reports/annual"
            className="group rounded-xl border bg-white p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <CircleGauge size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Annual Leave Utilization
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Compare annual leave allocation,
                    usage, remaining balances, and
                    utilization rates.
                  </p>
                </div>
              </div>

              <ChevronRight
                size={20}
                className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
              />
            </div>
          </Link>

          <Link
            href="/dashboard/leave/reports/liability"
            className="group rounded-xl border bg-white p-6 shadow-sm transition hover:border-amber-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-amber-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <Landmark size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Leave Liability Report
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Estimate the financial value of
                    unused leave balances by
                    employee and department.
                  </p>
                </div>
              </div>

              <ChevronRight
                size={20}
                className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-amber-600"
              />
            </div>
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <FileText size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Employee Leave History
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Search individual leave requests
              using the filters below.
            </p>
          </div>
        </div>

        <ReportFilters
          filterOptions={filterOptions}
          currentFilters={{
            employeeId:
              params.employee ?? "",
            departmentId:
              params.department ?? "",
            leaveType:
              params.leaveType ?? "",
            status: isLeaveReportStatus(
              params.status,
            )
              ? params.status
              : "",
            startDate:
              params.startDate ?? "",
            endDate:
              params.endDate ?? "",
          }}
        />

        <ReportTable rows={rows} />
      </section>
    </div>
  );
}