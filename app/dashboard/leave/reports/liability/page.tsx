import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  Users,
} from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import AnnualReportFilters from "../annual/annual-report-filters";
import { getLeaveReportFilterOptions } from "../services/leave-report.service";
import ExportCsvButton from "./export-csv-button";
import ExportPdfButton from "./export-pdf-button";
import {
  getLeaveLiabilityReport,
  type LeaveLiabilityReportFilters,
} from "./leave-liability-report.service";

type LeaveLiabilityReportPageProps = {
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

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatLeaveType(
  value: string,
): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatPayType(
  value: "salary" | "hourly" | null,
): string {
  if (value === "salary") {
    return "Salary";
  }

  if (value === "hourly") {
    return "Hourly";
  }

  return "Not available";
}

function getLiabilityClasses(
  amount: number,
): string {
  if (amount >= 10_000) {
    return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300";
  }

  if (amount >= 5_000) {
    return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300";
  }

  if (amount > 0) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  return "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-900 dark:text-slate-300";
}

export default async function LeaveLiabilityReportPage({
  searchParams,
}: LeaveLiabilityReportPageProps) {
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

  const filters: LeaveLiabilityReportFilters =
    {
      year: selectedYear,
      employeeId:
        params.employee || undefined,
      departmentId:
        params.department || undefined,
      leaveType:
        params.leaveType || undefined,
    };

  const [report, filterOptions] =
    await Promise.all([
      getLeaveLiabilityReport(
        profile.company_id,
        filters,
      ),
      getLeaveReportFilterOptions(
        profile.company_id,
      ),
    ]);

  const {
    rows,
    departments,
    summary,
  } = report;

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
            Leave Liability Report
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
            Estimate the financial value of
            unused employee leave balances for{" "}
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
                {summary.employeeCount}
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
                Unused days
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatNumber(
                  summary.unusedDays,
                )}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
              <CalendarDays size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Average unused days
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatNumber(
                  summary.averageUnusedDays,
                )}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <BriefcaseBusiness size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Estimated liability
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(
                  summary.estimatedLiability,
                )}
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Banknote size={21} />
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
            Filter liability by year,
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
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Department Liability
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Estimated financial exposure
            grouped by department.
          </p>
        </div>

        {departments.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              No department liability found
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try changing the selected
              filters.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/70">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Department
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Employees
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Unused days
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Estimated liability
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {departments.map(
                    (department) => (
                      <tr
                        key={
                          department.departmentId ??
                          "unassigned"
                        }
                        className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {
                            department.departmentName
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                          {
                            department.employeeCount
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                          {formatNumber(
                            department.unusedDays,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(
                            department.estimatedLiability,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t bg-slate-50 px-5 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              Showing {departments.length}{" "}
              {departments.length === 1
                ? "department"
                : "departments"}
              .
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Employee Liability Details
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Estimated liability by employee
              and leave type.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ExportCsvButton
              year={selectedYear}
              rows={rows}
            />

            <ExportPdfButton
              year={selectedYear}
              rows={rows}
              summary={summary}
              companyName="AI HR Vault"
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-950">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              No leave liability records found
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try changing the selected year
              or removing one of the report
              filters.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/70">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Employee
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Department
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Leave type
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Allocated
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Used
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Unused
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Pay type
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Daily rate
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      Liability
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((row) => (
                    <tr
                      key={`${row.employeeId}-${row.leaveType}`}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {row.employeeName}
                        </p>

                        {row.employeeNumber && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {row.employeeNumber}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {row.departmentName ??
                          "Unassigned"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          {formatLeaveType(
                            row.leaveType,
                          )}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                        {formatNumber(
                          row.allocatedDays,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                        {formatNumber(
                          row.usedDays,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-900 dark:text-slate-100">
                        {formatNumber(
                          row.unusedDays,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {formatPayType(
                          row.payType,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                        {row.dailyRate > 0
                          ? formatCurrency(
                              row.dailyRate,
                            )
                          : "Not available"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getLiabilityClasses(
                            row.estimatedLiability,
                          )}`}
                        >
                          {formatCurrency(
                            row.estimatedLiability,
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t bg-slate-50 px-5 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              Showing {rows.length} liability{" "}
              {rows.length === 1
                ? "record"
                : "records"}
              .
            </div>
          </div>
        )}
      </section>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
        Liability values are estimates based on
        current compensation and unused leave.
        Actual payout obligations may vary by
        company policy and applicable law.
      </div>
    </div>
  );
}