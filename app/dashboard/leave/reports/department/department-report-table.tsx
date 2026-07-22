import type {
  DepartmentLeaveReportRow,
} from "./department-leave-report.service";

type DepartmentReportTableProps = {
  rows: DepartmentLeaveReportRow[];
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

function formatDays(
  value: number,
): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits:
      Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DepartmentReportTable({
  rows,
}: DepartmentReportTableProps) {
  const totalEmployees = new Set(
    rows.flatMap((row) =>
      Array.from(
        { length: row.employeeCount },
        (_, index) =>
          `${row.departmentId ?? "none"}-${index}`,
      ),
    ),
  ).size;

  const totalRequests = rows.reduce(
    (sum, row) =>
      sum + row.requestCount,
    0,
  );

  const totalDays = rows.reduce(
    (sum, row) => sum + row.totalDays,
    0,
  );

  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b px-6 py-4 dark:border-slate-800">
        <h2 className="text-lg font-semibold">
          Department Leave Report
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Approved leave grouped by department and leave type.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="font-medium text-slate-700 dark:text-slate-200">
            No leave records found
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Try changing the year or report filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Department
                </th>

                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Leave Type
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Employees
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Requests
                </th>

                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Total Days
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.map((row) => (
                <tr
                  key={`${row.departmentId ?? "none"}-${row.leaveType}`}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/60"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {row.departmentName}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {formatLeaveType(
                      row.leaveType,
                    )}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                    {row.employeeCount}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                    {row.requestCount}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatDays(
                      row.totalDays,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="border-t bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
              <tr>
                <td
                  colSpan={2}
                  className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100"
                >
                  Totals
                </td>

                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {totalEmployees}
                </td>

                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {totalRequests}
                </td>

                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatDays(totalDays)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}