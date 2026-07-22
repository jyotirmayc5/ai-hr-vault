"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { LeaveReportFilterOptions } from "../services/leave-report.service";

type DepartmentReportFiltersProps = {
  filterOptions: LeaveReportFilterOptions;
  currentFilters: {
    year: number;
    departmentId?: string;
    leaveType?: string;
  };
};

function formatLeaveType(
  leaveType: string,
): string {
  return leaveType
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

export default function DepartmentReportFilters({
  filterOptions,
  currentFilters,
}: DepartmentReportFiltersProps) {
  const router = useRouter();

  const [year, setYear] = useState(
    String(currentFilters.year),
  );

  const [departmentId, setDepartmentId] =
    useState(
      currentFilters.departmentId ?? "",
    );

  const [leaveType, setLeaveType] =
    useState(
      currentFilters.leaveType ?? "",
    );

  const currentYear =
    new Date().getFullYear();

  const yearOptions = Array.from(
    { length: 7 },
    (_, index) => currentYear - 5 + index,
  );

  function applyFilters() {
    const searchParams =
      new URLSearchParams();

    if (year) {
      searchParams.set("year", year);
    }

    if (departmentId) {
      searchParams.set(
        "department",
        departmentId,
      );
    }

    if (leaveType) {
      searchParams.set(
        "leaveType",
        leaveType,
      );
    }

    const query =
      searchParams.toString();

    router.push(
      query
        ? `/dashboard/leave/reports/department?${query}`
        : "/dashboard/leave/reports/department",
    );
  }

  function clearFilters() {
    setYear(String(currentYear));
    setDepartmentId("");
    setLeaveType("");

    router.push(
      `/dashboard/leave/reports/department?year=${currentYear}`,
    );
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label
            htmlFor="department-report-year"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Year
          </label>

          <select
            id="department-report-year"
            value={year}
            onChange={(event) =>
              setYear(event.target.value)
            }
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
          >
            {yearOptions.map(
              (yearOption) => (
                <option
                  key={yearOption}
                  value={yearOption}
                >
                  {yearOption}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="department-report-department"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Department
          </label>

          <select
            id="department-report-department"
            value={departmentId}
            onChange={(event) =>
              setDepartmentId(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
          >
            <option value="">
              All departments
            </option>

            {filterOptions.departments.map(
              (department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.label}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="department-report-leave-type"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Leave Type
          </label>

          <select
            id="department-report-leave-type"
            value={leaveType}
            onChange={(event) =>
              setLeaveType(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
          >
            <option value="">
              All leave types
            </option>

            {filterOptions.leaveTypes.map(
              (leaveTypeOption) => (
                <option
                  key={leaveTypeOption}
                  value={leaveTypeOption}
                >
                  {formatLeaveType(
                    leaveTypeOption,
                  )}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
        >
          Clear
        </Button>

        <Button
          type="button"
          onClick={applyFilters}
        >
          Apply filters
        </Button>
      </div>
    </section>
  );
}