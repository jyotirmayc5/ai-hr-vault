import Link from "next/link";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getLeaveReportFilterOptions } from "../services/leave-report.service";
import {
  getMonthlyLeaveReport,
  type MonthlyLeaveReportFilters,
} from "./monthly-leave-report.service";
import MonthlyReportFilters from "./monthly-report-filters";
import MonthlyReportTable from "./monthly-report-table";

type MonthlyLeaveReportPageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
    employee?: string;
    department?: string;
    leaveType?: string;
  }>;
};

function parseYear(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return fallback;
  }

  if (parsed < 2000 || parsed > 2100) {
    return fallback;
  }

  return parsed;
}

function parseMonth(
  value: string | undefined,
  fallback: number,
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return fallback;
  }

  if (parsed < 1 || parsed > 12) {
    return fallback;
  }

  return parsed;
}

function getSearchParam(
  value: string | undefined,
): string | undefined {
  const trimmedValue = value?.trim();

  return trimmedValue || undefined;
}

export default async function MonthlyLeaveReportPage({
  searchParams,
}: MonthlyLeaveReportPageProps) {
  const params = await searchParams;
  const today = new Date();

  const filters: MonthlyLeaveReportFilters = {
    year: parseYear(
      params.year,
      today.getFullYear(),
    ),
    month: parseMonth(
      params.month,
      today.getMonth() + 1,
    ),
    employeeId: getSearchParam(params.employee),
    departmentId: getSearchParam(params.department),
    leaveType: getSearchParam(params.leaveType),
  };

  const supabase =
    await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error(
      "Failed to load monthly leave report profile:",
      profileError,
    );
  }

  if (!profile?.company_id) {
    redirect("/dashboard");
  }

  const [rows, filterOptions] = await Promise.all([
    getMonthlyLeaveReport(
      profile.company_id,
      filters,
    ),
    getLeaveReportFilterOptions(
      profile.company_id,
    ),
  ]);

  const selectedMonth = new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  ).format(
    new Date(
      Date.UTC(filters.year, filters.month - 1, 1),
    ),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Monthly Leave Report
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Approved employee leave for {selectedMonth}.
          </p>
        </div>

        <Link
          href="/dashboard/leave/reports"
          className="inline-flex w-fit items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back to reports
        </Link>
      </div>

      <MonthlyReportFilters
        filterOptions={filterOptions}
        currentFilters={{
          year: filters.year,
          month: filters.month,
          employee: filters.employeeId ?? "",
          department: filters.departmentId ?? "",
          leaveType: filters.leaveType ?? "",
        }}
      />

      <MonthlyReportTable rows={rows} />
    </div>
  );
}