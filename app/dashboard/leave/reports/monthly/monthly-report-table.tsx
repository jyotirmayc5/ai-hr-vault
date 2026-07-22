import type { MonthlyLeaveReportRow } from "./monthly-leave-report.service";

type Props = {
  rows: MonthlyLeaveReportRow[];
};

function formatLeaveType(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDays(value: number): string {
  return Number.isInteger(value)
    ? value.toString()
    : value.toFixed(2);
}

export default function MonthlyReportTable({
  rows,
}: Props) {
  const totalRequests = rows.reduce(
    (total, row) => total + row.requestCount,
    0,
  );

  const totalDays = rows.reduce(
    (total, row) => total + row.totalDays,
    0,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Monthly Leave Summary
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Approved leave grouped by employee and leave type.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            No leave records found
          </p>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Try selecting a different month or changing the filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-gray-50 dark:bg-slate-950">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Employee
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Department
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Leave Type
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Requests
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  Days
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {rows.map((row) => (
                <tr
                  key={`${row.employeeId}-${row.leaveType}`}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {row.employeeName}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                    {row.departmentName ?? "Unassigned"}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300">
                    {formatLeaveType(row.leaveType)}
                  </td>

                  <td className="px-5 py-4 text-right text-sm text-gray-600 dark:text-slate-300">
                    {row.requestCount}
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                    {formatDays(row.totalDays)}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="border-t border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Total
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  {totalRequests}
                </td>

                <td className="px-5 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDays(totalDays)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}