"use client";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";

import type {
  LeaveReportFilterOptions,
  LeaveReportStatus,
} from "../services/leave-report.service";

type CurrentFilters = {
  employeeId: string;
  departmentId: string;
  leaveType: string;
  status: LeaveReportStatus | "";
  startDate: string;
  endDate: string;
};

type ReportFiltersProps = {
  filterOptions: LeaveReportFilterOptions;
  currentFilters: CurrentFilters;
};

const statuses: Array<{
  value: LeaveReportStatus;
  label: string;
}> = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "manager_approved",
    label: "Manager Approved",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "hr_approved",
    label: "HR Approved",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "completed",
    label: "Completed",
  },
];

function formatLeaveType(
  value: string,
): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default function ReportFilters({
  filterOptions,
  currentFilters,
}: ReportFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [employeeId, setEmployeeId] =
    useState(currentFilters.employeeId);

  const [departmentId, setDepartmentId] =
    useState(currentFilters.departmentId);

  const [leaveType, setLeaveType] =
    useState(currentFilters.leaveType);

  const [status, setStatus] = useState<
    LeaveReportStatus | ""
  >(currentFilters.status);

  const [startDate, setStartDate] =
    useState(currentFilters.startDate);

  const [endDate, setEndDate] =
    useState(currentFilters.endDate);

  function applyFilters() {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    const values: Record<string, string> = {
      employee: employeeId,
      department: departmentId,
      leaveType,
      status,
      startDate,
      endDate,
    };

    Object.entries(values).forEach(
      ([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      },
    );

    const query = params.toString();

    router.push(
      query
        ? `/dashboard/leave/reports?${query}`
        : "/dashboard/leave/reports",
    );
  }

  function clearFilters() {
    setEmployeeId("");
    setDepartmentId("");
    setLeaveType("");
    setStatus("");
    setStartDate("");
    setEndDate("");

    router.push(
      "/dashboard/leave/reports",
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-1.5">
          <label
            htmlFor="employee"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Employee
          </label>

          <select
            id="employee"
            value={employeeId}
            onChange={(event) =>
              setEmployeeId(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">
              All employees
            </option>

            {filterOptions.employees.map(
              (option) => (
                <option
                  key={option.id}
                  value={option.id}
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="department"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Department
          </label>

          <select
            id="department"
            value={departmentId}
            onChange={(event) =>
              setDepartmentId(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">
              All departments
            </option>

            {filterOptions.departments.map(
              (option) => (
                <option
                  key={option.id}
                  value={option.id}
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="leaveType"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Leave type
          </label>

          <select
            id="leaveType"
            value={leaveType}
            onChange={(event) =>
              setLeaveType(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
                  {formatLeaveType(type)}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="status"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as
                  | LeaveReportStatus
                  | "",
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">
              All statuses
            </option>

            {statuses.map((option) => (
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
            htmlFor="startDate"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Start date
          </label>

          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="endDate"
            className="text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            End date
          </label>

          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(event) =>
              setEndDate(
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={applyFilters}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}