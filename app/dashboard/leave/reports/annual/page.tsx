import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarRange,
  CircleGauge,
  Clock3,
  Users,
} from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getLeaveReportFilterOptions } from "../services/leave-report.service";
import AnnualReportFilters from "./annual-report-filters";
import AnnualReportTable from "./annual-report-table";
import {
  getAnnualLeaveUtilization,
  type AnnualLeaveReportFilters,
} from "./annual-leave-report.service";
import ExportCsvButton from "./export-csv-button";
import ExportPdfButton from "./export-pdf-button";

type AnnualLeaveReportPageProps = {
  searchParams: Promise<{
    year?: string;
    employee?: string;
    department?: string;
    leaveType?: string;
  }>;
};

function getValidYear(
  value: string | undefined,
): number {
  const currentYear = new Date().getFullYear();

  if (!value) {
    return currentYear;
  }

  const parsedYear = Number.parseInt(
    value,
    10,
  );

  if (
    !Number.isInteger(parsedYear) ||
    parsedYear < 2000 ||
    parsedYear > currentYear + 5
  ) {
    return currentYear;
  }

  return parsedYear;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function AnnualLeaveReportPage({
  searchParams,
}: AnnualLeaveReportPageProps) {
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

  const selectedYear = getValidYear(
    params.year,
  );

  const filters: AnnualLeaveReportFilters = {
    year: selectedYear,
    employeeId:
      params.employee || undefined,
    departmentId:
      params.department || undefined,
    leaveType:
      params.leaveType || undefined,
  };

  const [rows, filterOptions] =
    await Promise.all([
      getAnnualLeaveUtilization(
        profile.company_id,
        filters,
      ),
      getLeaveReportFilterOptions(
        profile.company_id,
      ),
    ]);

  const employeeCount = new Set(
    rows.map((row) => row.employeeId),
  ).size;

  const totalAllocatedDays = rows.reduce(
    (total, row) =>
      total + row.allocatedDays,
    0,
  );

  const totalUsedDays = rows.reduce(
    (total, row) => total + row.usedDays,
    0,
  );

  const overallUtilization =
    totalAllocatedDays > 0
      ? (totalUsedDays /
          totalAllocatedDays) *
        100
      : 0;

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <Link
          href="/dashboard/leave/reports"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft size={16} />
          Back to leave reports
        </Link>

        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Leave management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Annual Leave Utilization
          </h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Compare allocated, used, and
            remaining leave balances for{" "}
            {selectedYear}.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Employees
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {employeeCount}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Allocated days
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatNumber(
                  totalAllocatedDays,
                )}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
              <CalendarRange size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Used days
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatNumber(
                  totalUsedDays,
                )}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock3 size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Overall utilization
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatNumber(
                  overallUtilization,
                )}
                %
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CircleGauge size={21} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Report filters
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Filter utilization by year,
            employee, department, or leave
            type.
          </p>
        </div>

        <AnnualReportFilters
          filterOptions={filterOptions}
          currentFilters={{
            year: selectedYear,
            employeeId:
              params.employee ?? "",
            departmentId:
              params.department ?? "",
            leaveType:
              params.leaveType ?? "",
          }}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Utilization Details
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Employee leave allocation and
              usage for {selectedYear}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ExportCsvButton
              year={selectedYear}
              rows={rows}
            />

            <ExportPdfButton
              year={selectedYear}
              rows={rows}
              companyName="AI HR Vault"
            />
          </div>
        </div>

        <AnnualReportTable rows={rows} />
      </section>
    </div>
  );
}