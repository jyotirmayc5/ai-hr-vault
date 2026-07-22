import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  getLeaveReportFilterOptions,
} from "../services/leave-report.service";
import {
  getDepartmentLeaveReport,
  type DepartmentLeaveReportFilters,
} from "./department-leave-report.service";
import DepartmentReportFilters from "./department-report-filters";
import DepartmentReportTable from "./department-report-table";

type DepartmentLeaveReportPageProps = {
  searchParams: Promise<{
    year?: string;
    department?: string;
    leaveType?: string;
  }>;
};

function getValidYear(
  value: string | undefined,
): number {
  const currentYear =
    new Date().getFullYear();

  if (!value) {
    return currentYear;
  }

  const parsedYear = Number(value);

  if (
    !Number.isInteger(parsedYear) ||
    parsedYear < 2000 ||
    parsedYear > 2100
  ) {
    return currentYear;
  }

  return parsedYear;
}

export default async function DepartmentLeaveReportPage({
  searchParams,
}: DepartmentLeaveReportPageProps) {
  const params = await searchParams;

  const year = getValidYear(params.year);

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

  const filters: DepartmentLeaveReportFilters =
    {
      year,
      departmentId:
        params.department || undefined,
      leaveType:
        params.leaveType || undefined,
    };

  const [rows, filterOptions] =
    await Promise.all([
      getDepartmentLeaveReport(
        profile.company_id,
        filters,
      ),
      getLeaveReportFilterOptions(
        profile.company_id,
      ),
    ]);

  const departmentCount = new Set(
    rows.map((row) => row.departmentName),
  ).size;

  const totalRequests = rows.reduce(
    (total, row) =>
      total + row.requestCount,
    0,
  );

  const totalDays = rows.reduce(
    (total, row) => total + row.totalDays,
    0,
  );

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/dashboard/leave/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft size={16} />
          Back to leave reports
        </Link>

        <div className="mt-5">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Leave management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Department Leave Report
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Review approved leave usage grouped
            by department and leave type.
          </p>
        </div>
      </header>

        <DepartmentReportFilters
        filterOptions={filterOptions}
        currentFilters={{
            year,
            departmentId:
            params.department || undefined,
            leaveType:
            params.leaveType || undefined,
        }}
        />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Departments
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {departmentCount}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
              <Building2 size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Leave requests
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalRequests}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <ClipboardList size={22} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total leave days
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalDays.toFixed(2)}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CalendarDays size={22} />
            </div>
          </div>
        </div>
      </section>

      <DepartmentReportTable rows={rows} />
    </div>
  );
}