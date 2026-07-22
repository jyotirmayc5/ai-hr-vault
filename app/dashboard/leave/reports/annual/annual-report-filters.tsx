"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { LeaveReportFilterOptions } from "../services/leave-report.service";

type AnnualReportFiltersProps = {
  filterOptions: LeaveReportFilterOptions;
  currentFilters: {
    year: number;
    employeeId?: string;
    departmentId?: string;
    leaveType?: string;
  };
};

function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear();

  return Array.from(
    { length: 7 },
    (_, index) => currentYear - 5 + index,
  ).reverse();
}

export default function AnnualReportFilters({
  filterOptions,
  currentFilters,
}: AnnualReportFiltersProps) {
  const router = useRouter();

  const [year, setYear] = useState(
    String(currentFilters.year),
  );

  const [employeeId, setEmployeeId] =
    useState(
      currentFilters.employeeId ?? "",
    );

  const [
    departmentId,
    setDepartmentId,
  ] = useState(
    currentFilters.departmentId ?? "",
  );

  const [leaveType, setLeaveType] =
    useState(
      currentFilters.leaveType ?? "",
    );

  const yearOptions = getYearOptions();

  function handleApplyFilters() {
    const searchParams =
      new URLSearchParams();

    if (year) {
      searchParams.set("year", year);
    }

    if (employeeId) {
      searchParams.set(
        "employee",
        employeeId,
      );
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

    const queryString =
      searchParams.toString();

    router.push(
      queryString
        ? `/dashboard/leave/reports/annual?${queryString}`
        : "/dashboard/leave/reports/annual",
    );
  }

  function handleResetFilters() {
    const currentYear =
      new Date().getFullYear();

    setYear(String(currentYear));
    setEmployeeId("");
    setDepartmentId("");
    setLeaveType("");

    router.push(
      `/dashboard/leave/reports/annual?year=${currentYear}`,
    );
  }

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <label
            htmlFor="annual-report-year"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Year
          </label>

          <select
            id="annual-report-year"
            value={year}
            onChange={(event) =>
              setYear(event.target.value)
            }
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
            htmlFor="annual-report-employee"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Employee
          </label>

          <select
            id="annual-report-employee"
            value={employeeId}
            onChange={(event) =>
              setEmployeeId(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">
              All employees
            </option>

            {filterOptions.employees.map(
              (employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.label}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="annual-report-department"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Department
          </label>

          <select
            id="annual-report-department"
            value={departmentId}
            onChange={(event) =>
              setDepartmentId(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
            htmlFor="annual-report-leave-type"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Leave type
          </label>

          <select
            id="annual-report-leave-type"
            value={leaveType}
            onChange={(event) =>
              setLeaveType(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">
              All leave types
            </option>

            {filterOptions.leaveTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type
                    .replaceAll("_", " ")
                    .replace(
                      /\b\w/g,
                      (letter) =>
                        letter.toUpperCase(),
                    )}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleApplyFilters}
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          Apply filters
        </button>

        <button
          type="button"
          onClick={handleResetFilters}
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          Reset
        </button>
      </div>
    </div>
  );
}