"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { LeaveReportFilterOptions } from "../services/leave-report.service";

type CurrentFilters = {
  year: number;
  month: number;
  employee: string;
  department: string;
  leaveType: string;
};

type Props = {
  filterOptions: LeaveReportFilterOptions;
  currentFilters: CurrentFilters;
};

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function formatLeaveType(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function MonthlyReportFilters({
  filterOptions,
  currentFilters,
}: Props) {
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: 7 },
    (_, index) => currentYear - 5 + index,
  );

  const [year, setYear] = useState(currentFilters.year);
  const [month, setMonth] = useState(currentFilters.month);
  const [employee, setEmployee] = useState(
    currentFilters.employee,
  );
  const [department, setDepartment] = useState(
    currentFilters.department,
  );
  const [leaveType, setLeaveType] = useState(
    currentFilters.leaveType,
  );

  function applyFilters() {
    const params = new URLSearchParams();

    params.set("year", String(year));
    params.set("month", String(month));

    if (employee) {
      params.set("employee", employee);
    }

    if (department) {
      params.set("department", department);
    }

    if (leaveType) {
      params.set("leaveType", leaveType);
    }

    router.push(
      `/dashboard/leave/reports/monthly?${params.toString()}`,
    );
  }

  function clearFilters() {
    const today = new Date();

    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setEmployee("");
    setDepartment("");
    setLeaveType("");

    router.push("/dashboard/leave/reports/monthly");
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="space-y-1.5">
          <label
            htmlFor="report-year"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Year
          </label>

          <select
            id="report-year"
            value={year}
            onChange={(event) =>
              setYear(Number(event.target.value))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {years.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="report-month"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Month
          </label>

          <select
            id="report-month"
            value={month}
            onChange={(event) =>
              setMonth(Number(event.target.value))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {months.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="report-employee"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Employee
          </label>

          <select
            id="report-employee"
            value={employee}
            onChange={(event) =>
              setEmployee(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">All employees</option>

            {filterOptions.employees.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="report-department"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Department
          </label>

          <select
            id="report-department"
            value={department}
            onChange={(event) =>
              setDepartment(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">All departments</option>

            {filterOptions.departments.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="report-leave-type"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Leave type
          </label>

          <select
            id="report-leave-type"
            value={leaveType}
            onChange={(event) =>
              setLeaveType(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">All leave types</option>

            {filterOptions.leaveTypes.map((option) => (
              <option key={option} value={option}>
                {formatLeaveType(option)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={applyFilters}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}