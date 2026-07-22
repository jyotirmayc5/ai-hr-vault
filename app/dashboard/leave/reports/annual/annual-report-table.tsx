import type { AnnualLeaveUtilizationRow } from "./annual-leave-report.service";

type AnnualReportTableProps = {
  rows: AnnualLeaveUtilizationRow[];
};

function formatLeaveType(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function getUtilizationLabel(
  percentage: number,
): string {
  if (percentage >= 100) {
    return "Fully utilized";
  }

  if (percentage >= 75) {
    return "High";
  }

  if (percentage >= 40) {
    return "Moderate";
  }

  if (percentage > 0) {
    return "Low";
  }

  return "Not used";
}

function getUtilizationClasses(
  percentage: number,
): string {
  if (percentage >= 100) {
    return "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300";
  }

  if (percentage >= 75) {
    return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300";
  }

  if (percentage >= 40) {
    return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300";
  }

  if (percentage > 0) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  return "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-900 dark:text-slate-300";
}

export default function AnnualReportTable({
  rows,
}: AnnualReportTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          No annual utilization records found
        </h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Try changing the selected year or
          removing one of the report filters.
        </p>
      </div>
    );
  }

  return (
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
                Remaining
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Requests
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Utilization
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => {
              const safePercentage = Math.max(
                0,
                row.utilizationPercentage,
              );

              const progressWidth = Math.min(
                safePercentage,
                100,
              );

              return (
                <tr
                  key={`${row.employeeId}-${row.leaveType}`}
                  className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/50"
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {row.employeeName}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {row.departmentName}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      {formatLeaveType(
                        row.leaveType,
                      )}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                    {formatNumber(
                      row.allocatedDays,
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                    {formatNumber(row.usedDays)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium">
                    <span
                      className={
                        row.remainingDays < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-700 dark:text-slate-300"
                      }
                    >
                      {formatNumber(
                        row.remainingDays,
                      )}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                    {row.requestCount}
                  </td>

                  <td className="min-w-56 px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getUtilizationClasses(
                          safePercentage,
                        )}`}
                      >
                        {getUtilizationLabel(
                          safePercentage,
                        )}
                      </span>

                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {formatNumber(
                          safePercentage,
                        )}
                        %
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all dark:bg-slate-100"
                        style={{
                          width: `${progressWidth}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t bg-slate-50 px-5 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
        Showing {rows.length} annual utilization{" "}
        {rows.length === 1 ? "record" : "records"}.
      </div>
    </div>
  );
}